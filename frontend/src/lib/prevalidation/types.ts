// SIH 26130 --- Module 07: DEEP DOCUMENT PRE-VALIDATION
// -----------------------------------------------------------------------------
// Core type system for the three-level, DAG-aware pre-validation engine.
//
// Design intent (see ./README.md):
//   Level 1  Structural       - fields, documents, file validity, declarations
//   Level 2  Consistency      - deterministic cross-record discrepancy matrix
//   Level 3  Workflow/Policy   - route validity, stage support, DAG readiness
//
// Every result is tied back to the Approval Dependency Graph (DAG) so a single
// issue can block the correct node and lock the correct downstream nodes.
//
// This module is intentionally free of AI / OCR / ML / external calls. Deep
// document interpretation is delegated to optional extension points
// (see ./extension-points.ts); when no interpreter is available the engine
// falls back to deterministic checks and NEVER silently auto-passes.
// -----------------------------------------------------------------------------

import type { BusinessProfile, DocumentVerificationStatus } from '../types';
import type { ApprovalRuleResult } from '../rule-engine';

// ============================================================================
// 1. TOP-LEVEL STATUS + SEVERITY MODEL
// ============================================================================

/** Overall readiness verdict for an application (or the whole DAG slice). */
export type OverallStatus =
  | 'READY_TO_SUBMIT' // all configured blocking checks passed, no warnings
  | 'BLOCKED' // one or more blocking issues; submission must not proceed
  | 'REVIEW_REQUIRED' // ambiguous / conflicting evidence; escalate to manual review
  | 'PARTIALLY_VALID'; // no blockers, but unresolved warnings that must not auto-pass

/** Severity of a single validation issue / discrepancy. */
export type Severity =
  | 'BLOCKING' // prevents submission
  | 'REVIEW_REQUIRED' // cannot be auto-decided; needs a human
  | 'WARNING' // advisory; should be acknowledged, does not hard-block
  | 'INFO'; // informational only (e.g. a check was skipped)

/** Confidence of a deterministic determination. Drives severity down-grading. */
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

/** Result of an individual check. */
export type CheckStatus =
  | 'PASSED'
  | 'FAILED'
  | 'WARNING'
  | 'REVIEW_REQUIRED'
  | 'NOT_CHECKED'
  | 'NOT_APPLICABLE' // rule explicitly does not apply for this configuration
  | 'NOT_CONFIGURED'; // no configured rule; stay cautious (never treat as pass)

/** Which of the three validation levels produced a result. */
export type ValidationLevel = 'STRUCTURAL' | 'CONSISTENCY' | 'WORKFLOW';

/** High-level bucket a validation issue belongs to. */
export type IssueCategory =
  | 'REQUIRED_FIELD'
  | 'REQUIRED_DOCUMENT'
  | 'DOCUMENT_STATE'
  | 'FILE_VALIDITY'
  | 'DECLARATION'
  | 'CONSISTENCY'
  | 'ROUTE_POLICY'
  | 'STAGE_POLICY'
  | 'DEPENDENCY'
  | 'CONFIGURATION';

// ============================================================================
// 2. DOCUMENT STATE + RECORD MODEL
// ============================================================================

/**
 * Effective state of a document with respect to an application requirement.
 * "document exists" is deliberately NOT the same as "document is valid".
 */
export type DocumentState =
  | 'MISSING' // no attachment for a required document
  | 'UPLOADED' // present but not yet verified
  | 'APPROVED' // present and verified/accepted
  | 'REJECTED' // present but rejected by an authority/officer
  | 'EXPIRED' // present but past its configured expiry date
  | 'STALE' // present but predates a material profile/application change
  | 'INVALID'; // present but fails file validity (type/size/naming/metadata)

/**
 * A document as known to the engine. This is a superset of the base
 * VaultDocument; fields beyond the base schema (issuedAt/expiresAt/version/
 * mimeType/extracted) are optional and only populated where available.
 */
export interface DocumentRecord {
  docCode: string;
  docName: string;
  category?: string;
  fileName?: string;
  fileSizeKb?: number;
  mimeType?: string;
  verificationStatus?: DocumentVerificationStatus;
  uploadedAt?: string; // ISO
  issuedAt?: string; // ISO
  expiresAt?: string; // ISO; expiry is only checked when explicitly provided
  version?: number;
  metadata?: Record<string, unknown>;
  /** Populated ONLY by an AI/OCR interpreter extension point; never fabricated. */
  extracted?: ExtractedDocumentData;
}

/** Structured fields a deep document interpreter (OCR/semantic) may return. */
export interface ExtractedDocumentData {
  entityName?: string;
  registeredAddress?: string;
  capacityMt?: number;
  authority?: string;
  documentType?: string;
  issueDate?: string;
  expiryDate?: string;
  signatoryName?: string;
  routeOrLicenceClass?: string;
  [key: string]: unknown;
}

/** Per-requirement evaluation of a document's presence + acceptability. */
export interface DocumentEvaluation {
  docCode: string;
  docName: string;
  required: boolean;
  present: boolean;
  state: DocumentState;
  /** True only if present AND state is acceptable for this requirement. */
  acceptable: boolean;
  reasons: string[];
}

// ============================================================================
// 3. DISCREPANCY MATRIX MODEL (Level 2)
// ============================================================================

/** The kind of record a discrepancy side refers to. */
export type RecordKind = 'PROFILE' | 'APPLICATION' | 'DOCUMENT' | 'REGISTRY' | 'DECLARATION';

export interface RecordRef {
  kind: RecordKind;
  ref: string; // id / code / field path
  label: string; // human readable
}

/** Mismatch categories for the cross-document discrepancy matrix. */
export type MismatchType =
  | 'ENTITY_MISMATCH'
  | 'ADDRESS_MISMATCH'
  | 'OWNERSHIP_MISMATCH'
  | 'CAPACITY_MISMATCH'
  | 'DATE_MISMATCH'
  | 'EXPIRY_MISMATCH'
  | 'AUTHORITY_MISMATCH'
  | 'STAGE_MISMATCH'
  | 'DOCUMENT_TYPE_MISMATCH'
  | 'DECLARATION_MISMATCH'
  | 'NARRATIVE_CONTRADICTION'
  | 'REGISTRY_INCONSISTENCY'
  | 'VERSION_MISMATCH'
  | 'SCOPE_MISMATCH'
  | 'ROUTE_MISMATCH';

/** A single row in the cross-document discrepancy matrix. */
export interface DiscrepancyRow {
  id: string;
  recordA: RecordRef;
  recordB: RecordRef;
  attribute: string; // field/attribute compared
  valueA: string; // actual value
  valueB: string; // expected / other value
  mismatchType: MismatchType;
  severity: Severity;
  confidence: Confidence;
  affectedApprovalPath: string[]; // approval node codes affected
  dagImpact: DagImpact;
  blocking: boolean;
  recommendedAction: string;
  explanation: string;
}

// ============================================================================
// 4. APPROVAL DEPENDENCY GRAPH (DAG)
// ============================================================================

/** A node in the approval DAG (one configured approval / requirement). */
export interface ApprovalDagNode {
  code: string;
  name: string;
  authority: string;
  stage: string;
  sequenceOrder: number;
  /** Direct prerequisite node codes (edges point prerequisite -> node). */
  prerequisites: string[];
}

export interface ApprovalDagEdge {
  from: string; // prerequisite
  to: string; // dependent
}

export interface ApprovalDag {
  nodes: Record<string, ApprovalDagNode>;
  edges: ApprovalDagEdge[];
  /** Deterministic topological order of node codes (prerequisites first). */
  topoOrder: string[];
  /** The longest prerequisite chain through the graph (critical path). */
  criticalPath: string[];
}

/** Validation-time status of a DAG node. */
export type NodeValidationStatus =
  | 'READY' // node's own checks pass and prerequisites satisfied
  | 'BLOCKED' // node has a direct blocking issue
  | 'LOCKED' // node cannot proceed: a prerequisite is blocked / not approved
  | 'REVIEW' // node has review-required issues but no hard block
  | 'APPROVED' // node already approved upstream (treated as satisfied)
  | 'NOT_EVALUATED';

/**
 * The ripple effect of an issue across the approval DAG. Attached to every
 * issue and discrepancy so blocking is never divorced from the graph.
 */
export interface DagImpact {
  originNode: string; // node where the issue originates
  blockedNodes: string[]; // nodes directly blocked by their own issues
  lockedNodes: string[]; // downstream nodes locked via prerequisites
  affectsCriticalPath: boolean;
  criticalPath: string[];
  parallelTracksAffected: string[]; // independent tracks that are impacted
  explanation: string;
}

// ============================================================================
// 5. VALIDATION ISSUE MODEL
// ============================================================================

export interface ValidationIssue {
  id: string;
  level: ValidationLevel;
  category: IssueCategory;
  severity: Severity;
  confidence: Confidence;
  status: CheckStatus;
  approvalCode: string; // DAG node this maps to
  target: string; // field / document / requirement name
  sourceDocument?: string; // document code/name where relevant
  reason: string; // WHY it failed
  requirementViolated: string; // WHAT requirement / policy was violated
  readinessImpact: string; // HOW it affects submission readiness
  dagImpact: DagImpact;
  recommendedAction: string; // HOW to fix
  requiresRevalidation: boolean; // must re-run pre-validation after fixing
  fixDeepLink?: string; // where in the app to go to fix it
  meta?: Record<string, unknown>;
}

// ============================================================================
// 6. ENGINE INPUT (CONTEXT)
// ============================================================================

export interface DeclarationInput {
  required: boolean;
  confirmed: boolean;
  signatoryName?: string;
  signedAt?: string; // ISO
  statementVersion?: string;
}

/** An attachment linking an application requirement to a vault document. */
export interface AttachedDocument {
  docCode: string;
  /** Vault document code this attachment points to (defaults to docCode). */
  vaultDocCode?: string;
  /** Force a document state (used for tests / officer overrides). */
  overrideState?: DocumentState;
}

/** One application to be validated against its approval node. */
export interface ApplicationValidationInput {
  approvalCode: string; // maps to ApprovalRuleResult.code / DAG node
  appNumber?: string;
  formData: Record<string, unknown>;
  attachedDocuments: AttachedDocument[];
  declaration?: DeclarationInput;
  selectedRoute?: string; // chosen approval route (e.g. FSSAI Central vs State)
  workflowStage?: string; // stage the application is being submitted at
  lastEditedAt?: string; // ISO; used for staleness checks
  isTargetForSubmission?: boolean; // the node the user is trying to submit now
}

/** External registry snapshot (deterministic values to compare against). */
export interface RegistrySnapshot {
  entityName?: string;
  pan?: string;
  cin?: string;
  gstin?: string;
  registeredAddress?: string;
  authorizedSignatory?: string;
  [key: string]: unknown;
}

/** Nodes whose real approval status is known (e.g. already approved upstream). */
export type ApprovalStatusMap = Record<string, NodeValidationStatus>;

export interface PrevalidationContext {
  profile: BusinessProfile;
  approvalNodes: ApprovalRuleResult[]; // output of evaluateApprovalRules()
  vault: DocumentRecord[];
  applications: ApplicationValidationInput[];
  registry?: RegistrySnapshot;
  now?: string; // ISO "current" time; defaults to new Date()
  config?: PrevalidationConfig; // defaults to cold-storage config
  interpreters?: DeepInterpreterSet; // optional AI/OCR hooks (default: none)
  /** Known external approval statuses for DAG nodes (e.g. APPROVED upstream). */
  knownNodeStatus?: ApprovalStatusMap;
}

// ============================================================================
// 7. ENGINE OUTPUT (RESULT)
// ============================================================================

export interface NodeResult {
  approvalCode: string;
  approvalName: string;
  authority: string;
  status: NodeValidationStatus;
  blockingCount: number;
  reviewCount: number;
  warningCount: number;
  /** Prerequisite node codes that are blocking this node from proceeding. */
  lockedByPrerequisites: string[];
}

export interface CategoryCount {
  passed: number;
  total: number;
}

export interface PrevalidationSummary {
  totalBlockingIssues: number;
  totalWarnings: number;
  totalReviewItems: number;
  totalDiscrepancies: number;
  affectedApprovalNodes: string[];
  blockedNodes: string[];
  lockedNodes: string[];
  criticalPathImpacted: boolean;
  /** Per-category pass counts, e.g. { REQUIRED_DOCUMENT: { passed: 2, total: 3 } } */
  checkCounts: Partial<Record<IssueCategory, CategoryCount>>;
}

export interface RecoveryStep {
  issueId: string;
  action: string;
  requiresRevalidation: boolean;
  deepLink?: string;
}

export interface PrevalidationResult {
  targetApprovalCode?: string;
  overallStatus: OverallStatus;
  generatedAt: string; // ISO timestamp of this validation run
  summary: PrevalidationSummary;
  issues: ValidationIssue[]; // all issues, severity-sorted
  blockingIssues: ValidationIssue[];
  reviewItems: ValidationIssue[];
  warnings: ValidationIssue[];
  discrepancyMatrix: DiscrepancyRow[];
  documentEvaluations: DocumentEvaluation[];
  nodeResults: NodeResult[];
  dagImpact: DagImpact; // aggregate DAG impact for the run
  recovery: RecoveryStep[];
  explainability: string[]; // human-readable audit lines
  notes: string[]; // e.g. "deep OCR interpretation not available; skipped"
}

// ============================================================================
// 8. CONFIGURATION MODEL (controlled, data-driven)
// ============================================================================

export type FieldSource = 'FORM' | 'PROFILE';

export interface FieldRequirement {
  field: string; // key in formData, or property of BusinessProfile
  label: string;
  source: FieldSource;
  severity?: Severity; // default BLOCKING
}

export interface DocumentRequirement {
  docCode: string;
  docName: string;
  mandatory: boolean;
  /** Must be VERIFIED/APPROVED, not merely uploaded. */
  requireVerified?: boolean;
  acceptableMimeTypes?: string[];
  minSizeKb?: number;
  maxSizeKb?: number;
  namingPattern?: string; // regex source string
  requiredMetadata?: string[];
  /** Workflow stages this document is valid evidence for (Level 3). */
  supportsStages?: string[];
  severity?: Severity; // default BLOCKING when missing
}

export type Comparator =
  | 'EXACT'
  | 'NORMALIZED_TEXT'
  | 'NUMERIC_TOLERANCE'
  | 'BOOLEAN'
  | 'ENUM';

/** Where a consistency-rule side reads its value from. */
export interface ValueSpec {
  kind: RecordKind;
  /** Field path: profile prop, formData key, registry key, or extracted key. */
  path: string;
  /** For DOCUMENT kind: which document code to read `extracted[path]` from. */
  docCode?: string;
  label: string;
}

export interface ConsistencyRule {
  id: string;
  attribute: string;
  mismatchType: MismatchType;
  a: ValueSpec;
  b: ValueSpec;
  comparator: Comparator;
  tolerance?: number; // for NUMERIC_TOLERANCE (fractional, e.g. 0.02 = 2%)
  /** Severity when values materially differ. */
  severityOnMismatch: Severity;
  /** Severity when values differ only cosmetically (normalized-equal). */
  severityOnSoftMismatch?: Severity;
  confidence?: Confidence;
  recommendedAction: string;
  /** If set, this rule only applies when the given route is selected. */
  onlyForRoute?: string;
}

/** Route policy: which routes are valid and their evidence expectations. */
export interface RoutePolicy {
  route: string;
  /** Document codes required specifically for this route. */
  requiredDocuments?: string[];
  /** Condition on profile that must hold for this route to be valid. */
  requiresFoodStorage?: boolean;
  minCapacityMt?: number;
  maxCapacityMt?: number;
  note?: string;
}

export interface ApprovalValidationConfig {
  approvalCode: string;
  stage: string;
  requiredFields: FieldRequirement[];
  requiredDocuments: DocumentRequirement[];
  consistencyRules: ConsistencyRule[];
  declarationRequired: boolean;
  /** Optional route policies keyed by route name. */
  routes?: RoutePolicy[];
  /** Default route when the application does not specify one. */
  defaultRoute?: string;
}

export interface PrevalidationConfig {
  approvals: Record<string, ApprovalValidationConfig>;
  dagEdges: ApprovalDagEdge[];
  /** A document uploaded before a material profile/app change is STALE. */
  staleAfterProfileChange: boolean;
  /** Optional maximum document age (days) before it is considered STALE. */
  maxDocumentAgeDays?: number;
}

// ============================================================================
// 9. DEEP INTERPRETER EXTENSION POINTS (AI / OCR / registry) — see extension-points.ts
// ============================================================================

export type InterpreterCapability = 'OCR' | 'SEMANTIC' | 'REGISTRY';

export type InterpretationStatus = 'OK' | 'NOT_IMPLEMENTED' | 'UNAVAILABLE' | 'ERROR';

export interface InterpretationResult {
  status: InterpretationStatus;
  capability: InterpreterCapability;
  interpreterId: string;
  extracted?: ExtractedDocumentData;
  /** Findings the deep interpreter wants to raise as issues (optional). */
  findings?: string[];
  message?: string;
}

/**
 * Extension point for future AI/OCR/registry document interpretation.
 * The default implementations (see extension-points.ts) return NOT_IMPLEMENTED.
 * The engine treats a non-OK result as "deep interpretation skipped" — it falls
 * back to deterministic checks and, where evidence is ambiguous, escalates to
 * REVIEW_REQUIRED rather than auto-passing.
 */
export interface DocumentInterpreter {
  readonly id: string;
  readonly capability: InterpreterCapability;
  isAvailable(): boolean;
  interpret(doc: DocumentRecord, context: DeepInterpretContext): InterpretationResult;
}

export interface DeepInterpretContext {
  profile: BusinessProfile;
  approvalCode: string;
  registry?: RegistrySnapshot;
}

export interface DeepInterpreterSet {
  ocr?: DocumentInterpreter;
  semantic?: DocumentInterpreter;
  registry?: DocumentInterpreter;
}
