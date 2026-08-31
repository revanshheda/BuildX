# Module 07 — Deep Document Pre-Validation

A deterministic, DAG-aware pre-validation engine that decides whether a government business-approval application is *complete, internally consistent, and workflow-ready* **before** it can be submitted. It is the gate that stands between a drafted application and the approval workflow: if the engine does not return `READY_TO_SUBMIT`, the application must not proceed.

The engine is pure TypeScript with no database, network, UI, or AI dependencies. All domain policy is expressed as data in a controlled configuration, and deep document interpretation (OCR / semantic / registry) is delegated to clearly-marked extension points that are **not implemented** in this prototype — when they are absent, the engine falls back to deterministic checks and escalates anything ambiguous to manual review rather than passing it.

## Design intent

The engine is built around four non-negotiable principles, taken directly from the module brief:

1. *"Document exists" is never treated as "document is valid."* A required document that is present but rejected, expired, unverified, malformed, or stale is not accepted.
2. *Contradictions across records are never ignored.* Cross-document consistency is a first-class validation level, and a genuine contradiction blocks (or, at lower confidence, is escalated to review) — it is never silently tolerated.
3. *Validation is never isolated from the approval graph.* Every finding maps onto an approval node; a blocked node locks its downstream dependents, and the engine reports exactly what is blocked, what is locked, and whether the critical path is affected.
4. *The reason for every failure is never hidden.* Each issue carries why it failed, what requirement it violated, how it affects readiness, and how to fix it.

## The three validation levels

Validation runs in three ordered levels, each stricter and more semantic than the last.

**Level 1 — Structural** (`level1-structural.ts`) confirms the application is well-formed: required fields are present (from the form and the business profile), required documents are attached *and in an acceptable state*, files pass validity checks (type, size, naming pattern, required metadata), and the applicant declaration is confirmed, attributed, and sanely dated. The core rule here is that presence and validity are distinct: the effective state of a document is resolved through a strict precedence (`MISSING → REJECTED → EXPIRED → INVALID → STALE → UPLOADED → APPROVED`) and only an acceptable terminal state clears the check.

**Level 2 — Cross-Document Consistency** (`level2-consistency.ts`) compares the same real-world attribute across the application form, the business profile, an optional external registry snapshot, declarations, and any AI/OCR-extracted document fields. Each configured rule produces a row in the discrepancy matrix. A comparison whose two sides normalise to the same value is a cosmetic (soft) difference and is downgraded to a warning; a genuine contradiction is material and blocks, subject to confidence. Crucially, when either side is missing the comparison is deemed *not comparable* and skipped, so sparse data never fabricates a discrepancy.

**Level 3 — Workflow / Policy** (`level3-workflow.ts`) applies the rules that only make sense in the context of the chosen approval route and workflow stage: the selected route must be valid and its conditions must hold (e.g. FSSAI Central vs State licence, the food-storage requirement, the capacity band); each supplied document must be acceptable *evidence for the stage it is being used at*; the application must be filed at the correct stage; and any externally-known prerequisite approvals must actually be in place.

## Integration with the approval dependency graph

The approval graph (`approval-dag.ts`) is a DAG in which an edge `from → to` means `from` is a prerequisite of `to`. Prerequisites are AND-combined, so a node can proceed only when *all* of its prerequisites are clear. The engine assigns each node an own-status from its direct findings, then propagates locks in topological order: a node with any blocked or locked prerequisite becomes `LOCKED`, even if it was never evaluated on its own. Un-evaluated nodes are preserved as `NOT_EVALUATED` rather than optimistically promoted to ready. The engine also computes the critical path (the longest prerequisite chain) so it can distinguish an issue that threatens the overall timeline from one that only affects a parallel track.

For the cold-storage pathway the graph roots at `MIDC_BUILDING_FIRE`, which fans out to the utility approvals (`MSEDCL_POWER`, `MIDC_WATER`, `MIDC_DRAINAGE`) and to `DISH_FACTORY_LICENSE` and `FIRE_FINAL_NOC`, both of which are prerequisites of the terminal `MIDC_OCCUPANCY`. `FSSAI_CENTRAL_LICENSE` and `MPCB_CTE` are independent parallel tracks. The critical path is `MIDC_BUILDING_FIRE → DISH_FACTORY_LICENSE → MIDC_OCCUPANCY`.

## The discrepancy matrix

Level 2 emits a matrix in which every row names the two records compared, the attribute, the two actual values, the mismatch type (entity, address, ownership, capacity, date, expiry, authority, stage, document-type, declaration, narrative, registry, version, scope, or route), the severity and confidence, the affected approval path, the DAG impact, whether it blocks, and the recommended fix. The same contradictions are also surfaced as validation issues so a caller can consume either the matrix view or the flat issue list.

## Output contract

`runPrevalidation(context)` returns a `PrevalidationResult` containing the overall status (`READY_TO_SUBMIT` / `BLOCKED` / `REVIEW_REQUIRED` / `PARTIALLY_VALID`), a summary of counts and affected nodes, the full severity-sorted issue list partitioned into blocking / review / warning, the discrepancy matrix, per-document evaluations, per-node results (status and what locks each node), the aggregate DAG impact, an ordered recovery plan, human-readable explainability lines, and notes (for example, that deep interpretation was unavailable). The overall status is resolved with the precedence `BLOCKED > REVIEW_REQUIRED > PARTIALLY_VALID > READY_TO_SUBMIT`, and warning-only states never auto-pass.

## Decision logic

Missing required data blocks. A material cross-record contradiction blocks at high confidence and is escalated to review at medium or low confidence — never quietly downgraded to a warning. A document that is invalid for the selected route blocks. An expired document blocks until replaced. A stale document gates auto-pass and requires human confirmation. Ambiguous evidence is routed to manual review, never auto-approved.

## File map

The module is organised so that the generic engine never contains domain policy:

- `types.ts` — the complete type system and the public contract.
- `severity.ts` — the severity, confidence, and overall-status decision model.
- `approval-dag.ts` — graph construction, topological order, critical path, and lock propagation.
- `internal.ts` — shared, pure helpers (field access, date math, text normalisation, the issue factory).
- `level1-structural.ts`, `level2-consistency.ts`, `level3-workflow.ts` — the three validation levels.
- `explain.ts` — explainability audit lines and the recovery plan.
- `extension-points.ts` — the AI / OCR / registry interpreter interfaces and their not-implemented stubs.
- `config/cold-storage.config.ts` — the controlled cold-storage policy (fields, documents, consistency rules, routes, and DAG edges).
- `engine.ts` — the orchestrator, `runPrevalidation`.
- `demo.ts` — a runnable demonstration and self-checking harness over the FreshChain hero dataset.
- `index.ts` — the public barrel.

## Running the demo

The demo validates the real FreshChain hero dataset through three scenarios and asserts every expected outcome, so it doubles as a test suite. No test framework is required. From the `frontend` directory:

```
npx tsx src/lib/prevalidation/demo.ts
```

Alternatively, import and call it from any TypeScript entry point:

```ts
import { runDemo } from '@/lib/prevalidation';
runDemo(); // prints a full report and returns true if all self-checks pass
```

The three scenarios are: the FSSAI Central Licence against the base vault (the Process Flow Diagram has not yet been uploaded) which returns `BLOCKED`; the same application against the verified vault (the officer's query has been answered and the revised diagram uploaded) which returns `READY_TO_SUBMIT`; and a Building/Fire submission whose plot number contradicts the profile while a parallel FSSAI draft carries a wrong legal name and capacity, which returns `BLOCKED`, produces a four-row discrepancy matrix, and cascades locks across six downstream approval nodes including the terminal occupancy certificate.

## Using it in the application

Build a `PrevalidationContext` from the business profile, the evaluated approval nodes (`evaluateApprovalRules(profile).results`), the vault documents, and the application(s) being validated, then call `runPrevalidation`. Gate the submit button on `permitsSubmission(result.overallStatus)`, render `result.discrepancyMatrix` and `result.nodeResults` for the officer and applicant views, and show `result.explainability` and `result.recovery` to explain and unblock. To enable real document interpretation later, implement the `DocumentInterpreter` interfaces from `extension-points.ts` and pass them in `context.interpreters`; nothing else needs to change.
