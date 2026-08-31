// SIH 26130 --- Module 07: LEVEL 2 --- Cross-Document Consistency
// -----------------------------------------------------------------------------
// Deterministic cross-record comparison. Reads values from the application form,
// the business profile, the (optional) external registry snapshot, declarations
// and any AI/OCR-extracted document fields, then compares them per configured
// rules to produce the cross-document DISCREPANCY MATRIX.
//
// Principles:
//   - Contradictions are never ignored: a genuine mismatch is BLOCKING (or
//     REVIEW_REQUIRED when confidence is only medium/low).
//   - Cosmetic-only differences (equal after normalization) are surfaced as
//     WARNINGs, not blocks.
//   - A comparison with a missing side is "not comparable" and is skipped, so
//     absent optional data never fabricates a discrepancy.
//
// No file contents are read here; DOCUMENT-sourced values exist only when an
// interpreter extension point populated `extracted` (otherwise skipped).
// -----------------------------------------------------------------------------

import type {
  ApprovalDag,
  ApplicationValidationInput,
  Confidence,
  ConsistencyRule,
  DiscrepancyRow,
  PrevalidationContext,
  RecordKind,
  RecordRef,
  Severity,
  ValidationIssue,
  ValueSpec,
} from './types';
import { applyConfidence } from './severity';
import { singleNodeImpact } from './approval-dag';
import {
  buildIssue,
  displayValue,
  getNodeMap,
  isPresent,
  nodeLabel,
  normalizeEntity,
  normalizeText,
  readProfileValue,
} from './internal';

export interface Level2Output {
  issues: ValidationIssue[];
  discrepancies: DiscrepancyRow[];
}

export function runLevel2(context: PrevalidationContext, dag: ApprovalDag): Level2Output {
  const nodeMap = getNodeMap(context);
  const config = context.config;

  const issues: ValidationIssue[] = [];
  const discrepancies: DiscrepancyRow[] = [];

  for (const app of context.applications) {
    const approvalConfig = config?.approvals[app.approvalCode];
    if (!approvalConfig) continue;
    const { name: nodeName } = nodeLabel(nodeMap, app.approvalCode);

    for (const rule of approvalConfig.consistencyRules) {
      // Route-scoped rule that does not apply to the selected route.
      if (rule.onlyForRoute && app.selectedRoute !== rule.onlyForRoute) continue;

      const a = resolveSpec(context, app, rule.a);
      const b = resolveSpec(context, app, rule.b);

      // Not comparable -> skip (never a false positive).
      if (!a.present || !b.present) continue;

      const outcome = compare(rule, a.value, b.value);
      if (outcome === 'MATCH') continue;

      const { severity, confidence } = severityFor(rule, outcome);
      const blocking = severity === 'BLOCKING';
      const impact = singleNodeImpact(dag, app.approvalCode, blocking);
      const affectedApprovalPath = blocking
        ? [app.approvalCode, ...impact.lockedNodes]
        : [app.approvalCode];

      const recordA = toRef(rule.a);
      const recordB = toRef(rule.b);
      const valueA = displayValue(a.value);
      const valueB = displayValue(b.value);

      const explanation =
        outcome === 'SOFT'
          ? `${rule.attribute}: values match after normalization but differ cosmetically ('${valueA}' vs '${valueB}').`
          : `${rule.attribute}: ${recordA.label} value '${valueA}' does not match ${recordB.label} value '${valueB}'.`;

      discrepancies.push({
        id: `L2-${app.approvalCode}-${rule.id}`,
        recordA,
        recordB,
        attribute: rule.attribute,
        valueA,
        valueB,
        mismatchType: rule.mismatchType,
        severity,
        confidence,
        affectedApprovalPath,
        dagImpact: impact,
        blocking,
        recommendedAction: rule.recommendedAction,
        explanation,
      });

      issues.push(
        buildIssue({
          id: `L2-${app.approvalCode}-${rule.id}`,
          level: 'CONSISTENCY',
          category: 'CONSISTENCY',
          severity,
          confidence,
          approvalCode: app.approvalCode,
          target: rule.attribute,
          reason: explanation,
          requirementViolated: `${rule.attribute} must be consistent across records for ${nodeName}.`,
          recommendedAction: rule.recommendedAction,
          dagImpact: impact,
          meta: { mismatchType: rule.mismatchType, valueA, valueB, outcome },
        }),
      );
    }
  }

  return { issues, discrepancies };
}

// ----------------------------------------------------------------------------
// Value resolution
// ----------------------------------------------------------------------------

interface ResolvedValue {
  value: unknown;
  present: boolean;
}

function resolveSpec(
  context: PrevalidationContext,
  app: ApplicationValidationInput,
  spec: ValueSpec,
): ResolvedValue {
  let value: unknown;
  switch (spec.kind) {
    case 'PROFILE':
      value = readProfileValue(context, spec.path);
      break;
    case 'APPLICATION':
      value = app.formData[spec.path];
      break;
    case 'REGISTRY':
      value = context.registry
        ? (context.registry as Record<string, unknown>)[spec.path]
        : undefined;
      break;
    case 'DECLARATION':
      value = app.declaration
        ? (app.declaration as unknown as Record<string, unknown>)[spec.path]
        : undefined;
      break;
    case 'DOCUMENT': {
      // Only available if an interpreter populated extracted fields.
      const doc = context.vault.find((d) => d.docCode === spec.docCode);
      value = doc?.extracted ? doc.extracted[spec.path] : undefined;
      break;
    }
    default:
      value = undefined;
  }
  return { value, present: isPresent(value) };
}

function toRef(spec: ValueSpec): RecordRef {
  const kind: RecordKind = spec.kind;
  const ref = spec.kind === 'DOCUMENT' ? `${spec.docCode}.${spec.path}` : spec.path;
  return { kind, ref, label: spec.label };
}

// ----------------------------------------------------------------------------
// Comparison
// ----------------------------------------------------------------------------

type CompareOutcome = 'MATCH' | 'SOFT' | 'MATERIAL' | 'AMBIGUOUS';

function compare(rule: ConsistencyRule, aVal: unknown, bVal: unknown): CompareOutcome {
  switch (rule.comparator) {
    case 'EXACT':
      return String(aVal) === String(bVal) ? 'MATCH' : 'MATERIAL';

    case 'NORMALIZED_TEXT': {
      if (String(aVal) === String(bVal)) return 'MATCH';
      const useEntity =
        rule.mismatchType === 'ENTITY_MISMATCH' ||
        rule.mismatchType === 'REGISTRY_INCONSISTENCY';
      const na = useEntity ? normalizeEntity(aVal) : normalizeText(aVal);
      const nb = useEntity ? normalizeEntity(bVal) : normalizeText(bVal);
      if (na === nb) return 'SOFT'; // cosmetic-only difference
      return 'MATERIAL';
    }

    case 'NUMERIC_TOLERANCE': {
      const na = Number(String(aVal));
      const nb = Number(String(bVal));
      if (Number.isNaN(na) || Number.isNaN(nb)) return 'AMBIGUOUS';
      const denom = Math.max(Math.abs(nb), 1e-9);
      const relDiff = Math.abs(na - nb) / denom;
      return relDiff <= (rule.tolerance ?? 0) ? 'MATCH' : 'MATERIAL';
    }

    case 'BOOLEAN':
      return Boolean(aVal) === Boolean(bVal) ? 'MATCH' : 'MATERIAL';

    case 'ENUM':
      return normalizeText(aVal) === normalizeText(bVal) ? 'MATCH' : 'MATERIAL';

    default:
      return 'MATCH';
  }
}

function severityFor(
  rule: ConsistencyRule,
  outcome: CompareOutcome,
): { severity: Severity; confidence: Confidence } {
  if (outcome === 'SOFT') {
    return {
      severity: rule.severityOnSoftMismatch ?? 'WARNING',
      confidence: 'MEDIUM',
    };
  }
  if (outcome === 'AMBIGUOUS') {
    // Values present but not comparable (e.g. non-numeric) -> human review.
    return { severity: 'REVIEW_REQUIRED', confidence: 'LOW' };
  }
  // MATERIAL contradiction: apply confidence-driven adjustment.
  const confidence = rule.confidence ?? 'HIGH';
  return {
    severity: applyConfidence(rule.severityOnMismatch, confidence),
    confidence,
  };
}
