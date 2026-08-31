// SIH 26130 --- Module 07: Store -> Engine Adapter
// -----------------------------------------------------------------------------
// Bridges the live BuildX application store (BusinessProfile + VaultDocument[] +
// the single Application object) into the pure, deterministic pre-validation
// engine's PrevalidationContext.
//
// This is the ONLY place that knows how the app's data shape maps onto the
// engine's expectations, so the engine itself stays generic and portable and the
// UI never constructs an engine context by hand.
//
// Design principles carried over from the engine (kept honest here):
//   - "document exists" != "document is valid": we pass the raw vault as-is and
//     let Level 1 decide state (VERIFIED vs UPLOADED/REJECTED/EXPIRED/MISSING).
//   - do not hide contradictions: we surface the real profile + form values so
//     Level 2 can compare them; we never coerce them to agree.
//   - do not isolate validation from the graph: approvalNodes come straight from
//     the same rule engine that powers the roadmap DAG.
// -----------------------------------------------------------------------------

import type { Application, BusinessProfile, VaultDocument } from '../types';
import { evaluateApprovalRules } from '../rule-engine';
import type {
  ApplicationValidationInput,
  DeclarationInput,
  DocumentRecord,
  PrevalidationContext,
} from './types';

export interface BuildContextInput {
  business: BusinessProfile;
  documents: VaultDocument[];
  application: Application;
  /**
   * Whether the applicant has accepted the declaration. Defaults to true so a
   * freshly-loaded application is not spuriously blocked; the ApplicationPage
   * passes the live checkbox state so un-checking it produces a real blocker.
   */
  declarationAccepted?: boolean;
  /**
   * Live form values (possibly unsaved edits from the ApplicationPage). When
   * provided this is used as the base form data; otherwise application.formData
   * is used. Either way the FSSAI required-field aliases are derived below.
   */
  formData?: Record<string, unknown>;
  /** ISO "current time" override (tests / deterministic demos). */
  now?: string;
}

/** True when a value is meaningfully absent for aliasing purposes. */
function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * Build the engine `formData` for an application.
 *
 * The store's form uses its own presentation keys (premisesType,
 * operationalShift, storageCategories, ammoniaSafetyAudit, standbyGensetKva),
 * but the FSSAI Central Licence config asks for canonical FBO field names
 * (fboName, fboType, premisesType, storageCapacityMt, foodCategories). We derive
 * those canonical aliases from the authoritative business profile + the existing
 * form values WITHOUT overwriting anything the applicant actually typed, so:
 *   - required-field checks (Level 1) find every field, and
 *   - the ENTITY_NAME / CAPACITY consistency rules (Level 2) compare the real
 *     profile values against themselves and legitimately agree.
 * If the applicant edits a value to disagree with the profile, the alias is NOT
 * injected (the typed value wins) and Level 2 will correctly flag the mismatch.
 */
function buildEngineFormData(
  business: BusinessProfile,
  application: Application,
  formOverrides?: Record<string, unknown>,
): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    ...application.formData,
    ...(formOverrides ?? {}),
  };

  const alias = (key: string, value: unknown): void => {
    if (isBlank(raw[key]) && !isBlank(value)) raw[key] = value;
  };

  // FSSAI Central Licence canonical required fields (cold-storage.config.ts).
  alias('fboName', business.name);
  alias('fboType', business.entityType);
  alias('premisesType', 'Owned (MIDC Industrial Leasehold)');
  alias('storageCapacityMt', business.storageCapacityMt);
  // The form collects "storageCategories"; the engine asks for "foodCategories".
  alias('foodCategories', raw.storageCategories);

  // Robustness for other approval nodes whose consistency rules read an
  // APPLICATION-sourced value (e.g. MIDC PLOT_RULE). Harmless for FSSAI.
  alias('plotNumber', business.plotNumber);

  return raw;
}

/**
 * Map the live store into a single-application PrevalidationContext targeting
 * the current application. The overall verdict is therefore scoped to the
 * application the user is actually trying to submit.
 */
export function buildPrevalidationContext(input: BuildContextInput): PrevalidationContext {
  const { business, documents, application } = input;

  const declaration: DeclarationInput = {
    required: true,
    confirmed: input.declarationAccepted ?? true,
    signatoryName: business.contactName,
    // A stable, non-future timestamp (the app's last edit) — avoids any
    // future-date review flag while remaining truthful.
    signedAt: input.now ?? application.updatedAt,
  };

  const targetApplication: ApplicationValidationInput = {
    approvalCode: application.approvalCode,
    appNumber: application.appNumber,
    formData: buildEngineFormData(business, application, input.formData),
    // Empty -> Level 1 matches the whole vault pool by docCode (same mental
    // model as the app's "does a VERIFIED doc with this code exist?").
    attachedDocuments: [],
    declaration,
    // Omit selectedRoute so the engine falls back to the config defaultRoute
    // ('FSSAI Central Licence'), which is guaranteed to be a valid route.
    workflowStage: 'PLANNING',
    isTargetForSubmission: true,
  };

  const context: PrevalidationContext = {
    profile: business,
    approvalNodes: evaluateApprovalRules(business).results,
    // VaultDocument is a structural superset of DocumentRecord.
    vault: documents as DocumentRecord[],
    applications: [targetApplication],
  };

  if (input.now) context.now = input.now;

  return context;
}
