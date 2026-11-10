// FILE: components/clients/UseExistingClientButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BaseModal } from '@/components/modal/BaseModal'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'
import { CLIENT_ID_PARAM } from '@/hooks/useClientPrefill'
import type { DirectoryClient } from '@/types/clientDirectory'

/**
 * Hands the client off to the EXISTING quotation create forms via
 * `?clientId=<backend Client id>`. The forms validate it against
 * GET /clients; no parallel QS flow and no backend call is made here.
 */
export function UseExistingClientButton({ client, size = 'sm' }: { client: Pick<DirectoryClient, 'id' | 'name'>; size?: 'sm' | 'md' }) {
  const router = useRouter()
  const { can, user, technicalDepartment } = useAuth()
  const [open, setOpen] = useState(false)
  // Needs quotation:create to open the forms and client:read so they can load the client list.
  if (!can('quotation', 'create') || !can('client', 'read')) return null

  const go = (base: string) => {
    router.push(`${base}?${CLIENT_ID_PARAM}=${encodeURIComponent(client.id)}`)
  }
  // Same department rule as the Quotations list ("New Quotation"): a P&I user starts the P&I form
  // (the generic form cannot hold a P&I quotation's vessels/blocks), other technical users keep the
  // generic form, and only a superadmin — who may use either — is asked to choose.
  const department = technicalDepartment()
  const canPni = Boolean(user?.isSuperAdmin) || department === 'P&I'
  const options = [
    ...(department === 'P&I' ? [] : [{ label: 'Quotation (H&M / Cargo / generic)', base: ROUTES.quotations.new }]),
    ...(canPni ? [{ label: 'P&I Quotation', base: ROUTES.quotations.pniNew }] : []),
  ]

  return (
    <>
      <Button variant="primary" size={size} icon={<UserCheck size={13} />} onClick={(e) => { e.stopPropagation(); if (options.length === 1) go(options[0].base); else setOpen(true) }}>
        Use Existing Client
      </Button>
      <BaseModal open={open} onClose={() => setOpen(false)} size="sm">
        <div className="p-5 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#232b34]">Create quotation for this client</h3>
            <p className="text-xs text-[#9aa3ad] mt-1 break-words">{client.name}</p>
          </div>
          {options.map((o) => (
            <Button key={o.base} variant="secondary" size="sm" onClick={() => go(o.base)}>{o.label}</Button>
          ))}
        </div>
      </BaseModal>
    </>
  )
}
