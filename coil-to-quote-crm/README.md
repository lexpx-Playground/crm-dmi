# Coil-to-Quote CRM (POC)

A Progressive Web App for roll-forming businesses to build priced quotations and track coils from supplier PO through production.

## Features

### Epics Implemented

#### Epic 0 — Foundation & Config
- ✅ E0-1: Repo, Supabase env, auth bootstrap
- ✅ E0-2: RBAC (superadmin/sales/warehouse)
- ✅ E0-3: Settings module (currency, tax, min $/ton, quote validity)

#### Epic 1 — Master Data
- ✅ E1-1: Client CRUD + phone search
- ✅ E1-2: Products + price book
- ✅ E1-3: Accessories (Flashing/Capping sized, Clip/Zip unsized)
- ✅ E1-4: Suppliers + PO entity (no DO field)

#### Epic 2 — Quotation
- ✅ E2-1: Quote builder with client/project
- ✅ E2-2: Min $/ton guardrail (warn/block modes)
- ✅ E2-3: Review screen
- ✅ E2-4: PDF generation + cloud save
- ✅ E2-5: Share via wa.me + mailto
- ✅ E2-6: Lifecycle (draft/sent/accepted/rejected/expired)
- ✅ E2-7: Client history view

#### Epic 3 — Inventory In
- ✅ E3-1: PO import (CSV template + manual)
- ✅ E3-2: Coil scan (supplier barcodes)
- ✅ E3-3: Arrival scan

#### Epic 4 — Usage & Production
- ✅ E4-1: Usage scan + batch QR
- ✅ E4-2: Manual consumption entry
- ✅ E4-3: DPR export

#### Epic 5 — Offline & Sync
- ✅ E5-1: Local queue (IndexedDB)
- ✅ E5-2: Sync engine
- ✅ E5-3: Idempotency & conflicts

#### Epic 6 — Reporting & Traceability
- ✅ E6-1: Live stock balance
- ✅ E6-2: Warranty lookup

#### Epic 7 — UAT
- ✅ E7-1: Seed dataset
- ✅ E7-2: UAT script
- ✅ E7-3: Bug-fix buffer

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Offline**: Dexie (IndexedDB wrapper)
- **PDF**: jsPDF + jspdf-autotable
- **Scanning**: html5-qrcode
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd coil-to-quote-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Go to your Supabase project
   - Open SQL Editor
   - Run the contents of `supabase-schema.sql`

5. Create demo users in Supabase Auth:
   - admin@example.com / password (superadmin)
   - sales@example.com / password (sales)
   - warehouse@example.com / password (warehouse)

6. Start development server:
```bash
npm run dev
```

## Business Rules

### Locked Rules (from requirements)

1. **No DO number** — PO only
2. **Min $/ton**: Configurable value and warn/block behavior; overrides logged with reason
3. **Sizes 300/400/450**: Apply to flashing & capping only; clips/zips unsized
4. **Price book**: $/m² per product × thickness; quotes snapshot prices at creation
5. **Coil barcode**: Supplier's own label (multi-format scanner + manual fallback)
6. **Usage qty**: Manual entry (hard-validated against remaining)
7. **Balance coil**: Stores remaining weight and length
8. **Quote validity**: 7 days (configurable), then auto-expired
9. **PDF**: Shows currency + tax (name/rate configurable)
10. **Offline**: Required for inventory flows

## Architecture

- **PWA**: Works on any phone, no app store deployment
- **Supabase**: Postgres + Auth + Storage
- **Stock**: Append-only movement ledger; balances computed, never stored
- **Offline**: Queue-and-upload pattern; server-authoritative for coil status
- **Scanning**: html5-qrcode/zxing for camera; manual fallback
- **WhatsApp**: wa.me deep link (no Business API for POC)

## Milestones

- **M1 (wk1–2)**: Foundation + master data + quotation end-to-end
- **M2 (wk3)**: Inventory online
- **M3 (wk4)**: Offline sync
- **M4 (wk5–6)**: Reporting + UAT

## POC Acceptance Criteria

1. ✅ 3 real quotes sent from phones
2. ✅ 1 real PO received via scan in airplane mode then synced
3. ✅ 1 production run with QR
4. ✅ Stock balance matches physical count
5. ✅ Warranty lookup returns the coil's supplier PO

## Top Risks & Mitigations

1. **Supplier barcode quality/symbology unknown**
   - Test real labels in wk1
   - Manual fallback mandatory

2. **Manual usage entry fat-finger**
   - Hard caps + confirm dialog

3. **Offline adds ~1 sprint**
   - Phased after online flows so demos aren't blocked

## File Structure

```
src/
├── components/       # Reusable UI components
├── hooks/           # React hooks (useAuth, useSettings, etc.)
├── lib/             # Utilities (supabase, offline-db, pdf-generator, utils)
├── pages/           # Page components (Login, Dashboard, etc.)
├── services/        # API services
├── store/           # State management
├── types/           # TypeScript types
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## CSV Import Template

See `coil_import_template.csv` format in the specification.

Columns:
- po_number, supplier, coil_code, material, thickness_mm, width_mm, weight_kg, length_m, price, price_unit

## License

MIT
