// FILE: components/hm/HmQuotationForm.tsx
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
import { useCreateHmQuotation, useUpdateHmQuotation } from '@/hooks/useHm'
import { useQuotationAdjusters, useQuotationSurveyors, useQuotationTemplate } from '@/hooks/useQuotationReferences'
import {
  createHmQuotationFormSchema,
  updateHmQuotationFormSchema,
  type CreateHmQuotationFormData,
  type UpdateHmQuotationFormData,
} from '@/lib/validations/hm'
import { ROUTES } from '@/config/routes'
import { HmInstallmentsSection } from './sections/HmInstallmentsSection'
import type { HmQuotationDetail, CreateHmQuotationPayload, UpdateHmQuotationPayload } from '@/types/hm'
import type { Quotation, CreateQuotationPayload, UpdateQuotationPayload } from '@/types/quotation'
import type { ApiError } from '@/types/api'

function toBaseQuotationFields(data: CreateHmQuotationFormData | UpdateHmQuotationFormData) {
  return {
    insured:             data.insured || undefined,
    address:             data.address || undefined,
    recipient:           data.recipient || undefined,
    attentionTo:         data.attentionTo || undefined,
    quotationDate:       data.quotationDate || undefined,
    periodStart:         data.periodStart || undefined,
    periodEnd:           data.periodEnd || undefined,
    periodText:          data.periodText || undefined,
    interest:            data.interest || undefined,
    sumInsured:          data.sumInsured,
    sumInsuredCurrency:  data.sumInsuredCurrency || undefined,
    rate:                data.rate,
    premium:             data.premium,
    deductible:          data.deductible,
    deductibleText:      data.deductibleText || undefined,
    deductibleBasis:     data.deductibleBasis || undefined,
    brokerage:           data.brokerage,
    insuranceLabelValue: data.insuranceLabelValue || undefined,
    confirmedAcceptedBy: data.confirmedAcceptedBy || undefined,
    templateVersion:     data.templateVersion || undefined,
  }
}

function toHmFields(data: CreateHmQuotationFormData | UpdateHmQuotationFormData): CreateHmQuotationPayload | UpdateHmQuotationPayload {
  return {
    vesselType:            data.vesselType || undefined,
    tradingWarranty:       data.tradingWarranty || undefined,
    premiumPaymentEnabled: data.premiumPaymentEnabled,
    brokerageEnabled:      data.brokerageEnabled,
    installments:          data.installments,
    adjusterIds:           data.adjusterIds,
    surveyorIds:           data.surveyorIds,
  }
}

function useHmAccessGate() {
  const { user, can, isLoading, technicalDepartment } = useAuth()
  const allowed = can('quotation', 'create') && (user?.isSuperAdmin || technicalDepartment() === 'H&M')
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

// ─── Create mode ──────────────────────────────────────────────────
// Two backend calls behind one form: POST /quotations, then
// POST /hm/quotations/:id. If step 1 succeeds but step 2 fails, the
// created quotationId is kept in local state so the user can fix the
// H&M fields and retry ONLY step 2 - never re-runs step 1 (would
// create a duplicate orphaned quotation).

function CreateHmQuotationForm() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { allowed, isLoading: authLoading } = useHmAccessGate()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: insuranceTypes, isLoading: insuranceTypesLoading } = useInsuranceTypes()
  const { data: adjusters } = useQuotationAdjusters()
  const { data: surveyors } = useQuotationSurveyors()
  const { data: template } = useQuotationTemplate('HULL_MACHINERY')
  const createQuotation = useCreateQuotation()

  const [createdQuotation, setCreatedQuotation] = useState<Quotation | null>(null)
  const createHm = useCreateHmQuotation(createdQuotation?.id ?? '')

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } =
    useForm<CreateHmQuotationFormData>({
      resolver: zodResolver(createHmQuotationFormSchema),
      defaultValues: { clientMode: 'existing', adjusterIds: [], surveyorIds: [] },
    })
  const clientMode = watch('clientMode')
  const adjusterIds = useWatch({ control, name: 'adjusterIds' }) ?? []
  const surveyorIds = useWatch({ control, name: 'surveyorIds' }) ?? []

  if (authLoading) return null
  if (!allowed) {
    return <p className="text-[13px] text-[#9b2020]">You don&apos;t have permission to create H&amp;M quotations (Teknik H&amp;M department only).</p>
  }

  function submitHmStep(data: CreateHmQuotationFormData, quotationId: string) {
    createHm.mutate(toHmFields(data) as CreateHmQuotationPayload, {
      onSuccess: () => {
        success('H&M quotation created', 'Saved as Draft.')
        router.push(ROUTES.quotations.detail(quotationId))
      },
      onError: (err) => {
        toastError(
          'Base quotation was created, but H&M details failed to save',
          `${(err as ApiError).message} — fix the fields below and click Save again; the quotation itself will not be duplicated.`
        )
      },
    })
  }

  const onSubmit = handleSubmit((data) => {
    if (createdQuotation) {
      submitHmStep(data, createdQuotation.id)
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
        submitHmStep(data, quotation.id)
      },
      onError: (err) => toastError('Failed to create quotation', (err as ApiError).message),
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {createdQuotation && (
        <p className="text-[12px] text-[#3a5068] bg-[#eef4fa] border border-[#cfe0ee] rounded-md px-3 py-2">
          Base quotation {createdQuotation.quotationNumber} was created. Fix the H&amp;M fields below and save again to finish.
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
            placeholder={insuranceTypesLoading ? 'Loading…' : 'Select insurance type (H&M)'}
            options={(insuranceTypes ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
            {...register('insuranceTypeId')}
          />
        </FormField>
        {template && <p className="col-span-2 text-xs text-[#9aa3ad]">Reference template available: {template.name}</p>}
      </FormSection>

      <FormSection title="Header" columns={2}>
        <FormField label="To (Recipient)"><Input {...register('recipient')} /></FormField>
        <FormField label="Attn"><Input {...register('attentionTo')} /></FormField>
        <FormField label="Quotation Date"><Input type="date" {...register('quotationDate')} /></FormField>
        <FormField label="Periode" hint="e.g. '12 months as from date to be agreed'"><Input {...register('periodText')} /></FormField>
      </FormSection>

      <FormSection title="Insurance Information" columns={2}>
        <FormField label="The Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Address"><Input {...register('address')} /></FormField>
        <FormField label="Interest"><Input {...register('interest')} /></FormField>
        <FormField label="Type of Vessel"><Input {...register('vesselType')} /></FormField>
        <FormField label="Sum Insured"><Input type="number" step="any" min={0} {...register('sumInsured', { valueAsNumber: true })} /></FormField>
        <FormField label="Sum Insured Currency"><Input placeholder="USD" maxLength={3} {...register('sumInsuredCurrency')} /></FormField>
        <FormField label="Trading Warranty" className="col-span-2"><Input {...register('tradingWarranty')} /></FormField>
      </FormSection>

      <FormSection title="Premium & Deductible" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Premium"><Input type="number" step="any" min={0} {...register('premium', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible" hint="e.g. '... % of Sum Insured any one accident or occurrence'" className="col-span-2">
          <Input {...register('deductibleText')} />
        </FormField>
        <FormField label="Brokerage"><Input type="number" step="any" min={0} {...register('brokerage', { valueAsNumber: true })} /></FormField>
        <FormField label="Brokerage Enabled" htmlFor="brokerageEnabled">
          <label className="flex items-center gap-2 h-9 text-xs text-[#3a5068]">
            <input id="brokerageEnabled" type="checkbox" defaultChecked {...register('brokerageEnabled')} />
            Show brokerage on this quotation
          </label>
        </FormField>
      </FormSection>

      <HmInstallmentsSection control={control as any} register={register} errors={errors} />

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
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={createQuotation.isPending || createHm.isPending}>
          {createdQuotation ? 'Save H&M Details' : 'Create H&M Quotation'}
        </Button>
      </div>
    </form>
  )
}

// ─── Edit mode ────────────────────────────────────────────────────

function EditHmQuotationForm({ quotation, hm }: { quotation: Quotation; hm: HmQuotationDetail }) {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: adjusters } = useQuotationAdjusters()
  const { data: surveyors } = useQuotationSurveyors()
  const updateQuotation = useUpdateQuotation(quotation.id)
  const updateHm = useUpdateHmQuotation(quotation.id)

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } =
    useForm<UpdateHmQuotationFormData>({ resolver: zodResolver(updateHmQuotationFormSchema) })

  useEffect(() => {
    reset({
      clientId:            hm.quotation.client.id,
      insured:             quotation.insured ?? '',
      address:             quotation.address ?? '',
      recipient:           quotation.recipient ?? '',
      attentionTo:         quotation.attentionTo ?? '',
      quotationDate:       quotation.quotationDate?.slice(0, 10) ?? '',
      periodStart:         quotation.periodStart?.slice(0, 10) ?? '',
      periodEnd:           quotation.periodEnd?.slice(0, 10) ?? '',
      periodText:          quotation.periodText ?? '',
      interest:            quotation.interest ?? '',
      sumInsured:          quotation.sumInsured ? Number(quotation.sumInsured) : undefined,
      sumInsuredCurrency:  quotation.sumInsuredCurrency ?? '',
      rate:                quotation.rate ? Number(quotation.rate) : undefined,
      premium:             quotation.premium ? Number(quotation.premium) : undefined,
      deductible:          quotation.deductible ? Number(quotation.deductible) : undefined,
      deductibleText:      quotation.deductibleText ?? '',
      deductibleBasis:     quotation.deductibleBasis ?? '',
      brokerage:           quotation.brokerage ? Number(quotation.brokerage) : undefined,
      insuranceLabelValue: quotation.insuranceLabelValue ?? '',
      confirmedAcceptedBy: quotation.confirmedAcceptedBy ?? '',
      templateVersion:     quotation.templateVersion ?? '',
      vesselType:            hm.vesselType ?? '',
      tradingWarranty:       hm.tradingWarranty ?? '',
      premiumPaymentEnabled: hm.premiumPaymentEnabled,
      brokerageEnabled:      hm.brokerageEnabled,
      installments: hm.installments.map((i) => ({
        installmentNo: i.installmentNo,
        percentage:    i.percentage ? Number(i.percentage) : undefined,
        dueAfterDays:  i.dueAfterDays ?? undefined,
        amount:        i.amount ? Number(i.amount) : undefined,
        currency:      i.currency ?? '',
        dueDate:       i.dueDate?.slice(0, 10) ?? '',
      })),
      adjusterIds: hm.quotation.adjusters.map((a) => a.adjusterId),
      surveyorIds: hm.quotation.surveyors.map((s) => s.surveyorId),
    })
  }, [quotation, hm, reset])

  const adjusterIds = useWatch({ control, name: 'adjusterIds' }) ?? []
  const surveyorIds = useWatch({ control, name: 'surveyorIds' }) ?? []

  const onSubmit = handleSubmit((data) => {
    updateQuotation.mutate(
      { ...toBaseQuotationFields(data), clientId: data.clientId } as UpdateQuotationPayload,
      {
        onSuccess: () => {
          updateHm.mutate(toHmFields(data) as UpdateHmQuotationPayload, {
            onSuccess: () => {
              success('H&M quotation updated', 'Changes have been saved.')
              router.push(ROUTES.quotations.detail(quotation.id))
            },
            onError: (err) => toastError('Quotation fields saved, but H&M details failed to save', (err as ApiError).message),
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
        <FormField label="Quotation Date"><Input type="date" {...register('quotationDate')} /></FormField>
        <FormField label="Periode"><Input {...register('periodText')} /></FormField>
      </FormSection>

      <FormSection title="Insurance Information" columns={2}>
        <FormField label="The Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Address"><Input {...register('address')} /></FormField>
        <FormField label="Interest"><Input {...register('interest')} /></FormField>
        <FormField label="Type of Vessel"><Input {...register('vesselType')} /></FormField>
        <FormField label="Sum Insured"><Input type="number" step="any" min={0} {...register('sumInsured', { valueAsNumber: true })} /></FormField>
        <FormField label="Sum Insured Currency"><Input placeholder="USD" maxLength={3} {...register('sumInsuredCurrency')} /></FormField>
        <FormField label="Trading Warranty" className="col-span-2"><Input {...register('tradingWarranty')} /></FormField>
      </FormSection>

      <FormSection title="Premium & Deductible" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Premium"><Input type="number" step="any" min={0} {...register('premium', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible" className="col-span-2"><Input {...register('deductibleText')} /></FormField>
        <FormField label="Brokerage"><Input type="number" step="any" min={0} {...register('brokerage', { valueAsNumber: true })} /></FormField>
        <FormField label="Brokerage Enabled" htmlFor="brokerageEnabled">
          <label className="flex items-center gap-2 h-9 text-xs text-[#3a5068]">
            <input id="brokerageEnabled" type="checkbox" {...register('brokerageEnabled')} />
            Show brokerage on this quotation
          </label>
        </FormField>
      </FormSection>

      <HmInstallmentsSection control={control as any} register={register} errors={errors} />

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
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={updateQuotation.isPending || updateHm.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

export function HmQuotationForm(props: { mode: 'create' } | { mode: 'edit'; quotation: Quotation; hm: HmQuotationDetail }) {
  return props.mode === 'create' ? <CreateHmQuotationForm /> : <EditHmQuotationForm quotation={props.quotation} hm={props.hm} />
}