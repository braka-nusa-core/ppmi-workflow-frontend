// FILE: components/demo/pages/DemoAdminPage.tsx
'use client'

import { useMemo } from 'react'
import { Check, Minus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { useRole } from '@/hooks/useRole'
import { formatRelativeTime } from '@/lib/format'
import { getDemoAdminOverview } from '@/lib/demo/adminDemoData'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { DemoKpi, DemoSection, DemoTable, useDemoNow } from '@/components/demo/DemoPagePrimitives'

// ═══════════════════════════════════════════════════════════════
// DEMO ADMINISTRATION OVERVIEW (NEXT_PUBLIC_DEMO_MODE=true only)
// STRICTLY READ-ONLY: this page renders no buttons, forms or inputs and
// calls no API. Users are fictional (reserved ".example" addresses).
// ═══════════════════════════════════════════════════════════════

const Yes = () => <Check size={14} className="text-[#1a5c38] inline" aria-label="granted" />
const No  = () => <Minus size={14} className="text-[#b5cede] inline" aria-label="not granted" />

export function DemoAdminPage() {
  const now = useDemoNow()
  const { canViewAdmin } = useRole()
  const d = useMemo(() => (now ? getDemoAdminOverview(now) : null), [now])

  const header = (
    <PageHeader
      title="Administration"
      description="User management, permissions, and system settings"
      breadcrumbs={[{ label: 'Administration' }]}
    />
  )

  if (!canViewAdmin) {
    return (
      <div className="page-container">
        {header}
        <div className="card flex items-center justify-center min-h-[160px]">
          <ErrorState message="You don't have access to Administration" description="Contact your administrator if you believe this is incorrect." />
        </div>
      </div>
    )
  }
  if (!d) return <div className="page-container">{header}<LoadingSkeleton /></div>

  return (
    <div className="page-container">
      {header}

      <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-md border border-[#e8c896] bg-[#fdf7ed]">
        <DataSourceBadge source="demo" className="mt-0.5" />
        <p className="text-[12px] text-[#5c4000] leading-snug">
          <span className="font-semibold">Read-only overview.</span>{' '}
          The users below are fictional demonstration accounts and permission assignments, not records from the live system.
          Creating, editing, deactivating or deleting users, roles and settings is not available here.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <DemoKpi label="Users"              value={String(d.stats.users)} sub={`${d.stats.active} active`} />
        <DemoKpi label="Super administrators" value={String(d.stats.superAdmins)} sub="Unrestricted access" />
        <DemoKpi label="Organisation units" value={String(d.stats.units)} sub="Divisions and departments" />
        <DemoKpi label="Frontend roles"     value={String(d.roleMatrix.length)} sub="Module access roles" />
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.6fr_1fr] gap-4 mb-4">
        <DemoSection title="Users" description="Account, role and organisation unit">
          <DemoTable
            rows={d.users} rowKey={(u) => u.id}
            columns={[
              { header: 'Name', render: (u) => <span className="font-medium">{u.fullname}</span> },
              { header: 'E-mail', render: (u) => <span className="text-[#3a5068]">{u.email}</span> },
              { header: 'Role', render: (u) => <Badge variant={u.role === 'SUPERADMIN' ? 'active' : 'default'}>{u.role === 'SUPERADMIN' ? 'Super admin' : 'User'}</Badge> },
              { header: 'Organisation unit', render: (u) => u.parentUnit ? `${u.parentUnit} › ${u.unit}` : u.unit },
              { header: 'Status', render: (u) => <Badge variant={u.status === 'Active' ? 'approved' : 'draft'} dot>{u.status}</Badge> },
              { header: 'Last active', render: (u) => <span className="text-[#7a8fa3]">{formatRelativeTime(u.lastActive)}</span> },
            ]}
          />
        </DemoSection>

        <DemoSection title="Organisation structure" description="Divisions and their departments">
          <DemoTable
            rows={d.units} rowKey={(u) => u.name}
            columns={[
              { header: 'Unit', render: (u) => <span className={u.type === 'DEPARTMENT' ? 'pl-4 text-[#3a5068]' : 'font-medium'}>{u.name}</span> },
              { header: 'Type', render: (u) => u.type === 'DIVISION' ? 'Division' : 'Department' },
              { header: 'Members', align: 'right', render: (u) => String(u.members) },
            ]}
          />
        </DemoSection>
      </div>

      <DemoSection
        title="Quotation permissions by unit"
        description="Permission strings checked by the quotation screens; assignment shown here is illustrative. Super administrators are unrestricted."
        className="mb-4"
      >
        <DemoTable
          rows={d.units.filter((u) => d.unitPermissions[u.name])} rowKey={(u) => u.name}
          columns={[
            { header: 'Unit', render: (u) => u.name },
            ...d.permissionCols.map((c) => ({
              header: c.label, align: 'right' as const,
              render: (u: { name: string }) => (d.unitPermissions[u.name].includes(c.key) ? <Yes /> : <No />),
            })),
          ]}
        />
      </DemoSection>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
        <DemoSection title="Module access roles" description="Frontend role matrix used by Policy, RFI, Voucher, Invoice, Payment and Shipment (configuration, shown unchanged)">
          <DemoTable
            rows={d.roleFlags} rowKey={(f) => f.key}
            columns={[
              { header: 'Permission', render: (f) => f.label },
              ...d.roleMatrix.map((m) => ({
                header: m.role, align: 'right' as const,
                render: (f: { key: keyof typeof m.permissions }) => (m.permissions[f.key] ? <Yes /> : <No />),
              })),
            ]}
          />
        </DemoSection>

        <DemoSection title="System configuration" description="Read-only">
          <DemoTable
            rows={d.configuration} rowKey={(c) => c.label}
            columns={[
              { header: 'Setting', render: (c) => <span className="font-medium">{c.label}</span> },
              { header: 'Value', wrap: true, render: (c) => c.value },
            ]}
          />
        </DemoSection>
      </div>
    </div>
  )
}