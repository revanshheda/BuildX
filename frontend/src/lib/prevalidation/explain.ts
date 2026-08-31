// SIH 26130 --- Module 07: Explainability & Recovery Guidance
// -----------------------------------------------------------------------------
// Turns raw issues into (a) human-readable audit lines that never hide WHY an
// application failed, WHAT requirement was violated and HOW it affects
// readiness, and (b) an ordered recovery plan telling the applicant exactly how
// to fix each problem and whether re-validation is required afterwards.
//
// Failure reasons are surfaced verbatim — the engine is a transparent gate, not
// a black box.
// -----------------------------------------------------------------------------

import type {
  DagImpact,
  OverallStatus,
  RecoveryStep,
  ValidationIssue,
} from './types';
import { compareIssues, severityRank } from './severity';

// ----------------------------------------------------------------------------
// Per-issue explanation
// ----------------------------------------------------------------------------

/** A single audit line for an issue: WHY -> WHAT -> HOW. */
export function explainIssue(issue: ValidationIssue): string {
  const tag = `[${issue.severity}]`;
  const conf = issue.confidence !== 'HIGH' ? ` (confidence: ${issue.confidence})` : '';
  return (
    `${tag} ${issue.approvalCode} · ${issue.target}${conf}\n` +
    `   Why: ${issue.reason}\n` +
    `   Requirement: ${issue.requirementViolated}\n` +
    `   Readiness impact: ${issue.readinessImpact}\n` +
    `   Fix: ${issue.recommendedAction}` +
    (issue.requiresRevalidation ? ' (re-validation required after fixing)' : '')
  );
}

// ----------------------------------------------------------------------------
// Overall explainability
// ----------------------------------------------------------------------------

const VERDICT_HEADLINE: Record<OverallStatus, string> = {
  READY_TO_SUBMIT: 'READY TO SUBMIT — all configured blocking checks passed.',
  BLOCKED: 'BLOCKED — one or more blocking issues must be resolved before submission.',
  REVIEW_REQUIRED:
    'REVIEW REQUIRED — ambiguous or conflicting evidence needs manual review before submission.',
  PARTIALLY_VALID:
    'PARTIALLY VALID — no hard blockers, but unresolved warnings must be acknowledged; the application does not auto-pass.',
};

export function buildExplainability(
  overallStatus: OverallStatus,
  issues: ValidationIssue[],
  aggregateImpact: DagImpact,
): string[] {
  const lines: string[] = [];
  lines.push(VERDICT_HEADLINE[overallStatus]);

  const sorted = [...issues].sort(compareIssues);
  const blocking = sorted.filter((i) => i.severity === 'BLOCKING');
  const review = sorted.filter((i) => i.severity === 'REVIEW_REQUIRED');
  const warnings = sorted.filter((i) => i.severity === 'WARNING');

  if (blocking.length > 0) {
    lines.push(`\nBlocking issues (${blocking.length}):`);
    for (const i of blocking) lines.push(explainIssue(i));
  }
  if (review.length > 0) {
    lines.push(`\nManual review required (${review.length}):`);
    for (const i of review) lines.push(explainIssue(i));
  }
  if (warnings.length > 0) {
    lines.push(`\nWarnings (${warnings.length}):`);
    for (const i of warnings) lines.push(explainIssue(i));
  }

  lines.push(`\nApproval graph impact: ${aggregateImpact.explanation}`);
  if (aggregateImpact.blockedNodes.length > 0) {
    lines.push(`  Blocked nodes: ${aggregateImpact.blockedNodes.join(', ')}`);
  }
  if (aggregateImpact.lockedNodes.length > 0) {
    lines.push(`  Locked (downstream) nodes: ${aggregateImpact.lockedNodes.join(', ')}`);
  }
  if (aggregateImpact.criticalPath.length > 0) {
    lines.push(
      `  Critical path: ${aggregateImpact.criticalPath.join(' -> ')}` +
        (aggregateImpact.affectsCriticalPath ? '  [IMPACTED]' : '  [intact]'),
    );
  }

  return lines;
}

// ----------------------------------------------------------------------------
// Recovery plan
// ----------------------------------------------------------------------------

/**
 * Ordered, de-duplicated recovery steps. Blocking fixes come first, then review
 * items, then warnings. INFO issues are advisory and excluded.
 */
export function buildRecovery(issues: ValidationIssue[]): RecoveryStep[] {
  const actionable = issues.filter((i) => i.severity !== 'INFO');
  const sorted = [...actionable].sort(compareIssues);

  const steps: RecoveryStep[] = [];
  const seen = new Set<string>();
  for (const issue of sorted) {
    // De-duplicate identical guidance (same action on the same node).
    const key = `${issue.approvalCode}::${issue.recommendedAction}`;
    if (seen.has(key)) continue;
    seen.add(key);

    steps.push({
      issueId: issue.id,
      action: issue.recommendedAction,
      requiresRevalidation: issue.requiresRevalidation,
      deepLink: issue.fixDeepLink,
    });
  }
  return steps;
}

/** Whether any remaining issue requires a re-validation pass after fixes. */
export function anyRequiresRevalidation(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.severity !== 'INFO' && i.requiresRevalidation);
}

/** Convenience: the highest-severity rank present (for quick comparisons). */
export function topSeverityRank(issues: ValidationIssue[]): number {
  return issues.reduce((min, i) => Math.min(min, severityRank(i.severity)), Number.POSITIVE_INFINITY);
}
