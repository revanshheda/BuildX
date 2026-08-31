import { BusinessProfile } from './types';

export type RuleApplicabilityStatus =
  | 'APPLICABLE'
  | 'CONDITIONAL'
  | 'STAGE_DEPENDENT'
  | 'NOT_APPLICABLE'
  | 'NOT_CONFIGURED';

export interface ApprovalRuleResult {
  id: string;
  code: string;
  name: string;
  department: string;
  authorityName: string;
  status: RuleApplicabilityStatus;
  stage: 'PLANNING' | 'CONSTRUCTION' | 'UTILITIES' | 'PRE_COMMISSIONING' | 'OPERATION';
  stageLabel: string;
  sequenceOrder: number;
  reason: string;
  legalBasis: string;
  mandatoryDocuments: string[];
  isHeroFocus?: boolean;
}

export interface RuleEvaluationSummary {
  businessId: string;
  totalEvaluated: number;
  applicableCount: number;
  conditionalCount: number;
  stageDependentCount: number;
  notConfiguredCount: number;
  results: ApprovalRuleResult[];
}

export function evaluateApprovalRules(profile: BusinessProfile): RuleEvaluationSummary {
  // If sub-sector is not Cold Storage, mark as NOT_CONFIGURED per prototype accuracy principle
  if (profile.subSector !== 'Cold Storage / Cold Chain') {
    const unconfiguredResult: ApprovalRuleResult = {
      id: 'rule-unconfigured-01',
      code: 'REG_UNCONFIGURED',
      name: `${profile.subSector} Regulatory Pathway`,
      department: 'Government of Maharashtra / Respective Authorities',
      authorityName: 'Designated Single Window Cell',
      status: 'NOT_CONFIGURED',
      stage: 'PLANNING',
      stageLabel: 'Planning Stage',
      sequenceOrder: 1,
      reason: `Detailed statutory rule matrix for '${profile.subSector}' has not been configured in the prototype. Preserved for scalability demonstration without fabricated requirements.`,
      legalBasis: 'Maharashtra Industry Single Window Policy',
      mandatoryDocuments: ['Business Profile', 'PAN', 'Project Report'],
    };

    return {
      businessId: profile.id,
      totalEvaluated: 1,
      applicableCount: 0,
      conditionalCount: 0,
      stageDependentCount: 0,
      notConfiguredCount: 1,
      results: [unconfiguredResult],
    };
  }

  // Controlled Maharashtra Cold Storage Rule Evaluation
  const results: ApprovalRuleResult[] = [
    // 1. MIDC Building Plan + Provisional Fire
    {
      id: 'rule-cs-01',
      code: 'MIDC_BUILDING_FIRE',
      name: 'MIDC Building Plan Approval & Provisional Fire NOC',
      department: 'MIDC Planning Department & Maharashtra Fire Services',
      authorityName: 'Special Planning Authority (SPA) - MIDC Pune',
      status: profile.locationType === 'MIDC' ? 'APPLICABLE' : 'CONDITIONAL',
      stage: 'PLANNING',
      stageLabel: 'Stage 1: Pre-Construction & Planning',
      sequenceOrder: 1,
      reason:
        profile.locationType === 'MIDC'
          ? `Your business is located in MIDC Industrial Area (${profile.industrialArea || 'Chakan'}) and involves new construction (${profile.builtUpAreaSqft.toLocaleString()} sq.ft). MIDC Building Plan Sanction with Provisional Fire NOC is a mandatory pre-requisite before commencing civil works.`
          : 'Located in Non-MIDC area. Building permission must be obtained from the local Municipal Corporation / Town Planning Authority.',
      legalBasis: 'MIDC Development Control Regulations & Maharashtra Fire Prevention and Life Safety Measures Act',
      mandatoryDocuments: ['MIDC Plot Allotment Letter & Lease', 'Architectural Building & Floor Plan', 'Approved Site Layout Plan'],
    },

    // 2. FSSAI Central License (Hero Application)
    {
      id: 'rule-cs-02',
      code: 'FSSAI_CENTRAL_LICENSE',
      name: 'FSSAI Central Licence for Cold Storage / Food Warehouse',
      department: 'Food Safety and Standards Authority of India (FSSAI)',
      authorityName: 'Designated Officer & Central Licensing Authority (Western Region)',
      status: profile.isFoodStorage ? 'APPLICABLE' : 'NOT_APPLICABLE',
      stage: 'PLANNING',
      stageLabel: 'Stage 1: Pre-Construction & Planning',
      sequenceOrder: 2,
      isHeroFocus: true,
      reason: profile.isFoodStorage
        ? `Your business profile declares food & perishable storage with ${profile.storageCapacityMt.toLocaleString()} MT capacity in Maharashtra. FSSAI Food Business Operator (FBO) Central License is mandatory for food storage / cold chain operations.`
        : 'Your business profile indicates non-food industrial storage. FSSAI licensing is not required.',
      legalBasis: 'Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations, 2011',
      mandatoryDocuments: [
        'Detailed Project Report (DPR)',
        'Refrigeration & Chamber Layout Plan',
        'Process Flow Diagram',
        'Company PAN & Incorporation Certificate',
      ],
    },

    // 3. MPCB Consent to Establish
    {
      id: 'rule-cs-03',
      code: 'MPCB_CTE',
      name: 'MPCB Consent to Establish (CTE - Green/Orange Category)',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      authorityName: 'Regional Officer - MPCB Pune',
      status: 'APPLICABLE',
      stage: 'PLANNING',
      stageLabel: 'Stage 1: Pre-Construction & Planning',
      sequenceOrder: 3,
      reason: `Commercial cold storage facilities with industrial ammonia/freon refrigeration compressors and capital investment of ₹${(profile.totalInvestmentInr / 10000000).toFixed(2)} Cr require MPCB Consent to Establish prior to equipment installation.`,
      legalBasis: 'Water (Prevention and Control of Pollution) Act 1974 & Air Act 1981',
      mandatoryDocuments: ['Detailed Project Report (DPR)', 'Site Plan', 'Effluent Management / Wastewater Treatment Plan'],
    },

    // 4. Industrial Electricity Connection (MSEDCL)
    {
      id: 'rule-cs-04',
      code: 'MSEDCL_POWER',
      name: 'Industrial High Tension (HT) Power Sanction (750 kW)',
      department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
      authorityName: 'Superintending Engineer (O&M) - MSEDCL Pune',
      status: profile.powerRequirementKw > 100 ? 'APPLICABLE' : 'CONDITIONAL',
      stage: 'UTILITIES',
      stageLabel: 'Stage 2: Utilities & Infrastructure',
      sequenceOrder: 4,
      reason: `High power demand of ${profile.powerRequirementKw} kW for continuous blast freezing and chamber cooling exceeds standard LT limits (>100 kW), triggering a dedicated 11kV/22kV HT Industrial Power Sanction with sub-station feasibility approval.`,
      legalBasis: 'Maharashtra Electricity Regulatory Commission (MERC) Supply Code Regulations',
      mandatoryDocuments: ['Electrical Single Line Diagram (SLD)', 'Connected Load Distribution Sheet', 'MIDC Allotment / Ownership Proof'],
    },

    // 5. MIDC Industrial Water Connection
    {
      id: 'rule-cs-05',
      code: 'MIDC_WATER',
      name: 'MIDC Industrial Water Supply Sanction (25 KLD)',
      department: 'MIDC Water Works Division',
      authorityName: 'Executive Engineer - MIDC Water Supply Division, Pune',
      status: profile.locationType === 'MIDC' ? 'APPLICABLE' : 'NOT_APPLICABLE',
      stage: 'UTILITIES',
      stageLabel: 'Stage 2: Utilities & Infrastructure',
      sequenceOrder: 5,
      reason: `Located within MIDC Chakan with proposed daily water requirement of ${profile.waterRequirementKld} KLD for cooling tower evaporators, condenser circulation, and staff sanitation.`,
      legalBasis: 'MIDC Water Supply Regulations & Policy',
      mandatoryDocuments: ['Internal Plumbing & Water Distribution Layout', 'Water Balance Chart', 'MIDC Allotment Letter'],
    },

    // 6. MIDC Drainage & Effluent Connection
    {
      id: 'rule-cs-06',
      code: 'MIDC_DRAINAGE',
      name: 'MIDC Underground Drainage & Effluent Connection Sanction',
      department: 'MIDC Public Health & Drainage Department',
      authorityName: 'MIDC Engineering Division, Pune',
      status: profile.locationType === 'MIDC' ? 'APPLICABLE' : 'NOT_APPLICABLE',
      stage: 'UTILITIES',
      stageLabel: 'Stage 2: Utilities & Infrastructure',
      sequenceOrder: 6,
      reason: 'Sanction required to connect facility drainage, floor washings, and treated effluent lines into MIDC industrial trunk sewer network.',
      legalBasis: 'MIDC Drainage and Disposal of Industrial Waste Regulations',
      mandatoryDocuments: ['Drainage & Storm Water Layout Plan', 'Pre-treatment / Neutralization Tank Design'],
    },

    // 7. Factory Registration & License (DISH)
    {
      id: 'rule-cs-07',
      code: 'DISH_FACTORY_LICENSE',
      name: 'Factory Registration & Plan Approval (DISH Maharashtra)',
      department: 'Directorate of Industrial Safety & Health (DISH)',
      authorityName: 'Joint Director - DISH Pune Region',
      status: profile.proposedEmployment >= 20 && profile.powerRequirementKw > 0 ? 'STAGE_DEPENDENT' : 'CONDITIONAL',
      stage: 'PRE_COMMISSIONING',
      stageLabel: 'Stage 3: Pre-Commissioning Clearances',
      sequenceOrder: 7,
      reason: `Proposed workforce of ${profile.proposedEmployment} employees with power-driven machinery (${profile.powerRequirementKw} kW) qualifies facility under Section 2(m)(i) of the Factories Act. Applicable prior to commissioning.`,
      legalBasis: 'The Factories Act, 1948 & Maharashtra Factories Rules, 1963',
      mandatoryDocuments: ['Factory Machinery Layout Plan', 'Safety & Ventilation Details', 'List of Key Plant & Machinery'],
    },

    // 8. Final Fire Safety NOC
    {
      id: 'rule-cs-08',
      code: 'FIRE_FINAL_NOC',
      name: 'Final Fire Safety Certificate / Operational Fire NOC',
      department: 'Maharashtra Fire Services & MIDC Fire Department',
      authorityName: 'Chief Fire Officer (CFO) - MIDC Pune',
      status: 'STAGE_DEPENDENT',
      stage: 'PRE_COMMISSIONING',
      stageLabel: 'Stage 3: Pre-Commissioning Clearances',
      sequenceOrder: 8,
      reason: 'Mandatory on-site inspection and testing of installed hydrants, sprinklers, smoke alarms, and ammonia leakage emergency dampers prior to facility occupancy.',
      legalBasis: 'Maharashtra Fire Prevention & Life Safety Measures Act, 2006',
      mandatoryDocuments: ['Provisional Fire NOC Copy', 'Fire Equipment Installation Certificate', 'Form-A Compliance Certificate from Licensed Agency'],
    },

    // 9. MIDC Occupancy Certificate
    {
      id: 'rule-cs-09',
      code: 'MIDC_OCCUPANCY',
      name: 'MIDC Building Occupancy & Completion Certificate (OC)',
      department: 'MIDC Special Planning Authority',
      authorityName: 'Executive Engineer / Planning Authority - MIDC Pune',
      status: 'STAGE_DEPENDENT',
      stage: 'PRE_COMMISSIONING',
      stageLabel: 'Stage 3: Pre-Commissioning Clearances',
      sequenceOrder: 9,
      reason: 'Final structural and architectural completion certification issued after joint inspection verifying construction complies strictly with approved building plans.',
      legalBasis: 'Maharashtra Regional and Town Planning Act, 1966 & MIDC DCR',
      mandatoryDocuments: ['Architect Completion Certificate', 'Final Fire NOC', 'Structural Stability Certificate'],
    },
  ];

  const applicableCount = results.filter((r) => r.status === 'APPLICABLE').length;
  const conditionalCount = results.filter((r) => r.status === 'CONDITIONAL').length;
  const stageDependentCount = results.filter((r) => r.status === 'STAGE_DEPENDENT').length;

  return {
    businessId: profile.id,
    totalEvaluated: results.length,
    applicableCount,
    conditionalCount,
    stageDependentCount,
    notConfiguredCount: 0,
    results,
  };
}
