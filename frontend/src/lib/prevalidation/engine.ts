// SIH 26130 --- Module 07: Pre-Validation Orchestration Engine
// -----------------------------------------------------------------------------
// The single public entry point. Composes the three validation levels, maps
// every finding onto the Approval Dependency Graph, propagates downstream locks,
// resolves the overall readiness verdict, and assembles a fully explainable
// result (issues, discrepancy matrix, DAG impact, recovery plan, audit lines).
//
//   runPrevalidation(context) -> PrevalidationResult
//
// Deterministic and dependency-free. Deep AI/OCR/registry interpretation is an
// optional extension point; when unavailable the engine falls back to
// deterministic checks and NEVER silently auto-passes ambiguous evidence.
// -----------------------------------------------------------------------------

import type {
  ApprovalDag,
  CategoryCount,
  DagImpact,
  IssueCategory,
  NodeResult,
  NodeValidationStatus,
  PrevalidationContext,
  PrevalidationResult,
  PrevalidationSummary,
  ValidationIssue,
} from './types';
import { COLD_STORAGE_CONFIG } from './config/cold-storage.config';
import { buildApprovalDag, aggregateImpact, propagateLocks } from './approval-dag';
import {
  compareIssues,
  nodeStatusFromIssues,
  resolveOverallStatus,
} from './severity';
import { runLevel1 } from './level1-structural';
import { runLevel2 } from './level2-consistency';
import { runLevel3 } from './level3-workflow';
import { buildExplainability, buildRecovery } from './explain';
import { anyInterpreterAvailable, defaultInterpreters } from './extension-points';
import { getNodeMap, nodeLabel, resolveNow } from './internal';

export function runPrevalidation(rawContext: PrevalidationContext): PrevalidationResult {
  // 1. Resolve config + interpreters (honest about deep-interpretation status).
  const config = rawContext.config ?? COLD_STORAGE_CONFIG;
  const interpreters = rawContext.interpreters ?? defaultInterpreters();
  const context: PrevalidationContext = { ...rawContext, config, interpreters };
  const { iso: generatedAt } = resolveNow(context);

  const notes: string[] = [];
  if (!anyInterpreterAvailable(interpreters)) {
    notes.push(
      'Deep document interpretation (OCR / semantic / registry) is not available; ' +
        'deterministic checks were used. Ambiguous evidence is escalated to manual review, never auto-passed.',
    );
  }

  // 2. Build the approval DAG from the evaluated rule nodes + configured edges.
  const dag = buildApprovalDag(context.approvalNodes, config.dagEdges);

  // 3. Run the three levels.
  const l1 = runLevel1(context, dag);
  const l2 = runLevel2(context, dag);
  const l3 = runLevel3(context, dag);

  const issues: ValidationIssue[] = [...l1.issues, ...l2.issues, ...l3.issues];
  const documentEvaluations = l1.documentEvaluations;
  const discrepancyMatrix = l2.discrepancies;

  // 4. Determine the submission target (drives the verdict scope).
  const targetCode = resolveTargetCode(context);

  // 5. Own status per node -> propagate downstream locks.
  const ownStatus = computeOwnStatus(context, dag, issues);
  const propagation = propagateLocks(dag, ownStatus);

  // 6. Aggregate DAG impact for the whole run.
  const aggregate = aggregateImpact(dag, propagation, targetCode);

  // 7. If the target is LOCKED by an upstream prerequisite, surface an explicit,
  //    blocking dependency issue so the lock is never silent.
  if (targetCode && propagation.status[targetCode] === 'LOCKED') {
    issues.push(buildLockIssue(context, dag, targetCode, propagation.lockedBy[targetCode] ?? [], aggregate));
  }

  // 8. Resolve the overall verdict from the issues relevant to the target.
  const relevantIssues = targetCode
    ? issues.filter((i) => i.approvalCode === targetCode)
    : issues;
  const overallStatus = resolveOverallStatus(relevantIssues);

  // 9. Sort + partition issues for the report.
  const sortedIssues = [...issues].sort(compareIssues);
  const blockingIssues = sortedIssues.filter((i) => i.severity === 'BLOCKING');
  const reviewItems = sortedIssues.filter((i) => i.severity === 'REVIEW_REQUIRED');
  const warnings = sortedIssues.filter((i) => i.severity === 'WARNING');

  // 10. Node results + summary + explainability + recovery.
  const nodeResults = buildNodeResults(context, dag, propagation.status, propagation.lockedBy, sortedIssues);
  const summary = buildSummary(context, dag, sortedIssues, documentEvaluations, propagation.status, aggregate);
  const explainability = buildExplainability(overallStatus, sortedIssues, aggregate);
  const recovery = buildRecovery(sortedIssues);

  return {
    targetApprovalCode: targetCode,
    overallStatus,
    generatedAt,
    summary,
    issues: sortedIssues,
    blockingIssues,
    reviewItems,
    warnings,
    discrepancyMatrix,
    documentEvaluations,
    nodeResults,
    dagImpact: aggregate,
    recovery,
    explainability,
    notes,
  };
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function resolveTargetCode(context: PrevalidationContext): string | undefined {
  const targets = context.applications.filter((a) => a.isTargetForSubmission);
  if (targets.length === 1) return targets[0].approvalCode;
  if (context.applications.length === 1) return context.applications[0].approvalCode;
  return undefined;
}

/**
 * Own (pre-propagation) status for every DAG node:
 *   - externally-known status wins (e.g. an upstream node already APPROVED);
 *   - else, if an application was validated for the node, derive it from that
 *     node's own issues;
 *   - else NOT_EVALUATED (never optimistically READY).
 */
function computeOwnStatus(
  context: PrevalidationContext,
  dag: ApprovalDag,
  issues: ValidationIssue[],
): Record<string, NodeValidationStatus> {
  const appCodes = new Set(context.applications.map((a) => a.approvalCode));
  const issuesByCode = groupByCode(issues);

  const ownStatus: Record<string, NodeValidationStatus> = {};
  for (const code of Object.keys(dag.nodes)) {
    const known = context.knownNodeStatus?.[code];
    if (known) {
      ownStatus[code] = known;
    } else if (appCodes.has(code)) {
      ownStatus[code] = nodeStatusFromIssues(issuesByCode[code] ?? []);
    } else {
      ownStatus[code] = 'NOT_EVALUATED';
    }
  }
  return ownStatus;
}

function groupByCode(issues: ValidationIssue[]): Record<string, ValidationIssue[]> {
  const map: Record<string, ValidationIssue[]> = {};
  for (const i of issues) {
    (map[i.approvalCode] ??= []).push(i);
  }
  return map;
}

function buildLockIssue(
  context: PrevalidationContext,
  dag: ApprovalDag,
  targetCode: string,
  lockedBy: string[],
  aggregate: DagImpact,
): ValidationIssue {
  const nodeMap = getNodeMap(context);
  const { name: targetName } = nodeLabel(nodeMap, targetCode);
  const prereqNames = lockedBy.map((c) => nodeLabel(nodeMap, c).name);
  return {
    id: `DEP-${targetCode}-LOCKED`,
    level: 'WORKFLOW',
    category: 'DEPENDENCY',
    severity: 'BLOCKING',
    confidence: 'HIGH',
    status: 'FAILED',
    approvalCode: targetCode,
    target: 'Upstream prerequisites',
    reason: `${targetName} is locked because prerequisite approval(s) are not clear: ${prereqNames.join(', ') || 'unknown'}.`,
    requirementViolated: `All prerequisites of ${targetName} must be clear before it can proceed.`,
    readinessImpact: aggregate.explanation,
    dagImpact: aggregate,
    recommendedAction: `Resolve the blocking issues on prerequisite approval(s) (${prereqNames.join(', ') || 'see graph'}) first, then re-validate.`,
    requiresRevalidation: true,
  };
}

function buildNodeResults(
  context: PrevalidationContext,
  dag: ApprovalDag,
  status: Record<string, NodeValidationStatus>,
  lockedBy: Record<string, string[]>,
  issues: ValidationIssue[],
): NodeResult[] {
  const nodeMap = getNodeMap(context);
  const issuesByCode = groupByCode(issues);

  return dag.topoOrder.map((code) => {
    const nodeIssues = issuesByCode[code] ?? [];
    const { name, authority } = nodeLabel(nodeMap, code);
    return {
      approvalCode: code,
      approvalName: name,
      authority,
      status: status[code] ?? 'NOT_EVALUATED',
      blockingCount: nodeIssues.filter((i) => i.severity === 'BLOCKING').length,
      reviewCount: nodeIssues.filter((i) => i.severity === 'REVIEW_REQUIRED').length,
      warningCount: nodeIssues.filter((i) => i.severity === 'WARNING').length,
      lockedByPrerequisites: lockedBy[code] ?? [],
    };
  });
}

function buildSummary(
  context: PrevalidationContext,
  dag: ApprovalDag,
  issues: ValidationIssue[],
  documentEvaluations: PrevalidationResult['documentEvaluations'],
  status: Record<string, NodeValidationStatus>,
  aggregate: DagImpact,
): PrevalidationSummary {
  const config = context.config as NonNullable<PrevalidationContext['config']>;

  const blockedNodes: string[] = [];
  const lockedNodes: string[] = [];
  for (const code of dag.topoOrder) {
    if (status[code] === 'BLOCKED') blockedNodes.push(code);
    else if (status[code] === 'LOCKED') lockedNodes.push(code);
  }

  const affected = new Set<string>();
  for (const i of issues) affected.add(i.approvalCode);
  for (const c of blockedNodes) affected.add(c);
  for (const c of lockedNodes) affected.add(c);

  return {
    totalBlockingIssues: issues.filter((i) => i.severity === 'BLOCKING').length,
    totalWarnings: issues.filter((i) => i.severity === 'WARNING').length,
    totalReviewItems: issues.filter((i) => i.severity === 'REVIEW_REQUIRED').length,
    totalDiscrepancies: issues.filter((i) => i.level === 'CONSISTENCY').length,
    affectedApprovalNodes: [...affected].sort(),
    blockedNodes,
    lockedNodes,
    criticalPathImpacted: aggregate.affectsCriticalPath,
    checkCounts: buildCheckCounts(context, config, issues, documentEvaluations),
  };
}

function buildCheckCounts(
  context: PrevalidationContext,
  config: NonNullable<PrevalidationContext['config']>,
  issues: ValidationIssue[],
  documentEvaluations: PrevalidationResult['documentEvaluations'],
): Partial<Record<IssueCategory, CategoryCount>> {
  let fieldTotal = 0;
  let declTotal = 0;
  let consTotal = 0;
  for (const app of context.applications) {
    const cfg = config.approvals[app.approvalCode];
    if (!cfg) continue;
    fieldTotal += cfg.requiredFields.length;
    if (cfg.declarationRequired) declTotal += 1;
    consTotal += cfg.consistencyRules.length;
  }

  const clamp = (n: number): number => (n < 0 ? 0 : n);
  const fieldFailed = issues.filter((i) => i.category === 'REQUIRED_FIELD').length;
  const docPassed = documentEvaluations.filter((d) => d.acceptable).length;
  const declBlocking = issues.filter(
    (i) => i.category === 'DECLARATION' && i.severity === 'BLOCKING',
  ).length;
  const consFailed = issues.filter((i) => i.category === 'CONSISTENCY').length;

  return {
    REQUIRED_FIELD: { passed: clamp(fieldTotal - fieldFailed), total: fieldTotal },
    REQUIRED_DOCUMENT: { passed: docPassed, total: documentEvaluations.length },
    DECLARATION: { passed: clamp(declTotal - declBlocking), total: declTotal },
    CONSISTENCY: { passed: clamp(consTotal - consFailed), total: consTotal },
  };
}
