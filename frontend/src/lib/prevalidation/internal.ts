// SIH 26130 --- Module 07: Shared internal helpers for the validators
// -----------------------------------------------------------------------------
// Pure, dependency-free helpers used by all three validation levels. Kept in one
// place so field access, date math, text normalization and issue construction
// behave identically everywhere. This module imports only types + the severity
// and DAG helpers, so it never creates a cycle with the level validators.
// -----------------------------------------------------------------------------

import type {
  Confidence,
  DagImpact,
  IssueCategory,
  PrevalidationContext,
  Severity,
  ValidationIssue,
  ValidationLevel,
} from './types';
import type { ApprovalRuleResult } from '../rule-engine';
import { severityToCheckStatus } from './severity';

// ----------------------------------------------------------------------------
// Node lookup
// ----------------------------------------------------------------------------

export function getNodeMap(
  context: PrevalidationContext,
): Record<string, ApprovalRuleResult> {
  const map: Record<string, ApprovalRuleResult> = {};
  for (const n of context.approvalNodes) map[n.code] = n;
  return map;
}

export interface NodeLabel {
  name: string;
  authority: string;
}

export function nodeLabel(
  nodeMap: Record<string, ApprovalRuleResult>,
  code: string,
): NodeLabel {
  const n = nodeMap[code];
  return {
    name: n?.name ?? code,
    authority: n?.authorityName ?? 'Unknown authority',
  };
}

// ----------------------------------------------------------------------------
// Time
// ----------------------------------------------------------------------------

/** Resolve the "current" instant for a run (context.now overrides the clock). */
export function resolveNow(context: PrevalidationContext): { date: Date; iso: string } {
  const iso = context.now ?? new Date().toISOString();
  return { date: new Date(iso), iso };
}

export function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

// ----------------------------------------------------------------------------
// Value presence + access
// ----------------------------------------------------------------------------

/** A value counts as "present" unless it is null/undefined, an empty/blank
 * string, or an empty array. Numbers (including 0) and booleans are present. */
export function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function readProfileValue(context: PrevalidationContext, path: string): unknown {
  return (context.profile as unknown as Record<string, unknown>)[path];
}

/** Render a value for display in issues / the discrepancy matrix. */
export function displayValue(value: unknown): string {
  if (value === undefined) return '(undefined)';
  if (value === null) return '(null)';
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[object]';
    }
  }
  return String(value);
}

// ----------------------------------------------------------------------------
// Text normalization (shared by consistency comparisons)
// ----------------------------------------------------------------------------

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CORP_SUFFIXES = new Set([
  'pvt',
  'private',
  'ltd',
  'limited',
  'llp',
  'inc',
  'incorporated',
  'co',
  'company',
  'corp',
  'corporation',
]);

/** Entity-name normalization: normalizeText plus removal of corporate suffixes,
 * so "FreshChain Cold Logistics Pvt. Ltd." and "freshchain cold logistics"
 * compare as the same registered entity. */
export function normalizeEntity(value: unknown): string {
  return normalizeText(value)
    .split(' ')
    .filter((tok) => tok.length > 0 && !CORP_SUFFIXES.has(tok))
    .join(' ')
    .trim();
}

// ----------------------------------------------------------------------------
// File type inference
// ----------------------------------------------------------------------------

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
};

/** Best-effort MIME from a filename extension; undefined when unknown. */
export function inferMimeType(fileName: string | undefined): string | undefined {
  if (!fileName) return undefined;
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return undefined;
  return EXT_TO_MIME[m[1]];
}

// ----------------------------------------------------------------------------
// Issue construction
// ----------------------------------------------------------------------------

export interface IssueInput {
  id: string;
  level: ValidationLevel;
  category: IssueCategory;
  severity: Severity;
  confidence?: Confidence; // default HIGH
  approvalCode: string;
  target: string;
  reason: string;
  requirementViolated: string;
  recommendedAction: string;
  dagImpact: DagImpact;
  sourceDocument?: string;
  readinessImpact?: string; // defaults to dagImpact.explanation
  requiresRevalidation?: boolean; // default true
  fixDeepLink?: string;
  meta?: Record<string, unknown>;
}

/** Central factory so every issue has a consistent, fully-populated shape. */
export function buildIssue(input: IssueInput): ValidationIssue {
  return {
    id: input.id,
    level: input.level,
    category: input.category,
    severity: input.severity,
    confidence: input.confidence ?? 'HIGH',
    status: severityToCheckStatus(input.severity),
    approvalCode: input.approvalCode,
    target: input.target,
    sourceDocument: input.sourceDocument,
    reason: input.reason,
    requirementViolated: input.requirementViolated,
    readinessImpact: input.readinessImpact ?? input.dagImpact.explanation,
    dagImpact: input.dagImpact,
    recommendedAction: input.recommendedAction,
    requiresRevalidation: input.requiresRevalidation ?? true,
    fixDeepLink: input.fixDeepLink,
    meta: input.meta,
  };
}
