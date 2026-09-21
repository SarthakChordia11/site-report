# SiteReport AI — Complete Project Research Document

> **Author:** Darshan Girase (PM)
> **Version:** 2.0
> **Last Updated:** September 2026
> **Stack:** FastAPI + React + Groq AI (LLaMA / GPT-OSS)

---

## 1. WHAT IS THIS PROJECT?

**SiteReport AI** is an AI-powered, multilingual (Hindi / Marathi / English) Construction Site Management Platform designed specifically for Indian construction companies, project managers, site engineers, and foremen.

The platform digitises the entire daily site reporting process — from speaking a voice note in Hindi on-site to generating a professional PDF report and auto-syncing all field data into structured database modules — in under 60 seconds, with zero paperwork.

### Core Identity
- **Name:** SiteReport AI
- **Tagline:** Log attendance, materials, or machinery instantly via natural input
- **AI Engine:** Groq (openai/gpt-oss-120b model)
- **Voice Support:** Groq Whisper STT + GPT-OSS NLP
- **Languages:** Hindi, Marathi, English, Hinglish

---

## 2. WHY WE ARE MAKING THIS (THE PROBLEM)

### 2.1 Real-World Problem in Indian Construction

| Problem | Impact |
|---|---|
| DPRs filed on paper | Data lost or delayed 24-48 hours |
| Labour attendance in registers | Wage errors, ghost workers, audit failures |
| Material receipts verbal or on slips | Pilferage, incorrect billing |
| Equipment usage estimated | Idle time invisible, cost overruns undetected |
| Reports compiled manually at day end | PMs waste 2-3 hours/day on paperwork |
| No real-time visibility for head office | Senior leadership always 24h behind |
| Foremen only speak Hindi/Marathi | Digital adoption gap at ground level |

### 2.2 Who Is This For?

- **Foreman / Site Supervisor** — Ground worker, speaks Hindi/Marathi only
- **Project Manager (PM)** — Spends 30-40% of time chasing and compiling data
- **Company Owner / Head Office** — Needs real-time view of 10-20 active sites
- **Government Auditors / Clients** — Need structured DPRs, NCR logs, EVM reports

### 2.3 Market Gap

- SAP / Oracle Primavera: Rs. 50L+ setup, English only — too expensive
- Local apps: Basic form-fillers, no AI, no voice
- No tool in India lets a Hindi-speaking foreman speak and get a DPR auto-filed

---

## 3. HOW WE ARE BUILDING IT

### 3.1 Complete Tech Stack

**Frontend:**
- React 19 + TypeScript 5.8
- Vite 6.4 (build tool)
- Tailwind CSS 4.1
- Lucide React (icons), Motion (animations)
- Port: 3000

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic v2 (validation)
- Groq SDK (AI)
- ReportLab (PDF generation)
- JWT Authentication (python-jose)
- Port: 8002

**Database:**
- Development: SQLite (local file site_manager.db)
- Production: PostgreSQL (recommended: Supabase free tier)

**AI Services (Groq Cloud):**
- openai/gpt-oss-120b — DPR text extraction and NLP
- Whisper Large V3 — Speech to Text
- llama-4-scout — Vision / Document OCR

### 3.2 AI Voice Pipeline

`
1. USER SPEAKS (Hindi/Marathi/English)
   "Aaj 14 mason aaye, 6 carpenter, cement 50 bag mila"

2. BROWSER STT (Web Speech API)
   -> Live transcript shown in Voice Log modal

3. LLM EXTRACTION (openai/gpt-oss-120b via Groq)
   -> Sends transcript with structured JSON schema prompt
   -> Returns: { labour: [{trade: Mason, present: 14}...],
                 materials: [{item: Cement, qty: 50 bags}...] }

4. BACKEND SYNC (dpr.py -> _sync_dpr_to_modules)
   -> LabourAttendance row inserted (with site_id)
   -> LabourWage row calculated (rate x present)
   -> MaterialLog row inserted
   -> EquipmentLog row inserted

5. REPORT SAVE (reports.py)
   -> SiteReport stored in site_reports table
   -> report_type = Daily (auto-tagged)

6. ROLLUP ENGINE (rollup.py)
   -> 7 Daily -> 1 Weekly (auto-generated)
   -> 4 Weekly -> 1 Monthly (auto-generated)

7. DASHBOARD REFRESH
   -> Frontend reloads all data from DB
   -> Labour Deployment widget updates
   -> Reports Hub shows new entry with correct badge
`

---

## 4. THE 5 CORE MODULES

### Module 1: Projects & Labour

**Tables:** labour_attendance, labour_wages, safety_inductions, labour_mobilizations

**Features:**
- Attendance by trade: Mason (Rs.750/day), Helper (Rs.500), Carpenter (Rs.700), Fitter (Rs.800), Welder (Rs.850), Rigger (Rs.750)
- OT auto-calculated at 1.5x rate
- Safety induction tracking (IS 7969 compliance)
- Agency-wise split

---

### Module 2: Documents & Materials

**Tables:** material_items, material_logs, dispatches, vendors

**Features:**
- Material receipt logging (cement, steel, aggregate, etc.)
- Consumption vs. planned tracking
- Low stock alerts (when quantity < minimum level)
- Vendor management

---

### Module 3: Equipment & Plant

**Tables:** equipment_assets, equipment_logs

**Features:**
- Uptime % = (working_hrs / total_hrs) x 100
- Idle reason logging ("Waiting for material", "No fuel")
- Breakdown tracking with repair notes

---

### Module 4: Analytics & EVM

**Tables:** cost_items

**EVM Metrics:**
| Metric | Formula | Meaning |
|---|---|---|
| CPI | EV / AC | > 1.0 = Under Budget |
| SPI | EV / PV | > 1.0 = Ahead of Schedule |
| EAC | BAC / CPI | Estimated Final Cost |

---

### Module 5: Reports Hub

**Report Types:**
| Type | Trigger | Content |
|---|---|---|
| Daily | Every Voice Log session | 1 shift of field data |
| Weekly | Every 7 Daily reports (auto) | 7-day aggregated summary |
| Monthly | Every 4 Weekly reports (auto) | Full month overview |

**PDF Sections (official DPR template):**
- A: Header (Project, Date, Location, Inspector, Weather)
- A2: Manpower Summary (trade-wise table)
- A3: Material Received / Consumed
- A5: Production Log (Planned % vs. Achieved %)
- A6: Safety & Quality (NCR log)
- A7: Delay Risk Assessment
- A8: Recommended Actions

---

## 5. SECURITY DESIGN

**Authentication:** JWT Bearer tokens, bcrypt-hashed passwords

**Roles:**
| Role | Rights |
|---|---|
| admin | All sites, user management |
| site_manager | Assigned sites, full operational access |
| viewer | Read-only, reports only |

**Data Isolation:** Every record has site_id. All queries filter by site_id. Data from Site A is physically impossible to access from Site B.

---

## 6. FULL DATABASE SCHEMA

`
users (id, name, email, hashed_password, role, is_active, created_at)
sites (id, name, project_name, client, contractor, location, site_type, status, progress_percent, active_workers, weather)

-- Labour
labour_attendance (id, site_id, date, trade, agency, location, present, absent, ot_hours, remarks)
labour_wages (id, site_id, date, trade, rate_per_day, ot_rate_per_hour, present, ot_hours, total_wages)
safety_inductions (id, site_id, worker_name, trade, agency, inducted, induction_date)
labour_mobilizations (id, site_id, trade, agency, required_count, mobilized_count)

-- Materials
material_items (id, site_id, name, unit, stock_quantity, min_stock_level, vendor_id)
material_logs (id, site_id, item_id, date, type, quantity, invoice_no, vendor, remarks)
dispatches (id, site_id, type, element_id, transporter, vehicle_no, quantity, eta)
vendors (id, site_id, name, contact, material_type, rating)

-- Equipment
equipment_assets (id, site_id, name, type, operator, status)
equipment_logs (id, site_id, asset_id, date, working_hrs, idle_hrs, breakdown_hrs, idle_reason, breakdown_reason)

-- Cost
cost_items (id, site_id, description, planned_value, actual_cost, earned_value)

-- Reports
site_reports (id, site_id, author_id, name, project_name, report_date, report_type,
              status, author, summary, trades_present_count, critical_issues_count,
              materials_received_summary, equipment_uptime_percent, evm_status,
              voice_transcript, extracted_data, created_at)
`

---

## 7. PRODUCTION DEPLOYMENT

### Recommended Free Stack

| Layer | Dev | Production |
|---|---|---|
| Database | SQLite | PostgreSQL on Supabase (free 500MB) |
| Backend | Local uvicorn | Railway.app or Render.com |
| Frontend | Local Vite | Vercel (free, auto-deploy from GitHub) |
| AI | Groq free tier | Groq paid (~.27/million tokens) |
| Storage | Local /reports | Cloudflare R2 (free 10GB/month) |

### Go-Live Steps

1. Push code to GitHub
2. Create Supabase PostgreSQL project — copy connection string
3. Deploy backend to Railway.app (connect GitHub repo)
4. Set all env variables in Railway dashboard
5. Deploy frontend to Vercel (connect GitHub repo)
6. Update CORS_ORIGINS to Vercel URL
7. DONE — fully live, zero server management

### Production .env

`
GROQ_API_KEY=gsk_...
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
DATABASE_URL=postgresql://user:password@host:5432/sitemanager
JWT_SECRET=<64-char random string>
CORS_ORIGINS=https://yourapp.vercel.app
ENVIRONMENT=production
`

---

## 8. KNOWN LIMITATIONS

| Limitation | Workaround / Fix |
|---|---|
| Browser STT needs internet | Groq Whisper audio file upload as backup |
| SQLite not for multi-user cloud | Change 1 line in .env to PostgreSQL |
| No push notifications for NCRs | WhatsApp API planned for Phase 2 |
| No offline mode | PWA + IndexedDB planned for Phase 3 |

---

## 9. FUTURE ROADMAP

### Phase 2 (0-3 months)
- WhatsApp Bot: Foreman sends WhatsApp voice -> DPR auto-filed (no app needed)
- Photo OCR: Photo of delivery challan -> AI reads item, quantity, vendor
- QR Code Attendance: Print QR card -> scan to mark attendance
- Client Portal: Read-only login link for clients

### Phase 3 (3-6 months)
- Gantt Chart: Connect DPR progress % to project schedule
- PWA: Install on Android, works offline with background sync
- IS Code Compliance Checker: AI flags violations of Indian Standards
- Payroll Integration: Auto-export wages to Tally / accounting software

### Phase 4 (Future)
- Drone/CCTV Integration: AI analyses site photo to estimate progress %
- IoT Equipment Tracking: GPS + engine sensors auto-log hours
- Bilingual DPR PDF: English + Marathi for Maharashtra PWD submissions

---

## 10. FILE STRUCTURE

`
site/
├── backend/
│   ├── .env                        # API keys & config
│   ├── main.py                     # FastAPI entry + demo data seed
│   ├── database.py                 # SQLAlchemy engine & session
│   ├── site_manager.db             # SQLite database (auto-created)
│   ├── models/
│   │   ├── user.py
│   │   ├── site.py
│   │   ├── labour.py
│   │   ├── resource.py
│   │   ├── equipment.py
│   │   ├── cost.py
│   │   ├── report.py
│   │   └── dpr_models.py           # Pydantic models for AI extraction
│   ├── routers/
│   │   ├── auth.py                 # Login, register, JWT
│   │   ├── sites.py
│   │   ├── labour.py
│   │   ├── resource.py
│   │   ├── equipment.py
│   │   ├── cost.py
│   │   ├── reports.py              # Report CRUD + rollup trigger
│   │   ├── dpr.py                  # THE CORE: voice process, PDF, sync
│   │   └── ai_voice.py             # Transcription & module extraction
│   └── services/
│       ├── dpr_extractor.py        # AI BRAIN: LLM -> DPRFullReport
│       ├── dpr_pdf_generator.py    # ReportLab PDF builder
│       ├── dpr_transcriber.py      # Groq Whisper STT
│       ├── ai_extractor.py         # Module-specific prompts
│       ├── auth_utils.py           # JWT helpers
│       └── rollup.py               # Auto Daily->Weekly->Monthly
│
└── frontend/
    └── src/
        ├── App.tsx                 # Root: state, routing, data loading
        ├── types/index.ts          # TypeScript interfaces
        ├── services/api.ts         # All REST API calls
        ├── utils/aiParser.ts       # Client-side parsing utilities
        └── components/
            ├── ai/GlobalAIModal.tsx        # Voice Log modal (main AI UI)
            ├── auth/AuthPage.tsx           # Login/Register
            ├── common/Header.tsx           # Top nav
            ├── common/Sidebar.tsx          # Left nav
            └── modules/
                ├── dashboard/DashboardOverview.tsx
                ├── labour/LabourModule.tsx
                ├── resource/ResourceModule.tsx
                ├── equipment/EquipmentModule.tsx
                ├── cost/CostModule.tsx
                └── reports/ReportsHub.tsx
`

---

## 11. SUMMARY

SiteReport AI solves a critical gap in Indian construction — no affordable, multilingual, AI-powered site management software built for ground-level reality.

**Core Innovation:** A foreman who speaks only Hindi says:
*"Aaj 14 mason, 20 helper aaye, 50 bags cement mila"*

In 60 seconds that becomes:
- Attendance record in DB (with wage calculation)
- Material receipt logged
- Daily Progress Report filed
- Head office dashboard updated

This eliminates 2-3 hours of daily manual reporting, removes data errors, and gives management real-time visibility — at 100x lower cost than enterprise ERP.

The stack (FastAPI + React + Groq + SQLite/PostgreSQL) scales from a single site to hundreds of construction projects with zero architecture changes.
