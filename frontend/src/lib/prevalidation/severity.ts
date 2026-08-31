// SIH 26130 --- Module 07: Severity, Confidence & Decision Model
// -----------------------------------------------------------------------------
// Central home for the decision logic that turns raw findings into severities
// and an overall readiness verdict. Keeping this in one place makes the policy
// auditable and prevents ad-hoc thresholds scattered across validators.
//
// Locked decision principles (from the module brief):
//   - Missing required data                      => BLOCKING
//   - Contradictory evidence across records       => BLOCKING or REVIEW_REQUIRED
//                                                    (by confidence)
//   - Invalid document for the selected route      => BLOCKING
//   - Expired document                             => BLOCKING (until replaced)
//   - Stale document                               => REVIEW_REQUIRED (gates auto-pass)
//   - Warning-only issues                          => never auto-pass silently
//   - Ambiguous evidence                           => escalate to REVIEW_REQUIRED
// -----------------------------------------------------------------------------

import type {
  CheckStatus,
  Confidence,
  DocumentState,
  NodeValidationStatus,
  OverallStatus,
  Severity,
  ValidationIssue,
} from './types';

// ----------------------------------------------------------------------------
// Ranking helpers
// ----------------------------------------------------------------------------

const SEVERITY_RANK: Record<Severity, number> = {
  BLOCKING: 0,
  REVIEW_REQUIRED: 1,
  WARNING: 2,
  INFO: 3,
};

const CONFIDENCE_RANK: Record<Confidence, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function severityRank(severity: Severity): number {
  return SEVERITY_RANK[severity];
}

export function confidenceRank(confidence: Confidence): number {
  return CONFIDENCE_RANK[confidence];
}

/** A blocking issue hard-stops submission. */
export function blocksSubmission(severity: Severity): boolean {
  return severity === 'BLOCKING';
}

/**
 * An issue "gates" submission when it prevents an automatic READY_TO_SUBMIT.
 * Both BLOCKING and REVIEW_REQUIRED gate; warnings do not auto-pass but do not
 * gate a human-acknowledged submission.
 */
export function gatesAutoPass(severity: Severity): boolean {
  return severity === 'BLOCKING' || severity === 'REVIEW_REQUIRED';
}

// ----------------------------------------------------------------------------
// Confidence-driven severity
// ----------------------------------------------------------------------------

/**
 * Adjust a base severity by confidence. A material contradiction detected with
 * low confidence is escalated to REVIEW_REQUIRED — NEVER quietly downgraded to a
 * warning. This enforces "ambiguous => manual review, not auto-approval".
 */
export function applyConfidence(base: Severity, confidence: Confidence): Severity {
  if (base === 'BLOCKING') {
    if (confidence === 'HIGH') return 'BLOCKING';
    // Medium/low certainty on a material contradiction => human review.
    return 'REVIEW_REQUIRED';
  }
  if (base === 'REVIEW_REQUIRED') {
    return 'REVIEW_REQUIRED';
  }
  // WARNING / INFO are advisory and unaffected by confidence.
  return base;
}

/**
 * Severity for a *material* cross-record contradiction given confidence.
 * (Cosmetic / normalized-equal differences are handled by the caller as a soft
 * mismatch and typically mapped to WARNING.)
 */
export function contradictionSeverity(confidence: Confidence): Severity {
  return applyConfidence('BLOCKING', confidence);
}

// ----------------------------------------------------------------------------
// Document-state severity
// ----------------------------------------------------------------------------

/**
 * Severity implied by a document's effective state for a requirement.
 * Returns null when the state is acceptable and no issue should be raised.
 */
export function documentStateSeverity(
  state: DocumentState,
  requireVerified: boolean,
): Severity | null {
  switch (state) {
    case 'MISSING':
      return 'BLOCKING';
    case 'REJECTED':
      return 'BLOCKING';
    case 'EXPIRED':
      return 'BLOCKING';
    case 'INVALID':
      return 'BLOCKING';
    case 'STALE':
      // Staleness is a heuristic (document predates a material change). It gates
      // auto-pass and requires human confirmation, but is not a hard block.
      return 'REVIEW_REQUIRED';
    case 'UPLOADED':
      // Present but unverified: blocking only when verification is required.
      return requireVerified ? 'BLOCKING' : null;
    case 'APPROVED':
      return null;
    default:
      return null;
  }
}

// ----------------------------------------------------------------------------
// Status mapping
// ----------------------------------------------------------------------------

/** Default CheckStatus for a severity (issues may override). */
export function severityToCheckStatus(severity: Severity): CheckStatus {
  switch (severity) {
    case 'BLOCKING':
      return 'FAILED';
    case 'REVIEW_REQUIRED':
      return 'REVIEW_REQUIRED';
    case 'WARNING':
      return 'WARNING';
    case 'INFO':
      return 'NOT_CHECKED';
    default:
      return 'NOT_CHECKED';
  }
}

/** Reduce a node's own issues to its own (pre-propagation) status. */
export function nodeStatusFromIssues(issues: ValidationIssue[]): NodeValidationStatus {
  let hasReview = false;
  for (const issue of issues) {
    if (issue.severity === 'BLOCKING') return 'BLOCKED';
    if (issue.severity === 'REVIEW_REQUIRED') hasReview = true;
  }
  return hasReview ? 'REVIEW' : 'READY';
}

// ----------------------------------------------------------------------------
// Overall status resolution
// ----------------------------------------------------------------------------

/**
 * Resolve the overall readiness verdict from a set of issues.
 * Precedence: BLOCKED > REVIEW_REQUIRED > PARTIALLY_VALID > READY_TO_SUBMIT.
 */
export function resolveOverallStatus(issues: ValidationIssue[]): OverallStatus {
  let hasBlocking = false;
  let hasReview = false;
  let hasWarning = false;

  for (const issue of issues) {
    if (issue.severity === 'BLOCKING') hasBlocking = true;
    else if (issue.severity === 'REVIEW_REQUIRED') hasReview = true;
    else if (issue.severity === 'WARNING') hasWarning = true;
  }

  if (hasBlocking) return 'BLOCKED';
  if (hasReview) return 'REVIEW_REQUIRED';
  if (hasWarning) return 'PARTIALLY_VALID';
  return 'READY_TO_SUBMIT';
}

/** Whether a verdict permits the application to actually be submitted. */
export function permitsSubmission(status: OverallStatus): boolean {
  return status === 'READY_TO_SUBMIT';
}

/** Stable comparator to sort issues by severity, then confidence, then id. */
export function compareIssues(a: ValidationIssue, b: ValidationIssue): number {
  const s = severityRank(a.severity) - severityRank(b.severity);
  if (s !== 0) return s;
  const c = confidenceRank(a.confidence) - confidenceRank(b.confidence);
  if (c !== 0) return c;
  return a.id.localeCompare(b.id);
}
