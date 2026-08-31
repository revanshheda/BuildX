// SIH 26130 BuildX Core Types

export type UserRole = 'ENTREPRENEUR' | 'OFFICER';

export interface Persona {
  id: string;
  role: UserRole;
  name: string;
  designation: string;
  organization: string;
  email: string;
  avatarText: string;
}

export interface BusinessProfile {
  id: string;
  userId?: string;
  name: string;
  tradeName: string;
  entityType: string;
  cin: string;
  pan: string;
  gstin: string;
  sector: string;
  subSector: string;
  state: string;
  district: string;
  taluka: string;
  villageCity: string;
  pincode: string;
  locationType: 'MIDC' | 'Non-MIDC';
  industrialArea: string;
  plotNumber: string;
  projectType: string;
  projectStage: string;
  totalInvestmentInr: number;
  proposedEmployment: number;
  builtUpAreaSqft: number;
  powerRequirementKw: number;
  waterRequirementKld: number;
  isFoodStorage: boolean;
  storageType: string;
  storageCapacityMt: number;
  temperatureRange: string;
  contactName: string;
  contactDesignation: string;
  contactEmail: string;
  contactPhone: string;
  profileCompletionPct: number;
  createdAt: string;
  updatedAt: string;
}

export type DocumentVerificationStatus = 'UPLOADED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface VaultDocument {
  id: string;
  businessId: string;
  docCode: string;
  docName: string;
  category: 'LEGAL' | 'LAND' | 'TECHNICAL' | 'FINANCIAL' | 'ENVIRONMENTAL';
  fileName: string;
  fileSizeKb: number;
  fileUrl?: string;
  verificationStatus: DocumentVerificationStatus;
  uploadedAt: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'VALIDATION_ERROR'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'QUERY_RAISED'
  | 'QUERY_RESPONDED'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_COMPLETED'
  | 'FINAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface Application {
  id: string;
  appNumber: string; // e.g. APP-MH-2026-00124
  businessId: string;
  approvalCode: string;
  approvalName: string;
  department: string;
  authorityName: string;
  status: ApplicationStatus;
  slaDays: number;
  slaDueDate?: string;
  formData: Record<string, unknown>;
  submittedAt?: string;
  decidedAt?: string;
  decisionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentId?: string;
  docCode: string;
  docName: string;
  isMandatory: boolean;
  status: 'MISSING' | 'ATTACHED' | 'VERIFIED' | 'REJECTED';
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  actorRole: 'ENTREPRENEUR' | 'OFFICER' | 'SYSTEM';
  actorName?: string;
  eventType: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface QueryRecord {
  id: string;
  applicationId: string;
  officerName: string;
  title: string;
  queryText: string;
  status: 'OPEN' | 'RESPONDED' | 'RESOLVED';
  createdAt: string;
  response?: QueryResponse;
}

export interface QueryResponse {
  id: string;
  queryId: string;
  responseText: string;
  documentId?: string;
  submittedAt: string;
}

export interface InspectionChecklistItem {
  id: string;
  label: string;
  status: 'PASS' | 'FAIL' | 'NOT_CHECKED';
}

export interface InspectionRecord {
  id: string;
  applicationId: string;
  officerName: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM AM/PM
  location: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  outcome: 'PENDING' | 'SATISFACTORY' | 'UNSATISFACTORY' | 'FOLLOW_UP_REQUIRED';
  remarks?: string;
  checklist?: InspectionChecklistItem[];
  completedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ACTION_REQUIRED' | 'SUCCESS' | 'WARNING';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
