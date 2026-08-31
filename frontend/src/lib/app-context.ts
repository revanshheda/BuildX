import { createContext } from 'react';
import {
  Application,
  ApplicationEvent,
  BusinessProfile,
  InspectionChecklistItem,
  InspectionRecord,
  NotificationItem,
  Persona,
  QueryRecord,
  VaultDocument,
} from './types';

export interface AppContextType {
  currentPersona: Persona;
  setPersona: (personaId: string) => void;
  business: BusinessProfile;
  updateBusiness: (updates: Partial<BusinessProfile>) => void;
  documents: VaultDocument[];
  addDocument: (doc: Omit<VaultDocument, 'id' | 'uploadedAt'>) => VaultDocument;
  updateDocumentStatus: (docId: string, status: VaultDocument['verificationStatus']) => void;
  application: Application;
  updateApplicationStatus: (status: Application['status'], reason?: string) => void;
  updateApplicationFormData: (data: Record<string, unknown>) => void;
  submitApplication: () => void;
  events: ApplicationEvent[];
  addEvent: (event: Omit<ApplicationEvent, 'id' | 'createdAt'>) => void;
  queries: QueryRecord[];
  addQuery: (title: string, text: string) => void;
  respondToQuery: (queryId: string, responseText: string, docId?: string) => void;
  inspection: InspectionRecord | null;
  scheduleInspection: (date: string, time: string, location: string) => void;
  startInspection: () => void;
  completeInspection: (
    outcome: 'SATISFACTORY' | 'UNSATISFACTORY' | 'FOLLOW_UP_REQUIRED',
    remarks: string,
    checklist?: InspectionChecklistItem[],
  ) => void;
  approveApplication: (referenceNumber?: string) => void;
  rejectApplication: (reason: string) => void;
  resolveQuery: (queryId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  resetDemoData: (mode?: 'APPROVED' | 'DRAFT') => void;
  user?: any;
  session?: any;
  signOut?: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
