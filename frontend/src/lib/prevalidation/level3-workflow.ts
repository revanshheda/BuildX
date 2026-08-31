// SIH 26130 --- Module 07: LEVEL 3 --- Workflow & Policy Validation
// -----------------------------------------------------------------------------
// The final policy gate before an application is declared submission-ready:
//   - the selected approval ROUTE is valid and its conditions hold
//     (e.g. FSSAI Central vs State; food-storage requirement; capacity band);
//   - each supplied document is valid EVIDENCE for the workflow stage it is
//     being used at (a planning-stage doc is not final-stage evidence);
//   - the application is being submitted at the correct workflow stage;
//   - any externally-known prerequisite approvals are actually in place
//     (within-run prerequisite cascades are handled by the engine's DAG
//     propagation, so this only consults known external statuses).
//
// Pure + deterministic.
// -----------------------------------------------------------------------------

import type {
  ApprovalDag,
  ApplicationValidationInput,
  PrevalidationContext,
  RoutePolicy,
  ValidationIssue,
} from './types';
import { singleNodeImpact } from './approval-dag';
import {
  buildIssue,
  getNodeMap,
  normalizeText,
  nodeLabel,
  readProfileValue,
} from './internal';
import { evaluateDocument, resolveAttachment } from './level1-structural';

export interface Level3Output {
  issues: ValidationIssue[];
}

export function runLevel3(context: PrevalidationContext, dag: ApprovalDag): Level3Output {
  const nodeMap = getNodeMap(context);
  const config = context.config;
  const now = new Date(context.now ?? new Date().toISOString());

  const issues: ValidationIssue[] = [];

  for (const app of context.applications) {
    const approvalConfig = config?.approvals[app.approvalCode];
    if (!approvalConfig) continue;

    const node = nodeMap[app.approvalCode];
    const { name: nodeName } = nodeLabel(nodeMap, app.approvalCode);
    const nodeStage = node?.stage ?? approvalConfig.stage;
    const effectiveStage = app.workflowStage ?? nodeStage;

    // --- 3a. Route validity --------------------------------------------------
    issues.push(...checkRoute(context, app, dag, approvalConfig.routes, approvalConfig.defaultRoute, nodeName));

    // --- 3b. Application submitted at the correct stage ----------------------
    if (app.workflowStage && normalizeText(app.workflowStage) !== normalizeText(nodeStage)) {
      issues.push(
        buildIssue({
          id: `L3-${app.approvalCode}-STAGE`,
          level: 'WORKFLOW',
          category: 'STAGE_POLICY',
          severity: 'REVIEW_REQUIRED',
          confidence: 'MEDIUM',
          approvalCode: app.approvalCode,
          target: 'Workflow stage',
          reason: `Application is being submitted at stage '${app.workflowStage}', but ${nodeName} belongs to stage '${nodeStage}'.`,
          requirementViolated: `${nodeName} must be submitted at its designated workflow stage ('${nodeStage}').`,
          recommendedAction: `Submit ${nodeName} at the '${nodeStage}' stage, or correct the selected stage.`,
          dagImpact: singleNodeImpact(dag, app.approvalCode, false),
        }),
      );
    }

    // --- 3c. Document is valid evidence for this stage -----------------------
    for (const docReq of approvalConfig.requiredDocuments) {
      if (!docReq.supportsStages || docReq.supportsStages.length === 0) continue;
      const { record, overrideState } = resolveAttachment(context, app, docReq.docCode);
      const evaluation = evaluateDocument(docReq, record, overrideState, now, context);
      // Only meaningful when the document is actually usable.
      if (!evaluation.acceptable) continue;

      const supports = docReq.supportsStages.some(
        (s) => normalizeText(s) === normalizeText(effectiveStage),
      );
      if (!supports) {
        issues.push(
          buildIssue({
            id: `L3-${app.approvalCode}-DOCSTAGE-${docReq.docCode}`,
            level: 'WORKFLOW',
            category: 'STAGE_POLICY',
            severity: 'REVIEW_REQUIRED',
            confidence: 'MEDIUM',
            approvalCode: app.approvalCode,
            target: docReq.docName,
            sourceDocument: docReq.docCode,
            reason: `'${docReq.docName}' is valid evidence for stage(s) ${docReq.supportsStages.join(', ')}, not the current stage '${effectiveStage}'.`,
            requirementViolated: `'${docReq.docName}' must be appropriate evidence for the '${effectiveStage}' stage.`,
            recommendedAction: `Provide a stage-appropriate version of '${docReq.docName}' for '${effectiveStage}'.`,
            dagImpact: singleNodeImpact(dag, app.approvalCode, false),
          }),
        );
      }
    }

    // --- 3d. Externally-known prerequisite readiness (submission target) -----
    if (app.isTargetForSubmission && node) {
      issues.push(...checkKnownPrerequisites(context, app, dag, nodeName));
    }
  }

  return { issues };
}

// ----------------------------------------------------------------------------
// Route validity
// ----------------------------------------------------------------------------

function checkRoute(
  context: PrevalidationContext,
  app: ApplicationValidationInput,
  dag: ApprovalDag,
  routes: RoutePolicy[] | undefined,
  defaultRoute: string | undefined,
  nodeName: string,
): ValidationIssue[] {
  if (!routes || routes.length === 0) return [];
  const out: ValidationIssue[] = [];

  const selected = app.selectedRoute ?? defaultRoute;
  if (!selected) {
    out.push(
      buildIssue({
        id: `L3-${app.approvalCode}-ROUTE-NONE`,
        level: 'WORKFLOW',
        category: 'ROUTE_POLICY',
        severity: 'REVIEW_REQUIRED',
        confidence: 'MEDIUM',
        approvalCode: app.approvalCode,
        target: 'Approval route',
        reason: 'No approval route was selected and no default route is configured.',
        requirementViolated: `${nodeName} requires an explicit approval route.`,
        recommendedAction: 'Select the appropriate approval route.',
        dagImpact: singleNodeImpact(dag, app.approvalCode, false),
      }),
    );
    return out;
  }

  const match = routes.find((r) => r.route === selected);
  if (!match) {
    out.push(
      buildIssue({
        id: `L3-${app.approvalCode}-ROUTE-INVALID`,
        level: 'WORKFLOW',
        category: 'ROUTE_POLICY',
        severity: 'BLOCKING',
        approvalCode: app.approvalCode,
        target: 'Approval route',
        reason: `Selected route '${selected}' is not a configured route for ${nodeName}.`,
        requirementViolated: `${nodeName} must use one of: ${routes.map((r) => r.route).join(', ')}.`,
        recommendedAction: `Select a valid approval route (${routes.map((r) => r.route).join(', ')}).`,
        dagImpact: singleNodeImpact(dag, app.approvalCode, true),
        meta: { selectedRoute: selected },
      }),
    );
    return out;
  }

  // Food-storage condition.
  if (match.requiresFoodStorage === true) {
    const isFood = Boolean(readProfileValue(context, 'isFoodStorage'));
    if (!isFood) {
      out.push(
        buildIssue({
          id: `L3-${app.approvalCode}-ROUTE-FOOD`,
          level: 'WORKFLOW',
          category: 'ROUTE_POLICY',
          severity: 'BLOCKING',
          approvalCode: app.approvalCode,
          target: 'Route eligibility (food storage)',
          reason: `Route '${match.route}' applies only to food storage, but the profile indicates non-food storage.`,
          requirementViolated: `'${match.route}' requires a food-storage facility.`,
          recommendedAction:
            'Select the correct route for a non-food facility, or correct the food-storage flag in the profile.',
          dagImpact: singleNodeImpact(dag, app.approvalCode, true),
        }),
      );
    }
  }

  // Capacity band.
  const capacity = Number(readProfileValue(context, 'storageCapacityMt'));
  if (!Number.isNaN(capacity)) {
    if (typeof match.minCapacityMt === 'number' && capacity < match.minCapacityMt) {
      out.push(routeCapacityIssue(app, dag, match, nodeName, `below the minimum ${match.minCapacityMt} MT`));
    }
    if (typeof match.maxCapacityMt === 'number' && capacity > match.maxCapacityMt) {
      out.push(routeCapacityIssue(app, dag, match, nodeName, `above the maximum ${match.maxCapacityMt} MT`));
    }
  }

  return out;
}

function routeCapacityIssue(
  app: ApplicationValidationInput,
  dag: ApprovalDag,
  route: RoutePolicy,
  nodeName: string,
  breach: string,
): ValidationIssue {
  return buildIssue({
    id: `L3-${app.approvalCode}-ROUTE-CAPACITY`,
    level: 'WORKFLOW',
    category: 'ROUTE_POLICY',
    severity: 'BLOCKING',
    approvalCode: app.approvalCode,
    target: 'Route eligibility (capacity)',
    reason: `Facility capacity is ${breach} for route '${route.route}'.`,
    requirementViolated: `'${route.route}' is only valid within its configured capacity band.`,
    recommendedAction: `Select the route that matches the facility capacity for ${nodeName}.`,
    dagImpact: singleNodeImpact(dag, app.approvalCode, true),
    meta: { route: route.route },
  });
}

// ----------------------------------------------------------------------------
// Externally-known prerequisite readiness
// ----------------------------------------------------------------------------

function checkKnownPrerequisites(
  context: PrevalidationContext,
  app: ApplicationValidationInput,
  dag: ApprovalDag,
  nodeName: string,
): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const prerequisites = dag.nodes[app.approvalCode]?.prerequisites ?? [];

  for (const prereq of prerequisites) {
    const status = context.knownNodeStatus?.[prereq];
    if (!status || status === 'APPROVED') continue; // unknown -> engine handles; approved -> fine

    const hardBlocked = status === 'BLOCKED' || status === 'LOCKED';
    const { name: prereqName } = nodeLabel(getNodeMap(context), prereq);
    out.push(
      buildIssue({
        id: `L3-${app.approvalCode}-PREREQ-${prereq}`,
        level: 'WORKFLOW',
        category: 'DEPENDENCY',
        severity: hardBlocked ? 'BLOCKING' : 'REVIEW_REQUIRED',
        confidence: hardBlocked ? 'HIGH' : 'MEDIUM',
        approvalCode: app.approvalCode,
        target: `Prerequisite: ${prereqName}`,
        reason: `Prerequisite approval '${prereqName}' is '${status}', not APPROVED.`,
        requirementViolated: `${nodeName} cannot be submitted until '${prereqName}' is approved.`,
        recommendedAction: `Obtain approval for '${prereqName}' before submitting ${nodeName}.`,
        dagImpact: singleNodeImpact(dag, prereq, hardBlocked),
      }),
    );
  }

  return out;
}
