# Aryan — Entrepreneur Portal Frontend Work Brief

## 1. Your ownership

Build the complete **entrepreneur-facing frontend** for BuildX. This is a frontend-only prototype: use realistic local mock data and client-side state. Do not build a backend, database, Supabase integration, authentication service, API routes, payment flow, or real government integration.

Your work should live primarily inside:

```text
frontend/src/features/entrepreneur/
frontend/src/data/entrepreneurMockData.js
```

Do not edit government feature files. Avoid editing shared components unless coordinated with Revansh. Revansh owns the shared app shell, router setup, tokens, and generic UI primitives. If those are not ready, create temporary feature-local components and keep them inside your own folder so they can be replaced later.

## 2. Product and demo context

BuildX helps a Maharashtra entrepreneur discover approvals, prepare an application, validate it, submit it, and track the government workflow.

Use this consistent hero business throughout the UI:

```text
Business: FreshChain Cold Logistics Pvt. Ltd.
Sector: Logistics / Warehousing
Sub-sector: Cold Storage / Cold Chain
State: Maharashtra
District/City: Pune
Location type: MIDC
Project: New Cold Storage
Project stage: Proposed / New
Food stored: Yes
Storage type: Cold / Refrigerated
Capacity: 5,000 MT
Application ID: APP-MH-2026-00124
Primary approval/application: FSSAI
```

All regulatory facts, deadlines, statistics, eligibility results, and dates shown in the prototype must be labelled as configured or demo information where appropriate. Never imply legal certainty.

## 3. Entrepreneur routes

Create the following route-ready page components. Revansh will connect them to the shared router, or you may temporarily provide a feature route map export.

| Route | Page component | Purpose |
|---|---|---|
| `/entrepreneur/dashboard` | `EntrepreneurDashboardPage` | Action-first overview of the entire journey |
| `/entrepreneur/business-profile` | `BusinessProfilePage` | Multi-step business and project profile |
| `/entrepreneur/approval-intelligence` | `ApprovalIntelligencePage` | Explainable approval analysis |
| `/entrepreneur/roadmap` | `RoadmapPage` | Personalized approval journey |
| `/entrepreneur/applications` | `EntrepreneurApplicationsPage` | Entrepreneur application list |
| `/entrepreneur/applications/new/:approvalId` | `ApplicationBuilderPage` | Guided application form |
| `/entrepreneur/applications/:applicationId` | `ApplicationTrackingPage` | Complete application status/detail |
| `/entrepreneur/applications/:applicationId/validate` | `PreValidationPage` | Submission readiness checks |
| `/entrepreneur/applications/:applicationId/submit` | `SubmissionPage` | Final review and submission |
| `/entrepreneur/documents` | `DocumentVaultPage` | Reusable document repository |
| `/entrepreneur/documents/:documentId` | `DocumentDetailPage` | Document metadata and preview |
| `/entrepreneur/queries` | `EntrepreneurQueriesPage` | All government queries |
| `/entrepreneur/queries/:queryId` | `EntrepreneurQueryDetailPage` | Query response workflow |
| `/entrepreneur/inspections/:inspectionId` | `EntrepreneurInspectionPage` | Scheduled/completed inspection details |
| `/entrepreneur/decisions/:applicationId` | `EntrepreneurDecisionPage` | Approval or rejection result |
| `/entrepreneur/compliance` | `ComplianceRenewalsPage` | Compliance, expiry, and renewals |
| `/entrepreneur/incentives` | `IncentivesPage` | Potentially relevant opportunities |
| `/entrepreneur/incentives/:incentiveId` | `IncentiveDetailPage` | Explainable incentive details |
| `/entrepreneur/notifications` | `EntrepreneurNotificationsPage` | Actionable notifications and alerts |
| `/entrepreneur/account` | `EntrepreneurAccountPage` | User and business account summary |

## 4. Portal navigation

The entrepreneur navigation must contain:

1. Dashboard
2. Business Profile
3. Approval Intelligence
4. My Roadmap
5. Applications
6. Document Vault
7. Compliance & Renewals
8. Incentives & Schemes
9. Notifications
10. Profile / Account

The current route must have a clear active state. On small screens, navigation should collapse into a drawer/menu.

## 5. Detailed page requirements

### 5.1 Entrepreneur dashboard

The dashboard must answer: “What do I need to do next?” Arrange content in this order:

1. Welcome and hero-business context
2. Prominent Action Required card
3. Summary cards: approvals identified, actions required, applications, active approvals
4. Current application with a visual stage tracker
5. Upcoming query or inspection
6. Condensed approval roadmap
7. Compliance/renewal preview
8. Incentive preview
9. Recent activity

Use the hero query “Revised Process Flow Required.” Its CTA must open the query detail. Do not create decorative KPIs with no destination or meaning.

### 5.2 Business Profile

Build a responsive multi-step form with a visible completion percentage and these steps:

1. Business Identity
2. Applicant / Contact
3. Classification
4. Location
5. Project
6. Activity
7. Capacity & Scale
8. Investment & Employment
9. Review

Required interactions:

- Previous, Save Draft, Save & Continue, and Confirm actions.
- Inline required-field and format validation.
- Sector and sub-sector dependent options.
- All 4 sectors and 12 sub-sectors from the docs must be selectable.
- Conditional cold-storage questions appear for the hero sub-sector.
- Maharashtra location fields and MIDC/non-MIDC selection.
- Review screen before confirmation.
- Editing a decision-relevant field shows a warning that approval analysis may become outdated.
- A “Re-analyze Approvals” action appears after material changes.

Supported sector data:

```text
Logistics / Warehousing
- General Warehouse / Storage
- Cold Storage / Cold Chain
- Distribution Center

Tourism / Hospitality
- Hotel / Resort
- Homestay
- Restaurant / Food Service

Textiles & Garments
- Garment Manufacturing
- Spinning / Weaving
- Textile Processing / Dyeing

Food Processing
- Dairy Processing
- Fruit & Vegetable Processing
- Grain / Flour Processing
```

### 5.3 Approval Intelligence

Show an analysis header and requirement cards/table. Every requirement must include:

- Approval name and authority
- Status: Applicable, Conditional, Stage-dependent, Not Applicable, or Not Configured / Needs Review
- “Why this applies” explanation based on profile fields
- Stage and dependencies
- Required documents
- Source/reference and verification metadata
- CTA to open/start the relevant roadmap item

Use the controlled cold-storage pathway: MIDC Building Plan + Provisional Fire, FSSAI, MPCB Consent, Industrial Electricity, MIDC Water, MIDC Drainage, Factory Registration/Licence, Final Fire Approval, and Occupancy Certificate.

Do not show a fake legal confidence score. Show rule coverage and a conservative authority-confirmation notice instead. The other 11 sub-sectors must display **Not Configured**, never falsely display Not Applicable.

### 5.4 Personalized Roadmap

Create a vertical roadmap with an optional compact stage overview. Include:

- Overall progress based on actual mock items
- Current step and recommended next action
- Filters: All, Action Required, In Progress, Upcoming, Conditional, Approved
- Planning, Application, Construction, and Post-approval grouping
- Expandable detail panel for each item
- Requirement status separate from journey status
- Authority, dependencies, documents, application ID, source, and explanation
- Stale-roadmap banner after a profile change

Statuses must visually distinguish Not Started, In Progress, Submitted, Under Review, Query Raised, Inspection, Approved, Rejected, Conditional, Stage-dependent, and Not Configured.

### 5.5 Applications and Application Builder

The list page needs search/filter controls and rows/cards containing application ID, approval, authority, status, last updated time, and contextual action.

The builder needs these sections:

1. Applicant Details
2. Business Details
3. Site Details
4. Project Details
5. Technical Details
6. Documents
7. Declaration
8. Review

Auto-fill hero profile fields in the UI. Let the user edit application-specific fields, save a draft, see section completion, attach/reuse vault documents, accept a declaration, and continue to validation. Build at least the FSSAI hero form fully; other application templates may use an honest “Template not configured” state.

### 5.6 Document Vault

Provide summary counts, upload CTA, name/type search, status filters, category filters, and either a responsive table or cards. Use statuses Uploaded, Pending Verification, Verified, Rejected, Expiring, and Expired.

Seed PAN, Company Registration, MIDC Plot/Lease, Site Plan, Building Plan, Project Report, Cold Storage Layout, and Process Flow. Initially make Process Flow missing so the validation demo works.

The upload interaction must accept/display PDF, JPG/JPEG, and PNG; validate type and mock size; collect document type and optional metadata; show progress/success/error UI; and add the file to client state. A detail view must show status, dates, expiry, linked applications, version, preview placeholder, and open/download actions. Do not claim a locally uploaded mock file is government verified.

### 5.7 Pre-validation

Build a clear quality-gate screen containing:

- Overall BLOCKED or READY TO SUBMIT status
- Summary counts
- Required field checks
- Required document and document-state checks
- Consistency checks
- Declaration check
- Blocking issue list
- Warning list
- Last-run timestamp and freshness state
- “Fix Issue” deep links/actions
- “Run Validation Again” action

The default demo must fail because Process Flow is missing. After a user selects/uploads Process Flow, re-running validation must pass and enable Continue to Submission. This state can be held in React state/localStorage.

### 5.8 Submission

Show a final read-only application summary, attached documents, declaration confirmation, latest validation status, and final checkbox. Disable submission until validation is current and passed and confirmation is checked.

On mock submission:

- Prevent double-click/duplicate submission.
- Show a loading state.
- Change local application status from READY_TO_SUBMIT to SUBMITTED.
- Show success with `APP-MH-2026-00124`, timestamp, next steps, View Application, and View Roadmap actions.

### 5.9 Application tracking

Create one detail workspace with Overview, Application, Documents, Validation, Timeline, Queries, Inspection, Decision, and SLA sections/tabs. Display a chronological event timeline and only show actions valid for the current status.

Support visual states for DRAFT, VALIDATION_ERROR, READY_TO_SUBMIT, SUBMITTED, ASSIGNED, UNDER_REVIEW, QUERY_RAISED, QUERY_RESPONDED, INSPECTION_SCHEDULED, INSPECTION_COMPLETED, FINAL_REVIEW, APPROVED, and REJECTED.

### 5.10 Query pages

The query list must group Action Required, Submitted/Under Review, and Resolved queries. Query detail must show title, type, authority, message, requested document, blocking indicator, configured/demo due date, and history.

The response form requires a message, upload or existing-document selection, validation, submit confirmation, and success state. Use: “Revised process flow uploaded for review.” After submission, render “Response Submitted — Waiting for department review.”

### 5.11 Inspection and decision

Inspection detail must show status, configured date/time, location, authority, officer when allowed, preparation information, checklist/report summary, outcome, and remarks. Use the demo inspection on 05 Sep 2026 at 11:00 AM with a Satisfactory completed state variant.

Decision detail needs separate Approved and Rejected variants. Approval shows decision metadata and next compliance actions. Rejection always shows the officer-provided reason and available next action.

### 5.12 Compliance, renewals, and alerts

Create lists/cards for active approvals, compliance obligations, upcoming actions, approval expiry, renewal status, and document expiry. Use states Not Applicable, Not Due, Approaching, Due, Overdue, and Renewed. Labels must say “configured date/target” unless verified.

### 5.13 Incentives

Build discovery cards, filters, potentially relevant counts, saved items, and in-progress items. Each card explains why it appears and uses conservative labels: Likely Eligible, Potentially Eligible, or Needs Confirmation.

Incentive detail includes authority, configured benefit description, matching profile facts, eligibility criteria, missing information, required documents and their availability, application process, source, Save action, and Start Application action. Keep incentives visually separate from mandatory approvals.

### 5.14 Notifications and account

Notifications must be grouped/filterable as Action Required, Upcoming, and Information. Each item has read/unread state, timestamp, relevant entity, and deep-link action. Include query, inspection, application, approval, document, renewal, SLA, and incentive examples.

Account page shows entrepreneur identity, role, contact information, and associated hero business. Do not build complex multi-business switching.

## 6. Feature-local components

Create reusable entrepreneur components where useful:

```text
BusinessContextHeader
ActionRequiredCard
ApplicationStatusTracker
RoadmapTimeline
RoadmapItemCard
ApprovalRequirementCard
ProfileStepForm
ProfileProgress
ApplicationSectionStepper
DocumentCard
DocumentUploadDialog
ValidationSummary
ValidationCheckList
ApplicationTimeline
QueryResponseForm
InspectionSummary
DecisionBanner
ComplianceCard
IncentiveCard
NotificationItem
```

Do not duplicate generic buttons, inputs, cards, badges, dialogs, tables, or skeletons if Revansh has already supplied shared primitives.

## 7. Mock state and integration contract

Use a single entrepreneur mock-data module, not hard-coded objects scattered across pages. Keep IDs stable. Provide data for:

- Current entrepreneur and hero business
- Business profile and completion
- Nine approval requirements
- Personalized roadmap
- Application and timeline events
- Documents
- Validation checks
- Queries and responses
- Inspection
- Decision
- Compliance/renewals
- Incentives
- Notifications

Prefer a small React context/provider or a focused custom hook for demo mutations. Persist important demo changes in `localStorage` when practical. Do not make network requests to imaginary endpoints.

Export all route page components from:

```text
frontend/src/features/entrepreneur/index.js
```

Revansh should be able to import pages without knowing their internal folder structure.

## 8. UX and visual requirements

- Light/white government-enterprise design; never use a dark sidebar.
- Professional blue primary accent; charcoal text; subtle gray borders/shadows.
- Green, amber, red, and blue status semantics; never rely on color alone.
- Clear page titles, descriptions, breadcrumbs where useful, and one obvious primary action.
- Desktop-first, but functional on tablet and mobile.
- Cards/tables must stack or scroll safely on small screens.
- Provide loading skeletons, useful empty states, validation errors, and retry states.
- Use accessible labels, keyboard focus, semantic controls, and sufficient contrast.
- Keep animations minimal and respect reduced-motion preferences.

## 9. Out of scope

Do not implement:

- Backend/API/database/Supabase code
- Real authentication or storage
- Real government submission or departmental APIs
- Payments, e-signatures, certificates, or legal decisions
- OCR, document AI, fraud detection, or complex ML
- A nationwide regulatory or incentive database
- Fabricated legal deadlines, benefits, or regulatory claims

## 10. Definition of done

- Every entrepreneur route above has a polished, responsive page.
- Navigation and CTAs connect the full demo journey without dead ends.
- The missing Process Flow → fix → validation pass → submit flow works in client state.
- Query response, inspection, approval, roadmap, and notification variants are demonstrable.
- Mock data is centralized and consistently uses the hero business/application.
- Loading, empty, validation, and error states exist for major workflows.
- No backend code or fake API requests were introduced.
- `npm run build` and `npm run lint` pass.
- Shared files were changed only where coordinated, minimizing merge conflicts.

