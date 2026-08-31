// SIH 26130 --- Module 07: Controlled Cold-Storage Validation Config
// -----------------------------------------------------------------------------
// The single source of truth for WHAT the pre-validation engine checks for the
// Maharashtra Cold Storage / Cold Chain pathway. The engine itself is generic;
// all domain policy lives here as data so it can be audited and extended without
// touching engine logic.
//
// Document codes below are aligned with the real hero vault (see
// ../../data/hero-data.ts):
//   PAN, INCORPORATION_CERT, MIDC_ALLOTMENT, SITE_PLAN, BUILDING_PLAN,
//   PROJECT_REPORT, COLD_STORAGE_LAYOUT  (all VERIFIED in the base vault)
//   PROCESS_FLOW                          (NOT in the base vault -> the hero
//                                          "missing document" that blocks FSSAI)
//
// Later-stage document codes (fire, occupancy, utilities) intentionally do not
// exist in the vault yet: those nodes are only reached later in the workflow, so
// if an application is filed for them prematurely the engine correctly reports
// the evidence as MISSING.
//
// Node codes match rule-engine.ts exactly.
// -----------------------------------------------------------------------------

import type {
  ApprovalDagEdge,
  ApprovalValidationConfig,
  ConsistencyRule,
  DocumentRequirement,
  FieldRequirement,
  PrevalidationConfig,
} from '../types';

// ----------------------------------------------------------------------------
// Small builders to keep each node definition readable and consistent.
// ----------------------------------------------------------------------------

const PDF_ONLY = ['application/pdf'];

/** A mandatory, must-be-verified PDF document with sane file-validity bounds. */
function verifiedDoc(
  docCode: string,
  docName: string,
  extra: Partial<DocumentRequirement> = {},
): DocumentRequirement {
  return {
    docCode,
    docName,
    mandatory: true,
    requireVerified: true,
    acceptableMimeTypes: PDF_ONLY,
    minSizeKb: 20,
    maxSizeKb: 30000,
    ...extra,
  };
}

/** A required field sourced from the business profile (authoritative record). */
function profileField(field: string, label: string): FieldRequirement {
  return { field, label, source: 'PROFILE' };
}

/** A required field the applicant must supply on the application form. */
function formField(field: string, label: string): FieldRequirement {
  return { field, label, source: 'FORM' };
}

// ----------------------------------------------------------------------------
// Reusable consistency rules (cross-record comparisons for Level 2).
// These fire ONLY when both sides carry a value; a missing side is treated as
// "not comparable" (skipped) rather than a mismatch, so a sparse form never
// produces a false discrepancy.
// ----------------------------------------------------------------------------

const ENTITY_NAME_RULE: ConsistencyRule = {
  id: 'entity-name',
  attribute: 'Legal entity name',
  mismatchType: 'ENTITY_MISMATCH',
  a: { kind: 'APPLICATION', path: 'fboName', label: 'Application: FBO / applicant name' },
  b: { kind: 'PROFILE', path: 'name', label: 'Business profile: registered name' },
  comparator: 'NORMALIZED_TEXT',
  severityOnMismatch: 'BLOCKING',
  severityOnSoftMismatch: 'WARNING',
  confidence: 'HIGH',
  recommendedAction:
    'Align the applicant name on the form with the registered legal name in the business profile.',
};

const CAPACITY_RULE: ConsistencyRule = {
  id: 'storage-capacity',
  attribute: 'Storage capacity (MT)',
  mismatchType: 'CAPACITY_MISMATCH',
  a: { kind: 'APPLICATION', path: 'storageCapacityMt', label: 'Application: declared capacity' },
  b: { kind: 'PROFILE', path: 'storageCapacityMt', label: 'Business profile: capacity' },
  comparator: 'NUMERIC_TOLERANCE',
  tolerance: 0.02, // 2%
  severityOnMismatch: 'BLOCKING',
  confidence: 'HIGH',
  recommendedAction:
    'Correct the declared storage capacity so it matches the sanctioned profile capacity (within 2%).',
};

const REGISTRY_NAME_RULE: ConsistencyRule = {
  id: 'registry-entity-name',
  attribute: 'Registry entity name',
  mismatchType: 'REGISTRY_INCONSISTENCY',
  a: { kind: 'REGISTRY', path: 'entityName', label: 'External registry: entity name' },
  b: { kind: 'PROFILE', path: 'name', label: 'Business profile: registered name' },
  comparator: 'NORMALIZED_TEXT',
  severityOnMismatch: 'REVIEW_REQUIRED',
  severityOnSoftMismatch: 'INFO',
  confidence: 'MEDIUM',
  recommendedAction:
    'Reconcile the profile name with the external registry record before submission.',
};

const PLOT_RULE: ConsistencyRule = {
  id: 'plot-number',
  attribute: 'Plot number',
  mismatchType: 'ADDRESS_MISMATCH',
  a: { kind: 'APPLICATION', path: 'plotNumber', label: 'Application: site plot number' },
  b: { kind: 'PROFILE', path: 'plotNumber', label: 'Business profile: allotted plot' },
  comparator: 'NORMALIZED_TEXT',
  severityOnMismatch: 'BLOCKING',
  severityOnSoftMismatch: 'WARNING',
  confidence: 'HIGH',
  recommendedAction:
    'Ensure the site plot number on the application matches the MIDC-allotted plot in the profile.',
};

// ----------------------------------------------------------------------------
// Per-approval configuration (keyed by rule-engine code).
// ----------------------------------------------------------------------------

const APPROVALS: Record<string, ApprovalValidationConfig> = {
  // 1. MIDC Building Plan + Provisional Fire (root of the construction chain)
  MIDC_BUILDING_FIRE: {
    approvalCode: 'MIDC_BUILDING_FIRE',
    stage: 'PLANNING',
    requiredFields: [
      profileField('plotNumber', 'Allotted plot number'),
      profileField('builtUpAreaSqft', 'Proposed built-up area (sq.ft)'),
    ],
    requiredDocuments: [
      verifiedDoc('MIDC_ALLOTMENT', 'MIDC Plot Allotment Letter & Lease', {
        supportsStages: ['PLANNING'],
      }),
      verifiedDoc('BUILDING_PLAN', 'Architectural Building & Floor Plan', {
        supportsStages: ['PLANNING'],
      }),
      verifiedDoc('SITE_PLAN', 'Approved Site Layout Plan', {
        supportsStages: ['PLANNING'],
      }),
    ],
    consistencyRules: [PLOT_RULE],
    declarationRequired: true,
  },

  // 2. FSSAI Central Licence --- THE HERO APPLICATION
  FSSAI_CENTRAL_LICENSE: {
    approvalCode: 'FSSAI_CENTRAL_LICENSE',
    stage: 'PLANNING',
    requiredFields: [
      formField('fboName', 'Food Business Operator (legal) name'),
      formField('fboType', 'Kind of business / FBO type'),
      formField('premisesType', 'Premises type / ownership'),
      formField('storageCapacityMt', 'Declared storage capacity (MT)'),
      formField('foodCategories', 'Food categories handled'),
    ],
    requiredDocuments: [
      verifiedDoc('PROJECT_REPORT', 'Detailed Project Report (DPR)', {
        supportsStages: ['PLANNING'],
      }),
      verifiedDoc('COLD_STORAGE_LAYOUT', 'Refrigeration & Chamber Layout Plan', {
        supportsStages: ['PLANNING'],
      }),
      // The hero blocker: absent from the base vault until the query is answered.
      verifiedDoc('PROCESS_FLOW', 'Process Flow Diagram', {
        supportsStages: ['PLANNING'],
      }),
      verifiedDoc('PAN', 'Company PAN Card', {
        supportsStages: ['PLANNING'],
      }),
    ],
    consistencyRules: [ENTITY_NAME_RULE, CAPACITY_RULE, REGISTRY_NAME_RULE],
    declarationRequired: true,
    defaultRoute: 'FSSAI Central Licence',
    routes: [
      {
        route: 'FSSAI Central Licence',
        requiresFoodStorage: true,
        requiredDocuments: ['PROJECT_REPORT', 'COLD_STORAGE_LAYOUT', 'PROCESS_FLOW', 'PAN'],
        note: 'Central licence is the correct route for large / multi-state cold-chain operators.',
      },
      {
        route: 'FSSAI State Licence',
        requiresFoodStorage: true,
        maxCapacityMt: 2000,
        note: 'State licence is only valid below the configured capacity threshold.',
      },
    ],
  },

  // 3. MPCB Consent to Establish (independent / parallel track)
  MPCB_CTE: {
    approvalCode: 'MPCB_CTE',
    stage: 'PLANNING',
    requiredFields: [profileField('totalInvestmentInr', 'Total project investment (INR)')],
    requiredDocuments: [
      verifiedDoc('PROJECT_REPORT', 'Detailed Project Report (DPR)'),
      verifiedDoc('SITE_PLAN', 'Site Plan'),
      verifiedDoc('EFFLUENT_PLAN', 'Effluent / Wastewater Management Plan'),
    ],
    consistencyRules: [CAPACITY_RULE],
    declarationRequired: true,
  },

  // 4. MSEDCL HT Power sanction (depends on Building/Fire)
  MSEDCL_POWER: {
    approvalCode: 'MSEDCL_POWER',
    stage: 'UTILITIES',
    requiredFields: [profileField('powerRequirementKw', 'Sanctioned load (kW)')],
    requiredDocuments: [
      verifiedDoc('ELECTRICAL_SLD', 'Electrical Single Line Diagram (SLD)'),
      verifiedDoc('LOAD_SHEET', 'Connected Load Distribution Sheet'),
      verifiedDoc('MIDC_ALLOTMENT', 'MIDC Allotment / Ownership Proof'),
    ],
    consistencyRules: [],
    declarationRequired: false,
  },

  // 5. MIDC Industrial Water sanction (depends on Building/Fire)
  MIDC_WATER: {
    approvalCode: 'MIDC_WATER',
    stage: 'UTILITIES',
    requiredFields: [profileField('waterRequirementKld', 'Water requirement (KLD)')],
    requiredDocuments: [
      verifiedDoc('WATER_LAYOUT', 'Internal Plumbing & Water Distribution Layout'),
      verifiedDoc('WATER_BALANCE', 'Water Balance Chart'),
      verifiedDoc('MIDC_ALLOTMENT', 'MIDC Allotment Letter'),
    ],
    consistencyRules: [],
    declarationRequired: false,
  },

  // 6. MIDC Drainage & Effluent connection (depends on Building/Fire)
  MIDC_DRAINAGE: {
    approvalCode: 'MIDC_DRAINAGE',
    stage: 'UTILITIES',
    requiredFields: [],
    requiredDocuments: [
      verifiedDoc('DRAINAGE_LAYOUT', 'Drainage & Storm Water Layout Plan'),
      verifiedDoc('EFFLUENT_DESIGN', 'Pre-treatment / Neutralization Tank Design'),
    ],
    consistencyRules: [],
    declarationRequired: false,
  },

  // 7. DISH Factory Licence (depends on Building/Fire; prerequisite of Occupancy)
  DISH_FACTORY_LICENSE: {
    approvalCode: 'DISH_FACTORY_LICENSE',
    stage: 'PRE_COMMISSIONING',
    requiredFields: [profileField('proposedEmployment', 'Proposed employment (headcount)')],
    requiredDocuments: [
      verifiedDoc('MACHINERY_LAYOUT', 'Factory Machinery Layout Plan'),
      verifiedDoc('SAFETY_DETAILS', 'Safety & Ventilation Details'),
      verifiedDoc('MACHINERY_LIST', 'List of Key Plant & Machinery'),
    ],
    consistencyRules: [],
    declarationRequired: true,
  },

  // 8. Final Fire NOC (depends on Building/Fire; prerequisite of Occupancy)
  FIRE_FINAL_NOC: {
    approvalCode: 'FIRE_FINAL_NOC',
    stage: 'PRE_COMMISSIONING',
    requiredFields: [],
    requiredDocuments: [
      verifiedDoc('PROVISIONAL_FIRE_NOC', 'Provisional Fire NOC Copy', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
      verifiedDoc('FIRE_EQUIPMENT_CERT', 'Fire Equipment Installation Certificate', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
      verifiedDoc('FORM_A_COMPLIANCE', 'Form-A Compliance Certificate', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
    ],
    consistencyRules: [],
    declarationRequired: false,
  },

  // 9. MIDC Occupancy Certificate (terminal node; depends on DISH + Final Fire)
  MIDC_OCCUPANCY: {
    approvalCode: 'MIDC_OCCUPANCY',
    stage: 'PRE_COMMISSIONING',
    requiredFields: [],
    requiredDocuments: [
      verifiedDoc('ARCHITECT_COMPLETION', 'Architect Completion Certificate', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
      verifiedDoc('FINAL_FIRE_NOC', 'Final Fire NOC', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
      verifiedDoc('STRUCTURAL_STABILITY', 'Structural Stability Certificate', {
        supportsStages: ['PRE_COMMISSIONING'],
      }),
    ],
    consistencyRules: [],
    declarationRequired: false,
  },
};

// ----------------------------------------------------------------------------
// Approval Dependency Graph edges (prerequisite -> dependent).
//
//   MIDC_BUILDING_FIRE ┬─> MSEDCL_POWER
//                      ├─> MIDC_WATER
//                      ├─> MIDC_DRAINAGE
//                      ├─> DISH_FACTORY_LICENSE ─┐
//                      └─> FIRE_FINAL_NOC ───────┼─> MIDC_OCCUPANCY
//
//   FSSAI_CENTRAL_LICENSE and MPCB_CTE are independent parallel tracks.
//
// Critical path (longest prerequisite chain):
//   MIDC_BUILDING_FIRE -> DISH_FACTORY_LICENSE -> MIDC_OCCUPANCY
// ----------------------------------------------------------------------------

const DAG_EDGES: ApprovalDagEdge[] = [
  { from: 'MIDC_BUILDING_FIRE', to: 'MSEDCL_POWER' },
  { from: 'MIDC_BUILDING_FIRE', to: 'MIDC_WATER' },
  { from: 'MIDC_BUILDING_FIRE', to: 'MIDC_DRAINAGE' },
  { from: 'MIDC_BUILDING_FIRE', to: 'DISH_FACTORY_LICENSE' },
  { from: 'MIDC_BUILDING_FIRE', to: 'FIRE_FINAL_NOC' },
  { from: 'DISH_FACTORY_LICENSE', to: 'MIDC_OCCUPANCY' },
  { from: 'FIRE_FINAL_NOC', to: 'MIDC_OCCUPANCY' },
];

// ----------------------------------------------------------------------------
// Exported config.
//
// Staleness policy: profile-change staleness is DISABLED here on purpose. The
// hero documents were uploaded before the last profile "touch", and treating any
// document older than the profile timestamp as stale would produce false
// positives. Staleness is instead driven by an explicit age threshold (left
// unset -> off) or by an officer/test override state. This keeps the hero fully
// READY while still supporting a staleness demonstration via overrideState.
// ----------------------------------------------------------------------------

export const COLD_STORAGE_CONFIG: PrevalidationConfig = {
  approvals: APPROVALS,
  dagEdges: DAG_EDGES,
  staleAfterProfileChange: false,
  maxDocumentAgeDays: undefined,
};

export default COLD_STORAGE_CONFIG;
