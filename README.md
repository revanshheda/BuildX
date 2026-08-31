# 🏛️ BuildX (ApprovalOS)
### Intelligent Industrial Regulatory, Approval & Compliance Management Platform
**Problem Statement ID:** SIH 26130 | **Target Ecosystem:** Government of Maharashtra (MAITRI 2.0 Overlay)  
**Sponsoring Body:** Maharashtra State Innovation Society (MSIS) / Directorate of Industries  
**Prototype Scope:** Maharashtra Industrial Corridors & Single-Window Clearance Ecosystem

---

## 📌 Executive Summary

Maharashtra is home to over **7.33 million MSMEs** and remains India's premier industrial powerhouse. However, setting up a manufacturing or logistics facility (e.g., Cold Chain, Chemical, Agro-Processing, Engineering) requires navigating **5 to 15 statutory approvals across 5+ independent departments** (MPCB, DISH, Fire Services, MIDC, MSEDCL, PWD, FSSAI).

While portals like **MAITRI 2.0** and **NSWS** function as digital form aggregators and directory listings, they suffer from three fundamental structural gaps:
1. **Dependency Blindness**: Approvals are presented as flat, unsequenced checklists. Entrepreneurs apply out of order (e.g., seeking Factory Licenses before obtaining Consent to Operate), leading to immediate rejections and **45–120 day delays**.
2. **Pre-Submission Verification Vacuum**: Over **42% of departmental processing delays** stem from officer queries regarding basic data discrepancies (e.g., Entity name mismatch between GSTIN, Land Lease, and Project Report).
3. **Uncoordinated Post-Submission Governance**: Departmental site inspections occur in fragmented, uncoordinated visits, and post-approval statutory compliance tracking drops off after license issuance.

**BuildX** is an **Intelligent Single-Window Orchestration and Pre-Scrutiny Layer** that models statutory dependencies as a **Directed Acyclic Graph (DAG)**, executes **3-Level Pre-Validation** before submission, coordinates joint inspections, and synchronizes real-time scrutiny between entrepreneurs and government officers.

---

## 🌟 Core System Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BUILDX PLATFORM ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌──────────────────────────────────────────┐  ┌───────────────────────────────────┐  │
│   │       ENTREPRENEUR PORTAL                │  │     GOVERNMENT SCRUTINY DESK      │  │
│   │  • Structured 20-Field Profile           │  │  • Scrutiny Queue & Triage         │  │
│   │  • Declarative Rule Engine               │  │  • Explainable Risk Badging        │  │
│   │  • Interactive Visual DAG Canvas         │  │  • Side-by-Side Discrepancy Diff  │  │
│   │  • 3-Level Pre-Validation Scanner        │  │  • Common Inspection Coordination  │  │
│   │  • Reusable Canonical Document Vault     │  │  • Query Issuance & Resolution     │  │
│   │  • Scheme & Incentive Eligibility        │  │  • Decision Audit & SLA Analytics  │  │
│   └──────────────────────────────────────────┘  └───────────────────────────────────┘  │
│                         │                                     │                        │
│                         └──────────────────┬──────────────────┘                        │
│                                            ▼                                           │
│                 ┌───────────────────────────────────────────────────┐                  │
│                 │       INTELLIGENT WORKFLOW & ORCHESTRATION        │                  │
│                 │  • In-Memory Topological Sort (DAG Resolver)      │                  │
│                 │  • Longest-Path Critical Path Engine (Days)       │                  │
│                 │  • Multi-Level Cross-Doc Consistency Verifier     │                  │
│                 │  • State Synchronization & Event Audit Logging    │                  │
│                 └───────────────────────────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🗺️ Interactive Approval Dependency Graph (DAG Engine)
- **Topological Sequence Enforcement**: Transforms complex multi-departmental clearance rules into an interactive visual graph (`@xyflow/react`).
- **Prerequisite Locking**: Nodes reflect real-time statuses (`COMPLETED`, `IN_PROGRESS`, `READY_TO_APPLY`, `LOCKED`). Downstream approvals remain gated until prerequisites are satisfied.
- **Dynamic Critical Path Calculation**: Computes the shortest completion path (e.g., 108–123 working days) and visualizes concurrent parallel execution streams.
- **Statutory Source Tooltips**: Every node exposes legal grounding (e.g., *Water Act 1974 Section 25*, *Factories Act 1948*, *MIDC DCR*).

### 2. 🔍 3-Level Pre-Validation & Consistency Engine
- **Level 1 (Structural)**: Validates document mime-types, file size ceilings, required naming conventions, and file headers.
- **Level 2 (Consistency & Fuzzy Matching)**: Cross-references extracted document metadata against the canonical business profile using Levenshtein distance algorithms to detect spelling variations, PAN/GSTIN mismatches, and plot allocation variances before submission.
- **Level 3 (Workflow & Dependency Safety)**: Verifies prerequisite clearance grants and checks mandatory attachments before allowing final digital submission.

### 3. 🏢 Reusable Canonical Document Vault
- **Single-Upload Architecture**: Upload legal proofs, land allotments, and technical drawings once; reuse them across multiple state and central applications.
- **Verification Badging**: Tracks document verification states across all departmental submissions.

### 4. ⚖️ Government Scrutiny Desk & Risk-Based Triage
- **Explainable Triage Scoring**: Automatically classifies incoming dossiers into `LOW`, `MEDIUM`, or `HIGH` risk tiers based on pre-validation discrepancies and pollution hazard profiles.
- **Round-Trip Query Mechanism**: Formal query generation with applicant response synchronization and document re-upload verification.
- **Common Inspection Scheduling (CIS-NX)**: Coordinates physical audit dates and joint checklists across MPCB, DISH, and Fire Services.
- **Statutory SLA Radar**: Real-time compliance tracking against the Maharashtra Citizen Charter deadlines.

---

## 📦 Locked Hero Demonstration Dataset

The prototype includes a verified, end-to-end reference dataset modeled after an industrial setup in Maharashtra:

| Field | Reference Value |
|---|---|
| **Enterprise Name** | FreshChain Cold Logistics Private Limited |
| **Applicant / Director** | Vikram Malhotra |
| **Industry & Sub-Sector** | Agro & Food Logistics > Cold Storage / Cold Chain (5,000 MT Capacity) |
| **Jurisdiction / Location** | Plot No. E-45, MIDC Industrial Area, Chakan Phase II, Pune District, Maharashtra |
| **Gross Capital Investment** | ₹15.00 Crores (Large / MSME Tier) |
| **Power & Utilities** | 750 kW Connected HT Load (11kV Substation Feeder), 25 KLD Water |
| **Primary Hero Application** | FSSAI Food Business Operator (FBO) Central License (`APP-MH-2026-00124`) |
| **Scrutiny Officer** | Rajesh Kumar (Scrutiny Lead, Western Regional Office) |

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript 5.7, Vite 6
- **Routing**: React Router DOM v6
- **Graph & DAG Visualization**: `@xyflow/react` (React Flow)
- **Icons & Visual Language**: Lucide React
- **Styling Architecture**: Vanilla CSS Design System with curated tokens (`index.css`, `RoadmapPage.css`)
- **State Management & Persistence**: React Context Engine with LocalStorage synchronization
- **Backend & Database Readiness**: PostgreSQL 16 schema + Supabase JS Client integration (`supabase/migrations/`)

---

## 📂 Repository Structure

```
BuildX/
├── docs/                                    # 18 Module Product Specifications
│   ├── 01_ENTREPRENEUR.md
│   ├── 02_BUSINESS_PROFILE_MODULE_SPEC.md
│   ├── 03_APPROVAL_INTELLIGENCE_RULE_ENGINE_SPEC.md
│   ├── 04_PERSONALIZED_ROADMAP_MODULE_SPEC.md
│   ├── 06_DOCUMENT_VAULT_MODULE_SPEC.md
│   ├── 07_DOCUMENT_PREVALIDATION_MODULE_SPEC.md
│   ├── 08_SUBMISSION_MODULE_SPEC.md
│   ├── 09_UNIFIED_GOVERNMENT_WORKFLOW_MODULE_SPEC.md
│   ├── 10_GOVERNMENT_PORTAL_MODULE_SPEC.md
│   ├── 11_GOVERNMENT_REVIEW_MODULE_SPEC.md
│   ├── 12_QUERY_MANAGEMENT_MODULE_SPEC.md
│   ├── 13_INSPECTION_MODULE_SPEC.md
│   ├── 14_APPROVE_REJECT_MODULE_SPEC.md
│   ├── 15_ENTREPRENEUR_DASHBOARD_MODULE_SPEC.md
│   ├── 16_SLA_RENEWAL_ALERTS_MODULE_SPEC.md
│   ├── 17_INCENTIVES_MODULE_SPEC.md
│   ├── 18_GOVERNMENT_ANALYTICS_MODULE_SPEC.md
│   └── PRODUCT SPECIFICATION.md             # Master Parent Specification
│
├── frontend/                                # Vite + React 19 Single Page Application
│   ├── src/
│   │   ├── components/                      # Modular UI Components
│   │   │   ├── layout/                      # Universal Navbar & Dual-Persona Sidebar
│   │   │   ├── ui/                          # Status Badges, KPI Cards
│   │   │   └── ...                          # Landing page sections
│   │   │
│   │   ├── pages/                           # Application Views & Portals
│   │   │   ├── HomePage.tsx                 # Portal Switcher & System Overview
│   │   │   ├── entrepreneur/                # Entrepreneur Workspace
│   │   │   │   ├── BusinessProfilePage.tsx  # 20-Parameter Profile Configuration
│   │   │   │   ├── IntelligencePage.tsx     # Rule Engine Applicability Analysis
│   │   │   │   ├── RoadmapPage.tsx          # Interactive React Flow DAG Canvas
│   │   │   │   ├── ApplicationPage.tsx      # FSSAI Form & Pre-validation Blocker
│   │   │   │   ├── VaultPage.tsx            # Canonical Reusable Document Vault
│   │   │   │   ├── QueryPage.tsx            # Department Clarification Desk
│   │   │   │   ├── DashboardPage.tsx        # Entrepreneur Overview & Tracking
│   │   │   │   └── IncentivesPage.tsx       # Package Scheme of Incentives (PSI)
│   │   │   │
│   │   │   └── government/                  # Government Scrutiny Workspace
│   │   │       ├── GovDashboardPage.tsx     # Officer Queue & Triage Desk
│   │   │       ├── ApplicationsPage.tsx     # Department-wide Submissions
│   │   │       ├── ApplicationDetailPage.tsx# Side-by-Side Review, Inspection & Decision
│   │   │       └── AnalyticsPage.tsx        # SLA Performance & Bottleneck Heatmap
│   │   │
│   │   ├── lib/                             # Core Engines & Utilities
│   │   │   ├── approval-graph.ts            # DAG Topological Graph & Node Metadata
│   │   │   ├── rule-engine.ts               # Declarative Rule Evaluation Matrix
│   │   │   ├── store.tsx                    # State Management & Seed Synchronization
│   │   │   ├── types.ts                     # Strict TypeScript Data Interfaces
│   │   │   └── prevalidation/               # 3-Level Pre-Validation Engine
│   │   │       ├── engine.ts                # Main Pre-Validation Orchestrator
│   │   │       ├── level1-structural.ts     # Format & Header Integrity
│   │   │       ├── level2-consistency.ts    # Fuzzy Name & Identifier Comparison
│   │   │       ├── level3-workflow.ts       # Upstream Dependency & Prerequisite Checks
│   │   │       └── demo.ts                  # Pre-validation Automated Verification Suite
│   │   │
│   │   ├── App.tsx                          # React Router Hierarchy
│   │   ├── index.css                        # Universal Tokenized CSS Design System
│   │   └── main.tsx                         # DOM Mounting
│   ├── package.json
│   └── vite.config.ts
│
├── supabase/                                # Enterprise PostgreSQL Schema
│   └── migrations/
│       ├── 001_initial_schema.sql           # DDL with UUID, Relational & JSONB tables
│       └── 002_seed_data.sql                # Maharashtra Reference Seed Records
│
├── package.json                             # Monorepo Workspace Configuration
└── README.md                                # Master Technical Documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Execution

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/harshakumar25/BuildX.git
   cd BuildX
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎬 Step-by-Step Live Demo Script (3-Minute Walkthrough)

### 1. The Entry & Profile Assessment (0:00 – 0:45)
- Navigate to **Entrepreneur Portal** ➔ **Business Profile** (`/business-profile`).
- Observe the **20 structured industrial parameters** pre-configured for *FreshChain Cold Logistics Pvt. Ltd.* (MIDC Chakan Phase II, 5,000 MT Cold Storage, 750 kW HT Power).
- Click **Analyze Approvals** to trigger the **Declarative Rule Engine** (`/intelligence`), which evaluates state rules to determine that **9 clearances** apply across 3 stages.

### 2. The Hero DAG Roadmap (0:45 – 1:30)
- Navigate to **Personalized Roadmap** (`/roadmap`).
- The **Interactive DAG Canvas** renders the 9 clearances with topological prerequisite edges.
- Click on **FSSAI Central Licence** (`MH_FSSAI_CENTRAL`) to inspect the **Statutory Drawer** showing legal citations (*FSS Regulations 2011*), required documents, and prerequisite status.
- Notice that downstream operational licenses (such as **DISH Factory License**) remain `LOCKED 🔒` with clear explanations of upstream dependencies.

### 3. Pre-Validation & Submission Blocker (1:30 – 2:15)
- Open the FSSAI Application (`/application/app-hero-fssai-01`).
- Click **Run Pre-Validation Scan**.
- The **3-Level Pre-Validation Engine** executes:
  - Validates document completeness and legal entity consistency.
  - If a mandatory document (e.g., *Process Flow Diagram*) is missing or mismatched, the system flags a **Critical Blocker** and prevents faulty submission.
- Attach the verified asset from the **Document Vault** (`/vault`) to clear the blocker and submit the application.

### 4. Government Scrutiny & Round-Trip Scrutiny (2:15 – 3:00)
- Switch personas via the top navbar to **Government Officer** (*Rajesh Kumar*).
- Access the **Scrutiny Desk** (`/government/dashboard`) to view the pending dossier flagged with a **LOW RISK / PRE-VALIDATED 🟢** badge.
- Open the **Application Dossier** (`/government/applications/app-hero-fssai-01`):
  - Review the pre-validated document comparison matrix.
  - Test the **Query Mechanism** to request technical clarifications.
  - Review the **Common Inspection Checklist** (5-point verification).
  - Record the **Final Approval Decision**, automatically updating the timeline audit log and synchronizing the status across both portals.

---

## 📜 Statutory Legal References (Maharashtra Framework)

| Approval Code | Statutory Name | Enforcing Authority | Legal Citation |
|---|---|---|---|
| `MH_MPCB_CTE` | Consent to Establish (CTE - Orange) | Maharashtra Pollution Control Board | Section 25/26, Water Act 1974 & Air Act 1981 |
| `MH_MIDC_PLAN_FIRE` | Building Plan Sanction & Prov. Fire NOC | MIDC SPA & Maharashtra Fire Services | MIDC DCR 2018 & MH Fire Prevention Act |
| `MH_FSSAI_CENTRAL` | FSSAI Central License for Cold Storage | Central Licensing Authority (Western Region) | Food Safety and Standards Regulations 2011 |
| `MH_MSEDCL_HT` | High-Tension (HT) Industrial Power Sanction | MSEDCL | MERC Electricity Supply Code Regulations |
| `MH_MIDC_WATER` | Industrial Water Sanction (25 KLD) | MIDC Water Works Division | MIDC Water Supply Regulations |
| `MH_MPCB_CTO` | Consent to Operate (CTO) | Maharashtra Pollution Control Board | Water Act 1974 & Air Act 1981 |
| `MH_FIRE_FINAL` | Final Fire Safety Occupancy NOC | Maharashtra Fire Services | Maharashtra Fire Safety Measures Act |
| `MH_DISH_FACTORY` | Factory License Grant (Form 4) | Directorate of Industrial Safety & Health | Section 6, Factories Act 1948 & MH Rules |
| `MH_LABOUR_BOCW` | Labour Welfare & Contract Registration | Department of Labour, Maharashtra | Contract Labour (Regulation & Abolition) Act |

---

## 👥 Authors & Acknowledgments

- **Team**: BuildX Engineering Team (SIH 2026)
- **Problem Statement**: SIH 26130 — *Streamlining Industrial Approvals, Compliance & Support*
- **Sponsoring Agency**: Government of Maharashtra / Maharashtra State Innovation Society (MSIS)
