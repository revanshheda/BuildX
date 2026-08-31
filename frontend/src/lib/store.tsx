// 'use client' directive removed — Vite is always client-side

import React, { useState, useEffect } from 'react';
import {
  BusinessProfile,
  Persona,
  VaultDocument,
  Application,
  ApplicationEvent,
  QueryRecord,
  InspectionRecord,
  InspectionChecklistItem,
  NotificationItem,
} from './types';
import {
  DEMO_PERSONAS,
  INITIAL_HERO_BUSINESS,
  BASE_VAULT_DOCUMENTS,
  VERIFIED_HERO_DOCUMENTS,
  VERIFIED_HERO_APPLICATION,
  VERIFIED_HERO_QUERIES,
  VERIFIED_HERO_INSPECTION,
  VERIFIED_HERO_EVENTS,
  VERIFIED_HERO_NOTIFICATIONS,
  DRAFT_HERO_APPLICATION,
} from './data/hero-data';
import { AppContext } from './app-context';

const STORAGE_KEY = 'buildx_sih_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize to Verified Final Stage 5/6 Hero State by default
  const [currentPersona, setCurrentPersona] = useState<Persona>(DEMO_PERSONAS[0]);
  const [business, setBusiness] = useState<BusinessProfile>(INITIAL_HERO_BUSINESS);
  const [documents, setDocuments] = useState<VaultDocument[]>(VERIFIED_HERO_DOCUMENTS);
  const [application, setApplication] = useState<Application>(VERIFIED_HERO_APPLICATION);
  const [events, setEvents] = useState<ApplicationEvent[]>(VERIFIED_HERO_EVENTS);
  const [queries, setQueries] = useState<QueryRecord[]>(VERIFIED_HERO_QUERIES);
  const [inspection, setInspection] = useState<InspectionRecord | null>(VERIFIED_HERO_INSPECTION);
  const [notifications, setNotifications] = useState<NotificationItem[]>(VERIFIED_HERO_NOTIFICATIONS);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.application) setApplication(parsed.application);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.queries) setQueries(parsed.queries);
        if (parsed.inspection !== undefined) setInspection(parsed.inspection);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.personaId) {
          const p = DEMO_PERSONAS.find((item) => item.id === parsed.personaId);
          if (p) setCurrentPersona(p);
        }
      } else {
        // First load in new session: persist initial verified hero state
        persistState({
          business: INITIAL_HERO_BUSINESS,
          documents: VERIFIED_HERO_DOCUMENTS,
          application: VERIFIED_HERO_APPLICATION,
          events: VERIFIED_HERO_EVENTS,
          queries: VERIFIED_HERO_QUERIES,
          inspection: VERIFIED_HERO_INSPECTION,
          notifications: VERIFIED_HERO_NOTIFICATIONS,
          personaId: DEMO_PERSONAS[0].id,
        });
      }
    } catch (e) {
      console.warn('Could not load cached state', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state changes to LocalStorage
  const persistState = (overrides: Partial<Record<string, unknown>> = {}) => {
    try {
      const stateToSave = {
        business,
        documents,
        application,
        events,
        queries,
        inspection,
        notifications,
        personaId: currentPersona.id,
        ...overrides,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Could not persist state', e);
    }
  };

  const setPersona = (personaId: string) => {
    const p = DEMO_PERSONAS.find((item) => item.id === personaId) || DEMO_PERSONAS[0];
    setCurrentPersona(p);
    persistState({ personaId: p.id });
  };

  const updateBusiness = (updates: Partial<BusinessProfile>) => {
    setBusiness((prev) => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      persistState({ business: updated });
      return updated;
    });
  };

  const addDocument = (doc: Omit<VaultDocument, 'id' | 'uploadedAt'>): VaultDocument => {
    const newDoc: VaultDocument = {
      ...doc,
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      persistState({ documents: updated });
      return updated;
    });
    return newDoc;
  };

  const updateDocumentStatus = (docId: string, status: VaultDocument['verificationStatus']) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === docId ? { ...d, verificationStatus: status } : d));
      persistState({ documents: updated });
      return updated;
    });
  };

  const updateApplicationStatus = (status: Application['status'], reason?: string) => {
    setApplication((prev) => {
      const updated: Application = {
        ...prev,
        status,
        decisionReason: reason || prev.decisionReason,
        updatedAt: new Date().toISOString(),
        submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : prev.submittedAt,
        decidedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date().toISOString() : prev.decidedAt,
      };
      persistState({ application: updated });
      return updated;
    });
  };

  const updateApplicationFormData = (data: Record<string, unknown>) => {
    setApplication((prev) => {
      const updated: Application = {
        ...prev,
        formData: { ...prev.formData, ...data },
        updatedAt: new Date().toISOString(),
      };
      persistState({ application: updated });
      return updated;
    });
  };

  const submitApplication = () => {
    const submissionTime = new Date().toISOString();
    setApplication((prev) => {
      const updated: Application = {
        ...prev,
        status: 'SUBMITTED',
        submittedAt: submissionTime,
        updatedAt: submissionTime,
      };
      persistState({ application: updated });
      return updated;
    });

    addEvent({
      applicationId: application.id,
      actorRole: 'ENTREPRENEUR',
      actorName: currentPersona.name,
      eventType: 'APPLICATION_SUBMITTED',
      title: 'Application Submitted',
      description: `Application ${application.appNumber} submitted to ${application.department} via Maharashtra Single Window Portal.`,
    });

    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Application ${application.appNumber} Submitted Successfully`,
      message: `Your FSSAI Central Licence application has been submitted to the scrutiny queue.`,
      type: 'SUCCESS',
      linkUrl: `/application/${application.id}`,
      isRead: false,
      createdAt: submissionTime,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const addEvent = (event: Omit<ApplicationEvent, 'id' | 'createdAt'>) => {
    const newEvt: ApplicationEvent = {
      ...event,
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => {
      const updated = [newEvt, ...prev];
      persistState({ events: updated });
      return updated;
    });
  };

  const addQuery = (title: string, text: string) => {
    const newQuery: QueryRecord = {
      id: 'query-' + Math.random().toString(36).substring(2, 9),
      applicationId: application.id,
      officerName: currentPersona.name,
      title,
      queryText: text,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    setQueries((prev) => {
      const updated = [newQuery, ...prev];
      persistState({ queries: updated });
      return updated;
    });
    updateApplicationStatus('QUERY_RAISED');
    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'QUERY_RAISED',
      title: `Query Raised: ${title}`,
      description: text,
    });
    // Add Notification for entrepreneur
    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Action Required: Query Raised on ${application.appNumber}`,
      message: `The department requested: "${title}". Please upload the requested clarification.`,
      type: 'ACTION_REQUIRED',
      linkUrl: `/query/${newQuery.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const respondToQuery = (queryId: string, responseText: string, docId?: string) => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              status: 'RESPONDED' as const,
              response: {
                id: 'resp-' + Math.random().toString(36).substring(2, 9),
                queryId,
                responseText,
                documentId: docId,
                submittedAt: new Date().toISOString(),
              },
            }
          : q
      )
    );
    updateApplicationStatus('QUERY_RESPONDED');
    addEvent({
      applicationId: application.id,
      actorRole: 'ENTREPRENEUR',
      actorName: currentPersona.name,
      eventType: 'QUERY_RESPONDED',
      title: 'Query Response Submitted',
      description: responseText,
    });
    // Add notification for officer
    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Query Response Received for ${application.appNumber}`,
      message: `Applicant has submitted a response and attached requested documentation.`,
      type: 'INFO',
      linkUrl: `/government/applications/${application.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const scheduleInspection = (date: string, time: string, location: string) => {
    const insp: InspectionRecord = {
      id: 'insp-001',
      applicationId: application.id,
      officerName: currentPersona.name,
      scheduledDate: date,
      scheduledTime: time,
      location,
      status: 'SCHEDULED',
      outcome: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setInspection(insp);
    updateApplicationStatus('INSPECTION_SCHEDULED');
    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'INSPECTION_SCHEDULED',
      title: `Site Inspection Scheduled`,
      description: `Official site verification scheduled for ${date} at ${time} by ${currentPersona.name}.`,
    });
    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Site Inspection Scheduled for ${date}`,
      message: `Joint site inspection for ${application.appNumber} scheduled at ${time}.`,
      type: 'INFO',
      linkUrl: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const startInspection = () => {
    setInspection((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : null));
    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'INSPECTION_STARTED',
      title: 'Site Inspection In Progress',
      description: `Scrutiny officer ${currentPersona.name} commenced physical verification on-site at MIDC Chakan.`,
    });
  };

  const completeInspection = (
    outcome: 'SATISFACTORY' | 'UNSATISFACTORY' | 'FOLLOW_UP_REQUIRED',
    remarks: string,
    checklist?: InspectionChecklistItem[]
  ) => {
    const completionTime = new Date().toISOString();
    setInspection((prev) =>
      prev
        ? {
            ...prev,
            status: 'COMPLETED',
            outcome,
            remarks,
            checklist: checklist || prev.checklist,
            completedAt: completionTime,
          }
        : null
    );
    updateApplicationStatus('INSPECTION_COMPLETED');
    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'INSPECTION_COMPLETED',
      title: `Inspection Completed — Outcome: ${outcome}`,
      description: remarks,
    });

    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Site Inspection Completed (Outcome: ${outcome})`,
      message: `Officer recorded inspection outcome as ${outcome}. Application moved to Final Review.`,
      type: outcome === 'SATISFACTORY' ? 'SUCCESS' : 'WARNING',
      linkUrl: `/application/${application.id}`,
      isRead: false,
      createdAt: completionTime,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const resolveQuery = (queryId: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, status: 'RESOLVED' as const } : q))
    );
  };

  const approveApplication = (referenceNumber: string = 'APR-MH-2026-00124') => {
    const decisionTime = new Date().toISOString();
    setApplication((prev) => {
      const updated: Application = {
        ...prev,
        status: 'APPROVED',
        decisionReason: referenceNumber,
        decidedAt: decisionTime,
        updatedAt: decisionTime,
      };
      persistState({ application: updated });
      return updated;
    });

    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'APPLICATION_APPROVED',
      title: `Application Approved — Clearance Reference: ${referenceNumber}`,
      description: `FSSAI Central Licence clearance approved and issued for FreshChain Cold Logistics Pvt. Ltd.`,
    });

    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Application ${application.appNumber} APPROVED!`,
      message: `FSSAI Central Licence has been approved. Reference: ${referenceNumber}. Active compliance tracking is now enabled.`,
      type: 'SUCCESS',
      linkUrl: `/application/${application.id}`,
      isRead: false,
      createdAt: decisionTime,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const rejectApplication = (reason: string) => {
    const decisionTime = new Date().toISOString();
    setApplication((prev) => {
      const updated: Application = {
        ...prev,
        status: 'REJECTED',
        decisionReason: reason,
        decidedAt: decisionTime,
        updatedAt: decisionTime,
      };
      persistState({ application: updated });
      return updated;
    });

    addEvent({
      applicationId: application.id,
      actorRole: 'OFFICER',
      actorName: currentPersona.name,
      eventType: 'APPLICATION_REJECTED',
      title: 'Application Rejected by Scrutiny Authority',
      description: reason,
    });

    const notif: NotificationItem = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title: `Application ${application.appNumber} Decision: Rejected`,
      message: `Reason: ${reason}`,
      type: 'WARNING',
      linkUrl: `/application/${application.id}`,
      isRead: false,
      createdAt: decisionTime,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const resetDemoData = (mode: 'APPROVED' | 'DRAFT' = 'APPROVED') => {
    localStorage.removeItem(STORAGE_KEY);
    if (mode === 'DRAFT') {
      const draftApp = { ...DRAFT_HERO_APPLICATION };
      const draftDocs = [...BASE_VAULT_DOCUMENTS];
      const draftEvts: ApplicationEvent[] = [
        {
          id: 'evt-001',
          applicationId: 'app-hero-00124',
          actorRole: 'ENTREPRENEUR',
          actorName: 'Vikram Malhotra',
          eventType: 'APPLICATION_CREATED',
          title: 'Application Draft Created',
          description: 'FSSAI Central Licence application drafted using verified Business Profile information.',
          createdAt: new Date().toISOString(),
        },
      ];
      setBusiness(INITIAL_HERO_BUSINESS);
      setDocuments(draftDocs);
      setApplication(draftApp);
      setEvents(draftEvts);
      setQueries([]);
      setInspection(null);
      setNotifications([
        {
          id: 'notif-001',
          title: 'Business Profile 92% Complete',
          message: 'MIDC Chakan plot details and contact information verified.',
          type: 'INFO',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setCurrentPersona(DEMO_PERSONAS[0]);
      persistState({
        business: INITIAL_HERO_BUSINESS,
        documents: draftDocs,
        application: draftApp,
        events: draftEvts,
        queries: [],
        inspection: null,
        notifications: [],
        personaId: DEMO_PERSONAS[0].id,
      });
    } else {
      // Default: Reset to Verified Final Stage 5/6 Approved State
      setBusiness(INITIAL_HERO_BUSINESS);
      setDocuments(VERIFIED_HERO_DOCUMENTS);
      setApplication(VERIFIED_HERO_APPLICATION);
      setEvents(VERIFIED_HERO_EVENTS);
      setQueries(VERIFIED_HERO_QUERIES);
      setInspection(VERIFIED_HERO_INSPECTION);
      setNotifications(VERIFIED_HERO_NOTIFICATIONS);
      setCurrentPersona(DEMO_PERSONAS[0]);
      persistState({
        business: INITIAL_HERO_BUSINESS,
        documents: VERIFIED_HERO_DOCUMENTS,
        application: VERIFIED_HERO_APPLICATION,
        events: VERIFIED_HERO_EVENTS,
        queries: VERIFIED_HERO_QUERIES,
        inspection: VERIFIED_HERO_INSPECTION,
        notifications: VERIFIED_HERO_NOTIFICATIONS,
        personaId: DEMO_PERSONAS[0].id,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPersona,
        setPersona,
        business,
        updateBusiness,
        documents,
        addDocument,
        updateDocumentStatus,
        application,
        updateApplicationStatus,
        updateApplicationFormData,
        submitApplication,
        events,
        addEvent,
        queries,
        addQuery,
        respondToQuery,
        resolveQuery,
        inspection,
        scheduleInspection,
        startInspection,
        completeInspection,
        approveApplication,
        rejectApplication,
        notifications,
        markNotificationRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
