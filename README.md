# PPMI Flow — Frontend Foundation

Internal operational management system for **PT Pandi Proteksi Marine Indonesia**.

---

## Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Framework   | Next.js 14 (App Router)       |
| Language    | TypeScript (strict)           |
| Styling     | Tailwind CSS + CSS Variables  |
| Animation   | Framer Motion (subtle)        |
| Icons       | Lucide React (only)           |
| Server State| TanStack Query (React Query)  |
| Forms       | React Hook Form + Zod         |
| HTTP Client | Axios                         |

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start dev server
npm run dev
```

Dev server runs at `http://localhost:3000`.
API is expected at `http://localhost:3001/api` (configurable via `.env.local`).

---

## Project Structure

```
ppmi-flow/
├── app/
│   ├── auth/               # Login (no sidebar)
│   └── dashboard/          # Main app shell
│       ├── overview/       # Dashboard home
│       ├── pi/             # P&I division workflow pages
│       ├── hm/             # H&M division workflow pages
│       ├── finance/        # Finance module
│       ├── reports/        # Reports
│       └── admin/          # Administration
├── components/
│   ├── ui/                 # Button, Badge, Card, Input, Modal, Spinner, Tooltip
│   ├── layout/             # Topbar, Sidebar, PageHeader
│   ├── table/              # DataTable, TableFilters, TableActions
│   ├── modal/              # BaseModal, ConfirmModal, FormModal
│   ├── form/               # FormField, FormSection, CurrencyInput
│   ├── workflow/           # WorkflowStepper, WorkflowTimeline, StatusTransitionButton
│   ├── finance/            # InstallmentTable, OverdueBadge, PaymentStatusCard
│   └── feedback/           # EmptyState, ErrorState, LoadingSkeleton, ToastContainer
├── context/                # AuthContext, DivisionContext, ToastContext, Providers
├── hooks/                  # useAuth, useRole, useDivision, useDataTable, useModal, etc.
├── lib/
│   ├── api/                # API functions per module
│   ├── utils.ts            # cn() and shared utilities
│   ├── format.ts           # Currency, date, number formatters
│   ├── animations.ts       # Framer Motion variant library
│   ├── validations.ts      # Zod schemas
│   └── permissions.ts      # Permission check utilities
├── types/                  # All TypeScript interfaces
└── config/                 # Navigation, permissions matrix, constants
```

---

## Key Design Decisions

### Desktop-First
- Sidebar: fixed 240px, always visible
- Tables: max-width none, fill all available width
- Table rows: 48px height (40px compact)
- Filters: persistent above table, not hidden in drawer

### Role-Based Access
Four roles: `viewer` → `editor` → `finance` → `administrator`

Permission matrix lives in `config/permissions.ts`.
Check permissions in components via `useRole()` hook:
```tsx
const { canCreate, canEdit, canVerify } = useRole()
```

### Division Context
Active division (P&I / H&M) is a global context persisted to localStorage.
All API calls should include `division` param from `useDivision()`.

### Table Pattern
Every list page uses the same pattern:
```tsx
const table = useDataTable({ defaultPageSize: 25 })
const { data } = useQuery({ queryKey: ['qs', table.queryParams], queryFn: ... })
<TableFilters {...table} />
<DataTable columns={columns} data={data} pagination={table.fullPagination(total)} />
```

### Animation Rules
Import from `lib/animations.ts` — never define ad-hoc Framer Motion values.
All animations are subtle: max 200ms, enterprise easing `[0.2, 0, 0, 1]`.

---

## Workflow Flow

```
QS → Invoice → Voucher → Payment → Shipment
```

Stage transitions via `AdvanceStageButton` component.
Business logic in `hooks/useWorkflow.ts`, not in UI components.

---

## Adding a New Module Page

1. Create route: `app/dashboard/[division]/[module]/page.tsx`
2. Define column config: `columns: ColumnDef<T>[]`
3. Use `useDataTable()` for state
4. Use `DataTable` + `TableFilters` + `PageHeader`
5. Add nav entry to `config/navigation.ts`

---

## Code Conventions

| Item       | Convention     | Example                          |
|------------|----------------|----------------------------------|
| Component  | PascalCase     | `DataTable.tsx`                  |
| Hook       | camelCase use* | `useDataTable.ts`                |
| Type       | PascalCase     | `QSDocument`, `InvoiceListItem`  |
| API fn     | verb + noun    | `fetchQSList`, `createInvoice`   |
| Enum value | SCREAMING_SNAKE| `'APPROVED'`, `'IN_PROGRESS'`    |
| CSS class  | Tailwind only  | No custom classes unless needed  |
