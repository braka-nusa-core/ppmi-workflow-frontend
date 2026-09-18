'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useClients } from '@/hooks/useClients'
import { useInsuranceTypes } from '@/hooks/useInsuranceTypes'
import { useCreateQuotation, useUpdateQuotation } from '@/hooks/useQuotations'
import {
  createQuotationFormSchema,
  updateQuotationFormSchema,
  type CreateQuotationFormData,
  type UpdateQuotationFormData,
} from '@/lib/validations/quotation'
import { ROUTES } from '@/config/routes'
import type { QuotationDetail, CreateQuotationPayload, UpdateQuotationPayload } from '@/types/quotation'
import type { ApiError } from '@/types/api'

// ─── Payload builders ────────────────────────────────────────────
// Keeps the clientMode UI-only discriminator out of the actual API
// payload, and normalizes RHF's "empty string" fields to `undefined`
// so optional backend fields are actually omitted rather than sent
// as empty strings.

function toCreatePayload(data: CreateQuotationFormData): CreateQuotationPayload {
  const base = {
    insuranceTypeId: data.insuranceTypeId,
    insured:         data.insured || undefined,
    address:         data.address || undefined,
    quotationDate:   data.quotationDate || undefined,
    periodStart:     data.periodStart || undefined,
    periodEnd:       data.periodEnd || undefined,
    interest:        data.interest || undefined,
    rate:            data.rate,
    premium:         data.premium,
    deductible:      data.deductible,
    brokerage:       data.brokerage,
    templateVersion: data.templateVersion || undefined,
  }

  // clientId XOR client — enforced by construction, not just validation.
  // `data.client!.name` is guaranteed non-empty at this point by
  // createQuotationFormSchema's superRefine (mode 'new' requires it) —
  // the schema's own shape allows it optional only so stale data left
  // over from switching client modes can't block submission in
  // 'existing' mode (see lib/validations/quotation.ts).
  return data.clientMode === 'existing'
    ? { ...base, clientId: data.clientId as string }
    : { ...base, client: { ...data.client, name: data.client!.name as string } }
}

function toUpdatePayload(data: UpdateQuotationFormData): UpdateQuotationPayload {
  return {
    clientId:        data.clientId || undefined,
    insuranceTypeId: data.insuranceTypeId || undefined,
    insured:         data.insured || undefined,
    address:         data.address || undefined,
    quotationDate:   data.quotationDate || undefined,
    periodStart:     data.periodStart || undefined,
    periodEnd:       data.periodEnd || undefined,
    interest:        data.interest || undefined,
    rate:            data.rate,
    premium:         data.premium,
    deductible:      data.deductible,
    brokerage:       data.brokerage,
  }
}

// ─── Create mode ──────────────────────────────────────────────────

function CreateQuotationForm() {
  const router = useRouter()
  const { can, isLoading: authLoading } = useAuth()
  const { success, error: toastError } = useToast()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: insuranceTypes, isLoading: insuranceTypesLoading } = useInsuranceTypes()
  const createMutation = useCreateQuotation()

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CreateQuotationFormData>({
      resolver: zodResolver(createQuotationFormSchema),
      defaultValues: { clientMode: 'existing' },
    })
  const clientMode = watch('clientMode')

  // quotation:create gate — UX only, backend is authoritative.
  // Found during Phase 3D audit: the /new route had no permission
  // gate at all, so a user without quotation:create (or not in a
  // Teknik H&M/P&I/Cargo department) could fill out the entire form
  // only to have the backend reject it at the very last step.
  if (authLoading) {
    return <PageSpinner label="Loading…" />
  }
  if (!can('quotation', 'create')) {
    return (
      <ErrorState
        message="You don't have permission to create quotations"
        description="Quotation creation is limited to Teknik H&M, P&I, and Cargo department members."
      />
    )
  }

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate(toCreatePayload(data), {
      onSuccess: (created) => {
        success('Quotation created', `${created.quotationNumber} has been saved as Draft.`)
        router.push(ROUTES.quotations.detail(created.id))
      },
      onError: (err) => {
        const apiError = err as ApiError
        toastError('Failed to create quotation', apiError.message)
      },
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormSection title="Client" description="Link an existing client, or provide a new one inline" columns={1}>
        <FormField label="Client Source">
          <div className="flex gap-2">
            {(['existing', 'new'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setValue('clientMode', mode, { shouldValidate: true })
                  // Defense-in-depth: the payload builder already can't
                  // leak the inactive mode's data (branches on
                  // clientMode), but clearing here means switching back
                  // and forth never resurrects confusing stale values
                  // in the UI itself.
                  if (mode === 'existing') setValue('client', undefined)
                  if (mode === 'new') setValue('clientId', undefined)
                }}
                className={
                  'flex-1 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100 ' +
                  (clientMode === mode
                    ? 'bg-[#123d6b] text-white border-[#123d6b]'
                    : 'bg-white text-[#3a5068] border-[#b5cede] hover:border-[#7a8fa3]')
                }
              >
                {mode === 'existing' ? 'Existing Client' : 'New Client'}
              </button>
            ))}
          </div>
        </FormField>

        {clientMode === 'existing' ? (
          <FormField label="Client" required error={errors.clientId?.message}>
            <Select
              error={!!errors.clientId}
              placeholder={clientsLoading ? 'Loading clients…' : 'Select a client'}
              options={(clients ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.clientCode})` }))}
              {...register('clientId')}
            />
          </FormField>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required error={errors.client?.name?.message} className="col-span-2">
              <Input error={!!errors.client?.name} {...register('client.name')} />
            </FormField>
            <FormField label="Address" error={errors.client?.address?.message}>
              <Input {...register('client.address')} />
            </FormField>
            <FormField label="Phone" error={errors.client?.phone?.message}>
              <Input {...register('client.phone')} />
            </FormField>
            <FormField label="Email" error={errors.client?.email?.message}>
              <Input type="email" {...register('client.email')} />
            </FormField>
            <FormField label="Contact Person" error={errors.client?.contactPerson?.message}>
              <Input {...register('client.contactPerson')} />
            </FormField>
          </div>
        )}
      </FormSection>

      <FormSection title="Insurance Type" columns={1}>
        <FormField label="Insurance Type" required error={errors.insuranceTypeId?.message}>
          <Select
            error={!!errors.insuranceTypeId}
            placeholder={insuranceTypesLoading ? 'Loading…' : 'Select insurance type'}
            options={(insuranceTypes ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
            {...register('insuranceTypeId')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Basic Information" columns={2}>
        <FormField label="Quotation Date" error={errors.quotationDate?.message}>
          <Input type="date" error={!!errors.quotationDate} {...register('quotationDate')} />
        </FormField>
        <FormField label="Insured" error={errors.insured?.message}>
          <Input error={!!errors.insured} {...register('insured')} />
        </FormField>
        <FormField label="Period Start" error={errors.periodStart?.message}>
          <Input type="date" error={!!errors.periodStart} {...register('periodStart')} />
        </FormField>
        <FormField label="Period End" error={errors.periodEnd?.message}>
          <Input type="date" error={!!errors.periodEnd} {...register('periodEnd')} />
        </FormField>
        <FormField label="Address" className="col-span-2" error={errors.address?.message}>
          <Textarea rows={2} error={!!errors.address} {...register('address')} />
        </FormField>
        <FormField label="Interest" className="col-span-2" error={errors.interest?.message}>
          <Textarea rows={2} error={!!errors.interest} {...register('interest')} />
        </FormField>
      </FormSection>

      <FormSection
        title="Financial"
        description="Root quotation financial fields — coverage line items are managed separately"
        columns={2}
      >
        <FormField label="Rate" error={errors.rate?.message}>
          <Input type="number" step="any" min={0} error={!!errors.rate} {...register('rate', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Premium" error={errors.premium?.message}>
          <Input type="number" step="any" min={0} error={!!errors.premium} {...register('premium', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Deductible" error={errors.deductible?.message}>
          <Input type="number" step="any" min={0} error={!!errors.deductible} {...register('deductible', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Brokerage" error={errors.brokerage?.message}>
          <Input type="number" step="any" min={0} error={!!errors.brokerage} {...register('brokerage', { valueAsNumber: true })} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.list)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={createMutation.isPending}>
          Create Quotation
        </Button>
      </div>
    </form>
  )
}

// ─── Edit mode ────────────────────────────────────────────────────

function EditQuotationForm({ quotation }: { quotation: QuotationDetail }) {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: insuranceTypes, isLoading: insuranceTypesLoading } = useInsuranceTypes()
  const updateMutation = useUpdateQuotation(quotation.id)

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UpdateQuotationFormData>({
      resolver: zodResolver(updateQuotationFormSchema),
    })

  // Populate from GET /quotations/:id. reset() inside useEffect, per
  // project convention (not the `values` option) — mirrors the
  // pattern already used by the legacy QSEditClient.
  useEffect(() => {
    reset({
      clientId:        quotation.clientId,
      insuranceTypeId: quotation.insuranceTypeId,
      insured:         quotation.insured ?? '',
      address:         quotation.address ?? '',
      quotationDate:   quotation.quotationDate?.slice(0, 10) ?? '',
      periodStart:     quotation.periodStart?.slice(0, 10) ?? '',
      periodEnd:       quotation.periodEnd?.slice(0, 10) ?? '',
      interest:        quotation.interest ?? '',
      // Decimal read-side fields arrive as strings (see types/quotation.ts).
      // Converted to number ONLY for the numeric <input>'s value — never
      // reformatted/rounded. If a value isn't a valid number, the field is
      // left blank rather than silently coercing to 0.
      rate:            quotation.rate       !== null && !Number.isNaN(Number(quotation.rate))       ? Number(quotation.rate)       : undefined,
      premium:         quotation.premium    !== null && !Number.isNaN(Number(quotation.premium))    ? Number(quotation.premium)    : undefined,
      deductible:      quotation.deductible !== null && !Number.isNaN(Number(quotation.deductible)) ? Number(quotation.deductible) : undefined,
      brokerage:       quotation.brokerage  !== null && !Number.isNaN(Number(quotation.brokerage))  ? Number(quotation.brokerage)  : undefined,
    })
  }, [quotation, reset])

  const onSubmit = handleSubmit((data) => {
    updateMutation.mutate(toUpdatePayload(data), {
      onSuccess: () => {
        success('Quotation updated', `${quotation.quotationNumber} has been saved.`)
        router.push(ROUTES.quotations.detail(quotation.id))
      },
      onError: (err) => {
        const apiError = err as ApiError
        toastError('Failed to update quotation', apiError.message)
      },
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormSection title="Client & Insurance Type" columns={2}>
        <FormField label="Client" error={errors.clientId?.message}>
          <Select
            error={!!errors.clientId}
            placeholder={clientsLoading ? 'Loading clients…' : 'Select a client'}
            options={(clients ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.clientCode})` }))}
            {...register('clientId')}
          />
        </FormField>
        <FormField label="Insurance Type" error={errors.insuranceTypeId?.message}>
          <Select
            error={!!errors.insuranceTypeId}
            placeholder={insuranceTypesLoading ? 'Loading…' : 'Select insurance type'}
            options={(insuranceTypes ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
            {...register('insuranceTypeId')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Basic Information" columns={2}>
        <FormField label="Quotation Date" error={errors.quotationDate?.message}>
          <Input type="date" error={!!errors.quotationDate} {...register('quotationDate')} />
        </FormField>
        <FormField label="Insured" error={errors.insured?.message}>
          <Input error={!!errors.insured} {...register('insured')} />
        </FormField>
        <FormField label="Period Start" error={errors.periodStart?.message}>
          <Input type="date" error={!!errors.periodStart} {...register('periodStart')} />
        </FormField>
        <FormField label="Period End" error={errors.periodEnd?.message}>
          <Input type="date" error={!!errors.periodEnd} {...register('periodEnd')} />
        </FormField>
        <FormField label="Address" className="col-span-2" error={errors.address?.message}>
          <Textarea rows={2} error={!!errors.address} {...register('address')} />
        </FormField>
        <FormField label="Interest" className="col-span-2" error={errors.interest?.message}>
          <Textarea rows={2} error={!!errors.interest} {...register('interest')} />
        </FormField>
      </FormSection>

      <FormSection
        title="Financial"
        description="Root quotation financial fields — coverage line items are managed separately"
        columns={2}
      >
        <FormField label="Rate" error={errors.rate?.message}>
          <Input type="number" step="any" min={0} error={!!errors.rate} {...register('rate', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Premium" error={errors.premium?.message}>
          <Input type="number" step="any" min={0} error={!!errors.premium} {...register('premium', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Deductible" error={errors.deductible?.message}>
          <Input type="number" step="any" min={0} error={!!errors.deductible} {...register('deductible', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Brokerage" error={errors.brokerage?.message}>
          <Input type="number" step="any" min={0} error={!!errors.brokerage} {...register('brokerage', { valueAsNumber: true })} />
        </FormField>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.detail(quotation.id))}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={updateMutation.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// ─── Public component ─────────────────────────────────────────────

export function QuotationForm(props: { mode: 'create' } | { mode: 'edit'; quotation: QuotationDetail }) {
  return props.mode === 'create'
    ? <CreateQuotationForm />
    : <EditQuotationForm quotation={props.quotation} />
}