// FILE: components/cargo/CargoQuotationForm.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { useClients } from '@/hooks/useClients'
import { useInsuranceTypes } from '@/hooks/useInsuranceTypes'
import { useCreateQuotation, useUpdateQuotation } from '@/hooks/useQuotations'
import { useCreateCargoQuotation, useUpdateCargoQuotation } from '@/hooks/useCargo'
import { useQuotationAdjusters, useQuotationSurveyors, useQuotationTemplate } from '@/hooks/useQuotationReferences'
import { z } from 'zod'
import { createCargoQuotationSchema } from '@/lib/validations/cargo'
import { ROUTES } from '@/config/routes'
import type { CargoQuotationDetail, CreateCargoQuotationPayload, UpdateCargoQuotationPayload, CargoInstituteClause } from '@/types/cargo'
import type { Quotation, CreateQuotationPayload, UpdateQuotationPayload } from '@/types/quotation'
import type { ApiError } from '@/types/api'

const INSTITUTE_CARGO_CLAUSE_OPTIONS: { value: CargoInstituteClause; label: string }[] = [
  { value: 'INSTITUTE_CARGO_A',  label: 'Institute Cargo Clause (A)' },
  { value: 'INSTITUTE_CARGO_B',  label: 'Institute Cargo Clause (B)' },
  { value: 'INSTITUTE_CARGO_C',  label: 'Institute Cargo Clause (C)' },
  { value: 'INSTITUTE_BULK_OIL', label: 'Institute Bulk Oil Clauses' },
  { value: 'INSTITUTE_COAL',     label: 'Institute Coal Clauses' },
  { value: 'INSTITUTE_CARGO_AIR', label: 'Institute Cargo Clauses (Air)' },
]

const cargoInlineClientSchema = z.object({
  name:          z.string().optional(),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().optional(),
  contactPerson: z.string().optional(),
})

const cargoQuotationBaseFieldsSchema = z.object({
  clientId:            z.string().min(1).optional(),
  insured:             z.string().optional(),
  address:             z.string().optional(),
  recipient:           z.string().optional(),
  attentionTo:         z.string().optional(),
  quotationDate:       z.string().optional(),
  sumInsured:          z.number().nonnegative().optional(),
  sumInsuredCurrency:  z.string().length(3).optional(),
  rate:                z.number().nonnegative().optional(),
  deductibleText:      z.string().optional(),
  insuranceLabelValue: z.string().optional(),
  confirmedAcceptedBy: z.string().optional(),
})

const createCargoQuotationFormSchema = z
  .object({
    clientMode: z.enum(['existing', 'new']),
    client:     cargoInlineClientSchema.optional(),
    insuranceTypeId: z.string().min(1, 'Insurance Type is required'),
  })
  .merge(cargoQuotationBaseFieldsSchema)
  .merge(createCargoQuotationSchema)
  .superRefine((data, ctx) => {
    if (data.clientMode === 'existing' && !data.clientId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select an existing client', path: ['clientId'] })
    }
    if (data.clientMode === 'new' && !data.client?.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Client name is required', path: ['client', 'name'] })
    }
  })

type CreateCargoQuotationFormData = z.infer<typeof createCargoQuotationFormSchema>

const updateCargoQuotationFormSchema = cargoQuotationBaseFieldsSchema.merge(createCargoQuotationSchema)
type UpdateCargoQuotationFormData = z.infer<typeof updateCargoQuotationFormSchema>

function toBaseQuotationFields(data: CreateCargoQuotationFormData | UpdateCargoQuotationFormData) {
  return {
    insured:             data.insured || undefined,
    address:             data.address || undefined,
    recipient:           data.recipient || undefined,
    attentionTo:         data.attentionTo || undefined,
    quotationDate:       data.quotationDate || undefined,
    sumInsured:          data.sumInsured,
    sumInsuredCurrency:  data.sumInsuredCurrency || undefined,
    rate:                data.rate,
    deductibleText:      data.deductibleText || undefined,
    insuranceLabelValue: data.insuranceLabelValue || undefined,
    confirmedAcceptedBy: data.confirmedAcceptedBy || undefined,
  }
}

function toCargoFields(data: CreateCargoQuotationFormData | UpdateCargoQuotationFormData): CreateCargoQuotationPayload | UpdateCargoQuotationPayload {
  return {
    interestInsured:      data.interestInsured || undefined,
    voyageFrom:           data.voyageFrom || undefined,
    voyageTo:             data.voyageTo || undefined,
    etd:                  data.etd || undefined,
    eta:                  data.eta || undefined,
    conveyance:           data.conveyance || undefined,
    instituteCargoClause: data.instituteCargoClause,
    adjusterIds:          data.adjusterIds,
    surveyorIds:          data.surveyorIds,
  }
}

function useCargoAccessGate() {
  const { user, can, isLoading, technicalDepartment } = useAuth()
  const allowed = can('quotation', 'create') && (user?.isSuperAdmin || technicalDepartment() === 'Cargo')
  return { allowed, isLoading }
}

function ReferenceMultiSelect({
  label, options, selected, onChange,
}: {
  label: string
  options: { id: string; name: string }[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <FormField label={label}>
      <div className="flex flex-wrap gap-3 border border-[#e2e5e9] rounded-md p-2 min-h-9">
        {options.length === 0 && <span className="text-xs text-[#9aa3ad]">None available</span>}
        {options.map((o) => {
          const checked = selected.includes(o.id)
          return (
            <label key={o.id} className="flex items-center gap-1.5 text-xs text-[#3a5068]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...selected, o.id] : selected.filter((id) => id !== o.id))}
              />
              {o.name}
            </label>
          )
        })}
      </div>
    </FormField>
  )
}

function CreateCargoQuotationForm() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { allowed, isLoading: authLoading } = useCargoAccessGate()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: insuranceTypes, isLoading: insuranceTypesLoading } = useInsuranceTypes()
  const { data: adjusters } = useQuotationAdjusters()
  const { data: surveyors } = useQuotationSurveyors()
  const { data: template } = useQuotationTemplate('CARGO')
  const createQuotation = useCreateQuotation()

  const [createdQuotation, setCreatedQuotation] = useState<Quotation | null>(null)
  const createCargo = useCreateCargoQuotation(createdQuotation?.id ?? '')

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } =
    useForm<CreateCargoQuotationFormData>({
      resolver: zodResolver(createCargoQuotationFormSchema),
      defaultValues: { clientMode: 'existing', adjusterIds: [], surveyorIds: [] },
    })
  const clientMode = watch('clientMode')
  const instituteCargoClause = useWatch({ control, name: 'instituteCargoClause' })
  const adjusterIds = useWatch({ control, name: 'adjusterIds' }) ?? []
  const surveyorIds = useWatch({ control, name: 'surveyorIds' }) ?? []

  if (authLoading) return null
  if (!allowed) {
    return <p className="text-[13px] text-[#9b2020]">You don&apos;t have permission to create Cargo quotations (Teknik Cargo department only).</p>
  }

  function submitCargoStep(data: CreateCargoQuotationFormData, quotationId: string) {
    createCargo.mutate(toCargoFields(data) as CreateCargoQuotationPayload, {
      onSuccess: () => {
        success('Cargo quotation created', 'Saved as Draft.')
        router.push(ROUTES.quotations.detail(quotationId))
      },
      onError: (err) => {
        toastError(
          'Base quotation was created, but Cargo details failed to save',
          `${(err as ApiError).message} — fix the fields below and click Save again; the quotation itself will not be duplicated.`
        )
      },
    })
  }

  const onSubmit = handleSubmit((data) => {
    if (createdQuotation) {
      submitCargoStep(data, createdQuotation.id)
      return
    }
    const basePayload = { ...toBaseQuotationFields(data), insuranceTypeId: data.insuranceTypeId } as CreateQuotationPayload
    const withClient =
      data.clientMode === 'existing'
        ? { ...basePayload, clientId: data.clientId as string }
        : { ...basePayload, client: { ...data.client, name: data.client!.name as string } }

    createQuotation.mutate(withClient as CreateQuotationPayload, {
      onSuccess: (quotation) => {
        setCreatedQuotation(quotation)
        submitCargoStep(data, quotation.id)
      },
      onError: (err) => toastError('Failed to create quotation', (err as ApiError).message),
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {createdQuotation && (
        <p className="text-[12px] text-[#3a5068] bg-[#eef4fa] border border-[#cfe0ee] rounded-md px-3 py-2">
          Base quotation {createdQuotation.quotationNumber} was created. Fix the Cargo fields below and save again to finish.
        </p>
      )}

      <FormSection title="Client" columns={1}>
        <FormField label="Client Source">
          <div className="flex gap-2">
            {(['existing', 'new'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={!!createdQuotation}
                onClick={() => {
                  setValue('clientMode', mode, { shouldValidate: true })
                  if (mode === 'existing') setValue('client', undefined)
                  if (mode === 'new') setValue('clientId', undefined)
                }}
                className={
                  'flex-1 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100 disabled:opacity-50 ' +
                  (clientMode === mode ? 'bg-[#123d6b] text-white border-[#123d6b]' : 'bg-white text-[#3a5068] border-[#b5cede] hover:border-[#7a8fa3]')
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
              disabled={!!createdQuotation}
              error={!!errors.clientId}
              placeholder={clientsLoading ? 'Loading clients…' : 'Select a client'}
              options={(clients ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.clientCode})` }))}
              {...register('clientId')}
            />
          </FormField>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required error={errors.client?.name?.message} className="col-span-2">
              <Input disabled={!!createdQuotation} error={!!errors.client?.name} {...register('client.name')} />
            </FormField>
            <FormField label="Address"><Input disabled={!!createdQuotation} {...register('client.address')} /></FormField>
            <FormField label="Phone"><Input disabled={!!createdQuotation} {...register('client.phone')} /></FormField>
            <FormField label="Email"><Input disabled={!!createdQuotation} type="email" {...register('client.email')} /></FormField>
            <FormField label="Contact Person"><Input disabled={!!createdQuotation} {...register('client.contactPerson')} /></FormField>
          </div>
        )}
      </FormSection>

      <FormSection title="Insurance Type" columns={2}>
        <FormField label="Insurance Type" required error={errors.insuranceTypeId?.message}>
          <Select
            disabled={!!createdQuotation}
            error={!!errors.insuranceTypeId}
            placeholder={insuranceTypesLoading ? 'Loading…' : 'Select insurance type (Cargo)'}
            options={(insuranceTypes ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
            {...register('insuranceTypeId')}
          />
        </FormField>
        {template && <p className="col-span-2 text-xs text-[#9aa3ad]">Reference template available: {template.name}</p>}
      </FormSection>

      <FormSection title="Header" columns={2}>
        <FormField label="To (Recipient)"><Input {...register('recipient')} /></FormField>
        <FormField label="Attn"><Input {...register('attentionTo')} /></FormField>
        <FormField label="Quotation Date" className="col-span-2"><Input type="date" {...register('quotationDate')} /></FormField>
      </FormSection>

      <FormSection title="Insurance Information" columns={2}>
        <FormField label="The Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Address"><Input {...register('address')} /></FormField>
        <FormField label="Interest Insured" hint="Cargo's own field — distinct from the generic Interest field used by H&M/P&I" className="col-span-2">
          <Input {...register('interestInsured')} />
        </FormField>
        <FormField label="Sum Insured"><Input type="number" step="any" min={0} {...register('sumInsured', { valueAsNumber: true })} /></FormField>
        <FormField label="Sum Insured Currency"><Input placeholder="USD" maxLength={3} {...register('sumInsuredCurrency')} /></FormField>
      </FormSection>

      <FormSection title="Voyage" columns={2}>
        <FormField label="Voyage From"><Input {...register('voyageFrom')} /></FormField>
        <FormField label="Voyage To"><Input {...register('voyageTo')} /></FormField>
        <FormField label="Sailing Date (ETD)"><Input type="date" {...register('etd')} /></FormField>
        <FormField label="Sailing Date (ETA)"><Input type="date" {...register('eta')} /></FormField>
        <FormField label="Conveyance" className="col-span-2"><Input {...register('conveyance')} /></FormField>
      </FormSection>

      <FormSection title="Rate & Deductible" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible"><Input {...register('deductibleText')} /></FormField>
      </FormSection>

      <FormSection
        title="Terms & Conditions"
        description="Institute Cargo Clause — pick exactly one. Optional while saving a draft, but required before this quotation can be submitted for approval."
        columns={1}
      >
        {!instituteCargoClause && (
          <p className="text-[11px] text-[#9b6a1f] bg-[#fdf6e8] border border-[#f0dfb8] rounded-md px-2 py-1 mb-2">
            No Institute Cargo Clause selected yet — required before this quotation can be submitted for approval.
          </p>
        )}
        <FormField label="Institute Cargo Clause">
          <Select placeholder="Not selected" options={INSTITUTE_CARGO_CLAUSE_OPTIONS} {...register('instituteCargoClause')} />
        </FormField>
      </FormSection>

      <FormSection title="Adjuster & Surveyor" columns={1}>
        <ReferenceMultiSelect label="Nominated Adjusters" options={adjusters ?? []} selected={adjusterIds} onChange={(v) => setValue('adjusterIds', v)} />
        <ReferenceMultiSelect label="Surveyors" options={surveyors ?? []} selected={surveyorIds} onChange={(v) => setValue('surveyorIds', v)} />
      </FormSection>

      <FormSection title="Footer" columns={2}>
        <FormField label="Insurance (label)"><Input {...register('insuranceLabelValue')} /></FormField>
        <FormField label="Confirmed & Accepted By"><Input {...register('confirmedAcceptedBy')} /></FormField>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.list)}>Cancel</Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={createQuotation.isPending || createCargo.isPending}>
          {createdQuotation ? 'Save Cargo Details' : 'Create Cargo Quotation'}
        </Button>
      </div>
    </form>
  )
}

function EditCargoQuotationForm({ quotation, cargo }: { quotation: Quotation; cargo: CargoQuotationDetail }) {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: adjusters } = useQuotationAdjusters()
  const { data: surveyors } = useQuotationSurveyors()
  const updateQuotation = useUpdateQuotation(quotation.id)
  const updateCargo = useUpdateCargoQuotation(quotation.id)

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } =
    useForm<UpdateCargoQuotationFormData>({ resolver: zodResolver(updateCargoQuotationFormSchema) })

  useEffect(() => {
    reset({
      clientId:            cargo.quotation.client.id,
      insured:             quotation.insured ?? '',
      address:             quotation.address ?? '',
      recipient:           quotation.recipient ?? '',
      attentionTo:         quotation.attentionTo ?? '',
      quotationDate:       quotation.quotationDate?.slice(0, 10) ?? '',
      sumInsured:          quotation.sumInsured ? Number(quotation.sumInsured) : undefined,
      sumInsuredCurrency:  quotation.sumInsuredCurrency ?? '',
      rate:                quotation.rate ? Number(quotation.rate) : undefined,
      deductibleText:      quotation.deductibleText ?? '',
      insuranceLabelValue: quotation.insuranceLabelValue ?? '',
      confirmedAcceptedBy: quotation.confirmedAcceptedBy ?? '',
      interestInsured:      cargo.interestInsured ?? '',
      voyageFrom:           cargo.voyageFrom ?? '',
      voyageTo:             cargo.voyageTo ?? '',
      etd:                  cargo.etd?.slice(0, 10) ?? '',
      eta:                  cargo.eta?.slice(0, 10) ?? '',
      conveyance:           cargo.conveyance ?? '',
      instituteCargoClause: cargo.instituteCargoClause ?? undefined,
      adjusterIds: cargo.quotation.adjusters.map((a) => a.adjusterId),
      surveyorIds: cargo.quotation.surveyors.map((s) => s.surveyorId),
    })
  }, [quotation, cargo, reset])

  const instituteCargoClause = useWatch({ control, name: 'instituteCargoClause' })
  const adjusterIds = useWatch({ control, name: 'adjusterIds' }) ?? []
  const surveyorIds = useWatch({ control, name: 'surveyorIds' }) ?? []

  const onSubmit = handleSubmit((data) => {
    updateQuotation.mutate(
      { ...toBaseQuotationFields(data), clientId: data.clientId } as UpdateQuotationPayload,
      {
        onSuccess: () => {
          updateCargo.mutate(toCargoFields(data) as UpdateCargoQuotationPayload, {
            onSuccess: () => {
              success('Cargo quotation updated', 'Changes have been saved.')
              router.push(ROUTES.quotations.detail(quotation.id))
            },
            onError: (err) => toastError('Quotation fields saved, but Cargo details failed to save', (err as ApiError).message),
          })
        },
        onError: (err) => toastError('Failed to save quotation fields', (err as ApiError).message),
      }
    )
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormSection title="Client" columns={2}>
        <FormField label="Client" error={errors.clientId?.message}>
          <Select
            error={!!errors.clientId}
            placeholder={clientsLoading ? 'Loading clients…' : 'Select a client'}
            options={(clients ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.clientCode})` }))}
            {...register('clientId')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Header" columns={2}>
        <FormField label="To (Recipient)"><Input {...register('recipient')} /></FormField>
        <FormField label="Attn"><Input {...register('attentionTo')} /></FormField>
        <FormField label="Quotation Date" className="col-span-2"><Input type="date" {...register('quotationDate')} /></FormField>
      </FormSection>

      <FormSection title="Insurance Information" columns={2}>
        <FormField label="The Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Address"><Input {...register('address')} /></FormField>
        <FormField label="Interest Insured" className="col-span-2"><Input {...register('interestInsured')} /></FormField>
        <FormField label="Sum Insured"><Input type="number" step="any" min={0} {...register('sumInsured', { valueAsNumber: true })} /></FormField>
        <FormField label="Sum Insured Currency"><Input placeholder="USD" maxLength={3} {...register('sumInsuredCurrency')} /></FormField>
      </FormSection>

      <FormSection title="Voyage" columns={2}>
        <FormField label="Voyage From"><Input {...register('voyageFrom')} /></FormField>
        <FormField label="Voyage To"><Input {...register('voyageTo')} /></FormField>
        <FormField label="Sailing Date (ETD)"><Input type="date" {...register('etd')} /></FormField>
        <FormField label="Sailing Date (ETA)"><Input type="date" {...register('eta')} /></FormField>
        <FormField label="Conveyance" className="col-span-2"><Input {...register('conveyance')} /></FormField>
      </FormSection>

      <FormSection title="Rate & Deductible" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible"><Input {...register('deductibleText')} /></FormField>
      </FormSection>

      <FormSection title="Terms & Conditions" columns={1}>
        {!instituteCargoClause && (
          <p className="text-[11px] text-[#9b6a1f] bg-[#fdf6e8] border border-[#f0dfb8] rounded-md px-2 py-1 mb-2">
            No Institute Cargo Clause selected yet — required before this quotation can be submitted for approval.
          </p>
        )}
        <FormField label="Institute Cargo Clause">
          <Select placeholder="Not selected" options={INSTITUTE_CARGO_CLAUSE_OPTIONS} {...register('instituteCargoClause')} />
        </FormField>
      </FormSection>

      <FormSection title="Adjuster & Surveyor" columns={1}>
        <ReferenceMultiSelect label="Nominated Adjusters" options={adjusters ?? []} selected={adjusterIds} onChange={(v) => setValue('adjusterIds', v)} />
        <ReferenceMultiSelect label="Surveyors" options={surveyors ?? []} selected={surveyorIds} onChange={(v) => setValue('surveyorIds', v)} />
      </FormSection>

      <FormSection title="Footer" columns={2}>
        <FormField label="Insurance (label)"><Input {...register('insuranceLabelValue')} /></FormField>
        <FormField label="Confirmed & Accepted By"><Input {...register('confirmedAcceptedBy')} /></FormField>
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.detail(quotation.id))}>Cancel</Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={updateQuotation.isPending || updateCargo.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

export function CargoQuotationForm(props: { mode: 'create' } | { mode: 'edit'; quotation: Quotation; cargo: CargoQuotationDetail }) {
  return props.mode === 'create' ? <CreateCargoQuotationForm /> : <EditCargoQuotationForm quotation={props.quotation} cargo={props.cargo} />
}