// SIH 26130 --- Module 07: Deep Document Pre-Validation — Public API
// -----------------------------------------------------------------------------
// Import everything you need for pre-validation from this barrel, e.g.:
//
//   import { runPrevalidation, type PrevalidationContext } from '@/lib/prevalidation';
//
// The engine is deterministic and dependency-free. Domain policy lives in the
// cold-storage config; AI/OCR/registry interpretation is an optional extension
// point (default: not implemented — deterministic fallback, never auto-pass).
// -----------------------------------------------------------------------------

// --- The full type contract --------------------------------------------------
export * from './types';

// --- The single entry point --------------------------------------------------
export { runPrevalidation } from './engine';

// --- Controlled domain configuration ----------------------------------------
export { COLD_STORAGE_CONFIG } from './config/cold-storage.config';

// --- Decision model (useful for UI gating / display) -------------------------
export {
  permitsSubmission,
  resolveOverallStatus,
  compareIssues,
  severityRank,
  confidenceRank,
} from './severity';

// --- Approval DAG utilities (for visualising the graph) ----------------------
export {
  buildApprovalDag,
  computeCriticalPath,
  getDescendants,
  getAncestors,
} from './approval-dag';

// --- Explainability + recovery helpers ---------------------------------------
export { explainIssue, buildExplainability, buildRecovery } from './explain';

// --- Deep-interpretation extension points (AI / OCR / registry) --------------
export {
  defaultInterpreters,
  createInterpreterSet,
  anyInterpreterAvailable,
} from './extension-points';

// --- Runnable demonstration + self-check harness -----------------------------
export { runDemo } from './demo';
