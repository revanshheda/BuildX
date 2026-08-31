// SIH 26130 --- Module 07: Deep Interpretation Extension Points (AI / OCR)
// -----------------------------------------------------------------------------
// The deterministic engine does NOT read the contents of uploaded files. Deep
// document interpretation (OCR text extraction, semantic contradiction
// detection, external registry cross-checks) is delegated to optional, pluggable
// interpreters implementing the DocumentInterpreter interface.
//
// >>> These are EXTENSION POINTS ONLY. The default implementations below are
// >>> deliberate stubs that return NOT_IMPLEMENTED. No AI/OCR/ML/registry call
// >>> is performed by this prototype.
//
// Contract for the engine:
//   - If an interpreter isAvailable() and returns status OK, its extracted
//     fields are merged onto the DocumentRecord and its findings may raise
//     issues / discrepancies.
//   - If an interpreter is unavailable or returns a non-OK status, the engine
//     records a note ("deep interpretation skipped") and falls back to
//     deterministic checks. Where evidence is ambiguous it escalates to
//     REVIEW_REQUIRED — it NEVER treats "not interpreted" as "passed".
// -----------------------------------------------------------------------------

import type {
  DeepInterpretContext,
  DeepInterpreterSet,
  DocumentInterpreter,
  DocumentRecord,
  InterpretationResult,
  InterpreterCapability,
} from './types';

// ----------------------------------------------------------------------------
// Default stub interpreters (NOT IMPLEMENTED)
// ----------------------------------------------------------------------------

class NotImplementedInterpreter implements DocumentInterpreter {
  readonly id: string;
  readonly capability: InterpreterCapability;

  constructor(id: string, capability: InterpreterCapability) {
    this.id = id;
    this.capability = capability;
  }

  isAvailable(): boolean {
    return false;
  }

  interpret(_doc: DocumentRecord, _context: DeepInterpretContext): InterpretationResult {
    return {
      status: 'NOT_IMPLEMENTED',
      capability: this.capability,
      interpreterId: this.id,
      message:
        `${this.capability} interpretation is an extension point and is not implemented ` +
        `in this prototype. Deterministic checks are used instead; ambiguous evidence ` +
        `is escalated to manual review.`,
    };
  }
}

/** Stub OCR interpreter (would extract text/fields from a scanned document). */
export const noopOcrInterpreter: DocumentInterpreter = new NotImplementedInterpreter(
  'noop-ocr',
  'OCR',
);

/** Stub semantic interpreter (would detect narrative contradictions across docs). */
export const noopSemanticInterpreter: DocumentInterpreter = new NotImplementedInterpreter(
  'noop-semantic',
  'SEMANTIC',
);

/** Stub registry interpreter (would cross-check against an external registry). */
export const noopRegistryInterpreter: DocumentInterpreter = new NotImplementedInterpreter(
  'noop-registry',
  'REGISTRY',
);

/** The default interpreter set: all stubs, nothing available. */
export function defaultInterpreters(): DeepInterpreterSet {
  return {
    ocr: noopOcrInterpreter,
    semantic: noopSemanticInterpreter,
    registry: noopRegistryInterpreter,
  };
}

/**
 * Build an interpreter set, substituting any real interpreters a caller
 * provides. Anything omitted falls back to the NOT_IMPLEMENTED stub.
 */
export function createInterpreterSet(overrides?: Partial<DeepInterpreterSet>): DeepInterpreterSet {
  return { ...defaultInterpreters(), ...(overrides ?? {}) };
}

// ----------------------------------------------------------------------------
// Safe invocation
// ----------------------------------------------------------------------------

/**
 * Invoke an interpreter defensively:
 *   - returns UNAVAILABLE if the interpreter is missing or reports unavailable;
 *   - returns ERROR (never throws) if the interpreter throws.
 * This guarantees the engine can always fall back deterministically.
 */
export function runInterpreter(
  interpreter: DocumentInterpreter | undefined,
  doc: DocumentRecord,
  context: DeepInterpretContext,
): InterpretationResult {
  if (!interpreter) {
    return {
      status: 'UNAVAILABLE',
      capability: 'SEMANTIC',
      interpreterId: 'none',
      message: 'No interpreter configured for this capability.',
    };
  }
  if (!interpreter.isAvailable()) {
    return {
      status: 'UNAVAILABLE',
      capability: interpreter.capability,
      interpreterId: interpreter.id,
      message: `Interpreter '${interpreter.id}' is not available.`,
    };
  }
  try {
    return interpreter.interpret(doc, context);
  } catch (err) {
    return {
      status: 'ERROR',
      capability: interpreter.capability,
      interpreterId: interpreter.id,
      message: `Interpreter '${interpreter.id}' threw: ${(err as Error)?.message ?? 'unknown error'}`,
    };
  }
}

/** True when at least one interpreter in the set is actually available. */
export function anyInterpreterAvailable(set: DeepInterpreterSet | undefined): boolean {
  if (!set) return false;
  return Boolean(
    set.ocr?.isAvailable() || set.semantic?.isAvailable() || set.registry?.isAvailable(),
  );
}
