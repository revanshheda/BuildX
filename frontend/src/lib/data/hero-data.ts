import {
  BusinessProfile,
  Persona,
  VaultDocument,
  Application,
  ApplicationEvent,
  QueryRecord,
  InspectionRecord,
  NotificationItem,
} from '../types';

export const SECTORS_DATA = [
  {
    id: 'logistics_warehousing',
    name: 'Logistics / Warehousing',
    subSectors: [
      { id: 'cold_storage', name: 'Cold Storage / Cold Chain', status: 'CONFIGURED' },
      { id: 'general_warehouse', name: 'General Warehouse / Storage', status: 'NOT_CONFIGURED' },
      { id: 'distribution_center', name: 'Distribution Center', status: 'NOT_CONFIGURED' },
    ],
  },
  {
    id: 'tourism_hospitality',
    name: 'Tourism / Hospitality',
    subSectors: [
      { id: 'hotel_resort', name: 'Hotel / Resort', status: 'NOT_CONFIGURED' },
      { id: 'homestay', name: 'Homestay', status: 'NOT_CONFIGURED' },
      { id: 'restaurant_food_service', name: 'Restaurant / Food Service', status: 'NOT_CONFIGURED' },
    ],
  },
  {
    id: 'textiles_garments',
    name: 'Textiles & Garments',
    subSectors: [
      { id: 'garment_manufacturing', name: 'Garment Manufacturing', status: 'NOT_CONFIGURED' },
      { id: 'spinning_weaving', name: 'Spinning / Weaving', status: 'NOT_CONFIGURED' },
      { id: 'textile_processing_dyeing', name: 'Textile Processing / Dyeing', status: 'NOT_CONFIGURED' },
    ],
  },
  {
    id: 'food_processing',
    name: 'Food Processing',
    subSectors: [
      { id: 'dairy_processing', name: 'Dairy Processing', status: 'NOT_CONFIGURED' },
      { id: 'fruit_veg_processing', name: 'Fruit & Vegetable Processing', status: 'NOT_CONFIGURED' },
      { id: 'grain_flour_processing', name: 'Grain / Flour Processing', status: 'NOT_CONFIGURED' },
    ],
  },
];

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'persona_entrepreneur',
    role: 'ENTREPRENEUR',
    name: 'Vikram Malhotra',
    designation: 'Managing Director',
    organization: 'FreshChain Cold Logistics Pvt. Ltd.',
    email: 'vikram@freshchainlogistics.com',
    avatarText: 'VM',
  },
  {
    id: 'persona_officer',
    role: 'OFFICER',
    name: 'Rajesh Kumar (IO-MH-402)',
    designation: 'Designated Officer & Scrutiny Lead',
    organization: 'FSSAI / MIDC Single Window Cell (Pune Region)',
    email: 'rajesh.kumar@fssai.gov.in',
    avatarText: 'RK',
  },
];

export const INITIAL_HERO_BUSINESS: BusinessProfile = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  userId: 'persona_entrepreneur',
  name: 'FreshChain Cold Logistics Pvt. Ltd.',
  tradeName: 'FreshChain Pune Facility',
  entityType: 'Private Limited Company',
  cin: 'U63020PN2025PTC214589',
  pan: 'AAACF1234K',
  gstin: '27AAACF1234K1Z5',
  sector: 'Logistics / Warehousing',
  subSector: 'Cold Storage / Cold Chain',
  state: 'Maharashtra',
  district: 'Pune',
  taluka: 'Haveli',
  villageCity: 'Chakan',
  pincode: '410501',
  locationType: 'MIDC',
  industrialArea: 'Chakan Industrial Area Phase II',
  plotNumber: 'Plot No. E-45',
  projectType: 'New Project',
  projectStage: 'Proposed / Pre-Construction',
  totalInvestmentInr: 150000000, // 15 Crore
  proposedEmployment: 45,
  builtUpAreaSqft: 45000,
  powerRequirementKw: 750,
  waterRequirementKld: 25,
  isFoodStorage: true,
  storageType: 'Cold / Refrigerated',
  storageCapacityMt: 5000,
  temperatureRange: '-25°C to +10°C',
  contactName: 'Vikram Malhotra',
  contactDesignation: 'Managing Director',
  contactEmail: 'vikram@freshchainlogistics.com',
  contactPhone: '+91 98230 11223',
  profileCompletionPct: 92,
  createdAt: '2026-08-20T10:00:00Z',
  updatedAt: '2026-08-28T14:30:00Z',
};

// Base 7 Verified Documents
export const BASE_VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-001',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'PAN',
    docName: 'Company PAN Card',
    category: 'LEGAL',
    fileName: 'FreshChain_PAN.pdf',
    fileSizeKb: 540,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-22T09:15:00Z',
  },
  {
    id: 'doc-002',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'INCORPORATION_CERT',
    docName: 'Certificate of Incorporation (MCA)',
    category: 'LEGAL',
    fileName: 'FreshChain_COI.pdf',
    fileSizeKb: 1250,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-22T09:16:00Z',
  },
  {
    id: 'doc-003',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'MIDC_ALLOTMENT',
    docName: 'MIDC Plot Allotment Letter & Lease Agreement',
    category: 'LAND',
    fileName: 'MIDC_Plot_E45_Allotment.pdf',
    fileSizeKb: 3400,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-23T11:20:00Z',
  },
  {
    id: 'doc-004',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'SITE_PLAN',
    docName: 'Approved Site & Key Layout Plan',
    category: 'TECHNICAL',
    fileName: 'FreshChain_Site_Plan.pdf',
    fileSizeKb: 4120,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-24T14:45:00Z',
  },
  {
    id: 'doc-005',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'BUILDING_PLAN',
    docName: 'Architectural Building & Floor Plan',
    category: 'TECHNICAL',
    fileName: 'FreshChain_Building_Plan.pdf',
    fileSizeKb: 8200,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-24T15:00:00Z',
  },
  {
    id: 'doc-006',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'PROJECT_REPORT',
    docName: 'Detailed Project Report (DPR)',
    category: 'FINANCIAL',
    fileName: 'FreshChain_Cold_Storage_DPR.pdf',
    fileSizeKb: 6450,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-25T10:10:00Z',
  },
  {
    id: 'doc-007',
    businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    docCode: 'COLD_STORAGE_LAYOUT',
    docName: 'Refrigeration Equipment & Chamber Layout Plan',
    category: 'TECHNICAL',
    fileName: 'Refrigeration_Chamber_Layout.pdf',
    fileSizeKb: 2890,
    verificationStatus: 'VERIFIED',
    uploadedAt: '2026-08-25T11:30:00Z',
  },
];

// Document added during Query Response in Stage 4
export const HERO_PROCESS_FLOW_DOC: VaultDocument = {
  id: 'doc-008',
  businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  docCode: 'PROCESS_FLOW',
  docName: 'Cold Chain Process Flow Diagram (Revised v2)',
  category: 'TECHNICAL',
  fileName: 'FreshChain_ProcessFlow_v2.pdf',
  fileSizeKb: 1850,
  verificationStatus: 'VERIFIED',
  uploadedAt: '2026-08-28T14:00:00Z',
};

// ==========================================
// VERIFIED FINAL STAGE 5/6 HERO STATE
// ==========================================
export const VERIFIED_HERO_DOCUMENTS: VaultDocument[] = [
  ...BASE_VAULT_DOCUMENTS,
  HERO_PROCESS_FLOW_DOC,
];

export const VERIFIED_HERO_APPLICATION: Application = {
  id: 'app-hero-00124',
  appNumber: 'APP-MH-2026-00124',
  businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  approvalCode: 'FSSAI_CENTRAL_LICENSE',
  approvalName: 'FSSAI Central Licence for Cold Storage / Food Warehouse',
  department: 'Food Safety and Standards Authority of India (FSSAI)',
  authorityName: 'Designated Officer & Central Licensing Authority (Western Region)',
  status: 'APPROVED',
  slaDays: 30,
  decisionReason: 'APR-MH-2026-00124',
  formData: {
    premisesType: 'Owned (MIDC Industrial Leasehold)',
    operationalShift: '24 Hours / 3 Shifts',
    storageCategories: ['Dairy & Frozen Foods', 'Fresh Fruits & Vegetables', 'Processed Packaged Goods'],
    ammoniaSafetyAudit: 'Certified / Compliant',
    standbyGensetKva: '500 kVA',
  },
  submittedAt: '2026-08-28T09:30:00Z',
  decidedAt: '2026-08-29T16:00:00Z',
  createdAt: '2026-08-28T09:00:00Z',
  updatedAt: '2026-08-29T16:00:00Z',
};

export const VERIFIED_HERO_QUERIES: QueryRecord[] = [
  {
    id: 'query-hero-001',
    applicationId: 'app-hero-00124',
    officerName: 'Rajesh Kumar (IO-MH-402)',
    title: 'Detailed Cold Chain Process Flow & HACCP Plan Required',
    queryText:
      'Please submit the revised cold chain process flow diagram specifying temperature monitoring checkpoints and HACCP protocols for dairy and frozen goods storage chambers.',
    status: 'RESOLVED',
    createdAt: '2026-08-28T11:00:00Z',
    response: {
      id: 'resp-hero-001',
      queryId: 'query-hero-001',
      responseText:
        'Attached revised Process Flow Diagram (v2) detailing continuous multi-chamber temperature logging, ammonia sensor distribution, and HACCP compliance protocols.',
      documentId: 'doc-008',
      submittedAt: '2026-08-28T14:00:00Z',
    },
  },
];

export const VERIFIED_HERO_INSPECTION: InspectionRecord = {
  id: 'insp-hero-001',
  applicationId: 'app-hero-00124',
  officerName: 'Rajesh Kumar (IO-MH-402)',
  scheduledDate: '29 Aug 2026',
  scheduledTime: '11:00 AM',
  location: 'Plot No. E-45, MIDC Chakan Phase II, Pune',
  status: 'COMPLETED',
  outcome: 'SATISFACTORY',
  remarks:
    'Physical verification of 5,000 MT cold storage chambers, insulation thickness, ammonia alarm dampers, and standby 500 kVA genset verified compliant with FSSAI regulations.',
  checklist: [
    { id: 'chk-1', label: 'Premises & Chamber Insulation Verification', status: 'PASS' },
    { id: 'chk-2', label: 'Refrigeration Plant & Ammonia Safety Alarms', status: 'PASS' },
    { id: 'chk-3', label: 'Temperature Monitoring & Data Loggers', status: 'PASS' },
    { id: 'chk-4', label: 'Sanitation, Pest Control & Hygiene Barriers', status: 'PASS' },
    { id: 'chk-5', label: 'Standby Power Backup (500 kVA Genset)', status: 'PASS' },
  ],
  completedAt: '2026-08-29T14:30:00Z',
  createdAt: '2026-08-28T15:00:00Z',
};

export const VERIFIED_HERO_EVENTS: ApplicationEvent[] = [
  {
    id: 'evt-001',
    applicationId: 'app-hero-00124',
    actorRole: 'ENTREPRENEUR',
    actorName: 'Vikram Malhotra',
    eventType: 'APPLICATION_CREATED',
    title: 'Application Draft Created',
    description: 'FSSAI Central Licence application drafted using verified Business Profile information.',
    createdAt: '2026-08-28T09:00:00Z',
  },
  {
    id: 'evt-002',
    applicationId: 'app-hero-00124',
    actorRole: 'ENTREPRENEUR',
    actorName: 'Vikram Malhotra',
    eventType: 'APPLICATION_SUBMITTED',
    title: 'Application Submitted',
    description: 'Application APP-MH-2026-00124 submitted to FSSAI Central Licensing Authority.',
    createdAt: '2026-08-28T09:30:00Z',
  },
  {
    id: 'evt-003',
    applicationId: 'app-hero-00124',
    actorRole: 'OFFICER',
    actorName: 'Rajesh Kumar',
    eventType: 'QUERY_RAISED',
    title: 'Query Raised: Detailed Cold Chain Process Flow Required',
    description: 'Clarification requested regarding temperature checkpoint monitoring and HACCP plan.',
    createdAt: '2026-08-28T11:00:00Z',
  },
  {
    id: 'evt-004',
    applicationId: 'app-hero-00124',
    actorRole: 'ENTREPRENEUR',
    actorName: 'Vikram Malhotra',
    eventType: 'QUERY_RESPONDED',
    title: 'Query Response Submitted',
    description: 'Uploaded revised Cold Chain Process Flow Diagram (v2) with temperature checkpoints.',
    createdAt: '2026-08-28T14:00:00Z',
  },
  {
    id: 'evt-005',
    applicationId: 'app-hero-00124',
    actorRole: 'OFFICER',
    actorName: 'Rajesh Kumar',
    eventType: 'INSPECTION_SCHEDULED',
    title: 'Site Inspection Scheduled',
    description: 'Joint physical site verification scheduled for 29 Aug 2026 at 11:00 AM at MIDC Chakan.',
    createdAt: '2026-08-28T15:00:00Z',
  },
  {
    id: 'evt-006',
    applicationId: 'app-hero-00124',
    actorRole: 'OFFICER',
    actorName: 'Rajesh Kumar',
    eventType: 'INSPECTION_COMPLETED',
    title: 'Inspection Completed — Outcome: SATISFACTORY',
    description: '5-point technical inspection checklist verified compliant on-site at MIDC Chakan facility.',
    createdAt: '2026-08-29T14:30:00Z',
  },
  {
    id: 'evt-007',
    applicationId: 'app-hero-00124',
    actorRole: 'OFFICER',
    actorName: 'Rajesh Kumar',
    eventType: 'APPLICATION_APPROVED',
    title: 'Application Approved — Clearance Reference: APR-MH-2026-00124',
    description: 'FSSAI Central Licence clearance approved and issued for FreshChain Cold Logistics Pvt. Ltd.',
    createdAt: '2026-08-29T16:00:00Z',
  },
];

export const VERIFIED_HERO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-hero-001',
    title: 'Application APP-MH-2026-00124 APPROVED!',
    message: 'FSSAI Central Licence has been approved. Reference: APR-MH-2026-00124. Active compliance tracking enabled.',
    type: 'SUCCESS',
    linkUrl: '/application/app-hero-00124',
    isRead: false,
    createdAt: '2026-08-29T16:00:00Z',
  },
];

// ==========================================
// INITIAL DRAFT WORKFLOW STATE (For Demo Replay)
// ==========================================
export const DRAFT_HERO_APPLICATION: Application = {
  id: 'app-hero-00124',
  appNumber: 'APP-MH-2026-00124',
  businessId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  approvalCode: 'FSSAI_CENTRAL_LICENSE',
  approvalName: 'FSSAI Central Licence for Cold Storage / Food Warehouse',
  department: 'Food Safety and Standards Authority of India (FSSAI)',
  authorityName: 'Designated Officer & Central Licensing Authority (Western Region)',
  status: 'DRAFT',
  slaDays: 30,
  formData: {
    premisesType: 'Owned (MIDC Industrial Leasehold)',
    operationalShift: '24 Hours / 3 Shifts',
    storageCategories: ['Dairy & Frozen Foods', 'Fresh Fruits & Vegetables', 'Processed Packaged Goods'],
    ammoniaSafetyAudit: 'Certified / Compliant',
    standbyGensetKva: '500 kVA',
  },
  createdAt: '2026-08-28T09:00:00Z',
  updatedAt: '2026-08-28T09:00:00Z',
};

// Aliases for compatibility
export const INITIAL_VAULT_DOCUMENTS = VERIFIED_HERO_DOCUMENTS;
