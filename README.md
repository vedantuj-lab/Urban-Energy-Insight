# UrbanEnergy Insight

**Tagline:** Understand Your Energy. Find the Problem. Improve It.  
**Category:** Urban sustainability, residential energy analytics, data-driven planning.

---

## 1. Project Overview & Research Motivation

Urban residential energy records are often fragmented across disparate spreadsheets, utility invoices, and municipal archives. **UrbanEnergy Insight** provides a unified, software-based platform that transforms raw energy consumption records into:
1. **Aggregated & Longitudinal Analytics:** Total and monthly average loads, medians, and area intensities (kWh/m² and per-household).
2. **Explainable High-Consumption Detection:** Transparent statistical benchmarks (>1.25× median of comparable building typologies) without unverified black-box ML.
3. **Interactive Geographic Maps:** Leaflet geospatial visualization with verified sector coordinates, hotspot popups, and deviation indicators.
4. **Actionable Municipal Planning:** Evidence-based remediation workflows, milestone tracking, and progress metrics.
5. **Real-time Database Ingestion:** Quality gates validating row schemas, preventing duplicates, detecting unsupported units, and recording complete audit trails.

---

## 2. The Three Primary User Roles & Dashboards

UrbanEnergy Insight implements **one shared, secure authentication backend** powering **three distinct, role-tailored dashboard environments**:

| Role | Operational Environment | Primary Responsibilities | Palette & Visual Identity | Demo Account |
| :--- | :--- | :--- | :--- | :--- |
| **Energy Analyst** (`energy_analyst`) | **Energy Intelligence Center** | Analyze consumption patterns, evaluate sector baselines, explore Leaflet map hotspots, and generate analytical CSV audit reports. | Deep forest, emerald, mint, and cyan (`#063B2F`, `#059669`) | `analyst@demo.local` |
| **Data Manager** (`data_manager`) | **Energy Data Workspace** | Ingest CSV survey files, inspect column mappings, review row-level validation errors, correct permitted fields, and maintain data freshness. | Cyan, turquoise, blue, and slate (`#083344`, `#06B6D4`) | `datamanager@demo.local` |
| **Planner & Administrator** (`planner_admin`) | **Urban Planning & Control Center** | Prioritize urban sectors, formulate targeted retrofit actions, manage milestone checklists, and export planning reports. When authorized as Administrator, oversee user management, audit logs, and PostgreSQL health. | Amber, orange, coral, midnight navy & violet (`#7c2d12`, `#F97316`, `#1e1b4b`) | `planneradmin@demo.local` *(Full Admin)*<br/>`planner@demo.local` *(Planner Only)* |

**Development Password for All Accounts:** `demo123`

---

## 3. Real-Time Data & Synchronization Across Roles

All three dashboards read from the same authoritative database:
- **Cross-Role Ingestion Sync:** When a **Data Manager** uploads and commits a CSV survey in the *Energy Data Workspace*, the database immediately stores the records and updates `last_data_ingestion`.
- **Instant Analyst Reflection:** The **Energy Analyst** immediately observes updated total consumption, revised area intensities, updated map pins, and new high-consumption anomalies without manual entry.
- **Planner Priority Recalculation:** The **Energy Planner** sees sector priorities automatically update as deviations are computed against the newly stored baseline medians.
- **Honest Data Distinction:** Historical survey records are clearly marked as verified stored readings. Live electricity readings require utility grid credentials; the platform does not fabricate fake fluctuating telemetry.

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (`server.ts`)
- **Database:** PostgreSQL (with DDL schema in `migrations/001_init.sql`) and zero-configuration persistent storage fallback with transaction durability
- **Security:** bcrypt password hashing, HTTP session cookies, Bearer token authorization, role-based access control (RBAC)
- **Exports:** Standardized CSV export generation (`/api/reports/analyst-csv`, `/api/reports/planning-csv`)

---

## 5. Tomorrow's Demonstration Script (Step-by-Step)

Follow this exact sequence to demonstrate the entire platform:

1. **Public Landing Page (`/`):**
   - Start at the landing page; observe the headline *"Make Energy Simple: See the city. Understand the energy. Plan a smarter future."*
   - Scroll through the **10 Core Features**, the **5-step workflow timeline**, and the **Three Specialized Operational Environments**.
2. **Energy Analyst Experience:**
   - Click **"Sign In"** → Select **Energy Analyst** (or click the pre-fill button: `analyst@demo.local`).
   - Notice the emerald-themed **Energy Intelligence Center**.
   - Review the monthly consumption trend chart and sector intensity table.
   - Switch to the **Geographic Leaflet Map** tab; pan and click sector pins to inspect Northwood Sector and Downtown Central Towers.
   - Click **"Export CSV Report"** to download the complete audit file.
3. **Data Manager Ingestion & Quality Workflow:**
   - Use the header persona switcher to change to **Data Manager** (`datamanager@demo.local`).
   - Notice the cyan-themed **Energy Data Workspace**.
   - Click **"Load Sample CSV"** to demonstrate live ingestion validation (shows total rows, valid schema rows, detected column mappings, and rejected row alerts).
   - Click **"Confirm & Persist Valid Records"**; note database confirmation, updated row count, and instant timestamp refresh.
4. **Energy Planner & Administrator Experience:**
   - Switch to **Planner & Admin** (`planneradmin@demo.local`).
   - In the **Urban Planning & Control Center**, review the **Priority Assessment** ranking Northwood Sector as High Priority based on observed +34% winter load deviations.
   - On an active planning action, check off a milestone checklist item: watch the progress percentage automatically calculate and persist!
   - Switch between **Remediation Playbook**, **Timeline**, **DB Health & Engine**, and **Users & RBAC**.
   - *Optional Proof of Permissions:* Switch to `planner@demo.local` to show how the Administrator tabs disappear gracefully when a user has planner-only permissions.
