// FILE: components/pni/PniQuotationForm.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { useClients } from '@/hooks/useClients'
import { useInsuranceTypes } from '@/hooks/useInsuranceTypes'
import { useCreatePniQuotation, useUpdatePniQuotation, usePniClubFormats, usePniClubFormatTemplate } from '@/hooks/usePni'
import {
  createPniQuotationFormSchema,
  updatePniQuotationFormSchema,
  findSelfInheritingBlocks,
  type CreatePniQuotationFormData,
  type UpdatePniQuotationFormData,
} from '@/lib/validations/pni'
import { ROUTES } from '@/config/routes'
import { PniVesselsSection } from './sections/PniVesselsSection'
import { PniInsuranceBlocksSection, PniVesselCoveragesSection } from './sections/PniInsuranceBlocksSection'
import { PniDeductiblesSection } from './sections/PniDeductiblesSection'
import { PniProvisionsSection, PniCoverRestrictionsSection } from './sections/PniProvisionsSection'
import { PniInstallmentsSection, PniRequiredDocumentsSection, PniOrganizationRolesSection } from './sections/PniAdminSection'
import type { PniQuotationDetail, CreatePniQuotationPayload, UpdatePniQuotationPayload } from '@/types/pni'
import type { ApiError } from '@/types/api'

const CLUB_FORMAT_HELP: Record<string, string> = {
  INIGO_SYNDICATE_1301:     'Adhiguna-style fleet quote — vessel-scoped clauses/deductibles.',
  EAGLE_OCEAN_MARINE:       'Bhina-style quote — claim-category deductibles.',
  MSIG_SPECIALTY_MARINE_NV: 'Karya-style quote — supports a separate War P&I block via block inheritance.',
}

// ─── Payload builders ────────────────────────────────────────────
// Same normalization convention as components/quotations/QuotationForm.tsx:
// empty-string optional fields become `undefined` so they're omitted
// rather than sent as empty strings; numeric fields pass through
// react-hook-form's `valueAsNumber` (NaN-on-empty already guarded by
// optionalNonNegativeNumber at the schema level).

function toCreatePayload(data: CreatePniQuotationFormData): CreatePniQuotationPayload {
  const quotationBase = {
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
  return {
    quotation:
      data.clientMode === 'existing'
        ? { ...quotationBase, clientId: data.clientId as string }
        : { ...quotationBase, client: { ...data.client, name: data.client!.name as string } },
    pni:                data.pni,
    vessels:            data.vessels,
    insuranceBlocks:    data.insuranceBlocks,
    vesselCoverages:    data.vesselCoverages,
    provisions:         data.provisions,
    deductibles:        data.deductibles,
    installments:       data.installments,
    requiredDocuments:  data.requiredDocuments,
    organizationRoles:  data.organizationRoles,
    coverRestrictions:  data.coverRestrictions,
  }
}

function toUpdatePayload(data: UpdatePniQuotationFormData): UpdatePniQuotationPayload {
  return {
    quotation: {
      clientId:        data.clientId || undefined,
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
    },
    pni:               data.pni,
    vessels:           data.vessels,
    insuranceBlocks:   data.insuranceBlocks,
    vesselCoverages:   data.vesselCoverages,
    provisions:        data.provisions,
    deductibles:       data.deductibles,
    installments:      data.installments,
    requiredDocuments: data.requiredDocuments,
    organizationRoles: data.organizationRoles,
    coverRestrictions: data.coverRestrictions,
  }
}

/** Flattens the nested GET /pni/quotations/:id response back into this form's flat top-level arrays (see components/pni/sections' comments for why the form keeps them flat). */
function detailToFormValues(pni: PniQuotationDetail): Partial<UpdatePniQuotationFormData> {
  const allProvisions = [...pni.provisions, ...pni.insuranceBlocks.flatMap((b) => b.provisions)]
  const allCoverRestrictions = [...pni.coverRestrictions, ...pni.insuranceBlocks.flatMap((b) => b.coverRestrictions)]
  const allDeductibles = pni.insuranceBlocks.flatMap((b) => b.deductibles)
  const allVesselCoverages = pni.vessels.flatMap((v) => v.coverages.map((c) => ({ ...c, vesselId: v.id })))

  return {
    clientId:        pni.quotation.client.id,
    insured:         (pni.quotation.insured as string) ?? '',
    address:         (pni.quotation.address as string) ?? '',
    quotationDate:   (pni.quotation.quotationDate as string)?.slice(0, 10) ?? '',
    periodStart:     (pni.quotation.periodStart as string)?.slice(0, 10) ?? '',
    periodEnd:       (pni.quotation.periodEnd as string)?.slice(0, 10) ?? '',
    interest:        (pni.quotation.interest as string) ?? '',
    rate:            numOrUndef(pni.quotation.rate as string | number | null),
    premium:         numOrUndef(pni.quotation.premium as string | number | null),
    deductible:      numOrUndef(pni.quotation.deductible as string | number | null),
    brokerage:       numOrUndef(pni.quotation.brokerage as string | number | null),
    templateVersion: (pni.quotation.templateVersion as string) ?? '',
    pni: {
      clubFormat:            pni.clubFormat,
      referenceNumber:       pni.referenceNumber ?? '',
      validityDays:          pni.validityDays ?? undefined,
      assuredDomicile:       pni.assuredDomicile ?? '',
      broker:                pni.broker ?? '',
      insurerOrSecurity:     pni.insurerOrSecurity ?? '',
      tradingLimits:         pni.tradingLimits ?? '',
      paymentTermsText:      pni.paymentTermsText ?? '',
      subjectivities:        pni.subjectivities ?? '',
      importantInformation:  pni.importantInformation ?? '',
      signatureName:         pni.signatureName ?? '',
      signatureCity:         pni.signatureCity ?? '',
      signatureDate:         pni.signatureDate?.slice(0, 10) ?? '',
    },
    vessels: pni.vessels.map((v) => ({
      id: v.id, key: v.id,
      name: v.name, imoNumber: v.imoNumber ?? '', vesselType: v.vesselType ?? '',
      builtYear: v.builtYear ?? undefined, flag: v.flag ?? '', vesselClass: v.vesselClass ?? '',
      classNotApplicable: v.classNotApplicable, grossTonnage: numOrUndef(v.grossTonnage),
      portOfRegistry: v.portOfRegistry ?? '', sortOrder: v.sortOrder,
    })),
    insuranceBlocks: pni.insuranceBlocks.map((b) => ({
      id: b.id, key: b.id,
      inheritsFromBlockRef: b.inheritsFromBlockId ?? undefined,
      typeOfInsurance: b.typeOfInsurance, security: b.security ?? '',
      policyWordingReference: b.policyWordingReference ?? '', tradingArea: b.tradingArea ?? '',
      paymentWarrantyText: b.paymentWarrantyText ?? '', maximumInsured: numOrUndef(b.maximumInsured),
      currency: b.currency, premium: numOrUndef(b.premium) ?? 0, premiumBasis: b.premiumBasis, sortOrder: b.sortOrder,
    })),
    vesselCoverages: allVesselCoverages.map((c) => ({
      id: c.id, vesselRef: c.vesselId, insuranceBlockRef: c.insuranceBlockId,
      annualPremium: numOrUndef(c.annualPremium), limitAmount: numOrUndef(c.limitAmount), currency: c.currency,
    })),
    provisions: allProvisions.map((p) => ({
      id: p.id, insuranceBlockRef: p.insuranceBlockId ?? undefined, type: p.type, source: p.source, scope: p.scope,
      title: p.title, content: p.content ?? '', reference: p.reference ?? '', sortOrder: p.sortOrder,
      vesselRefs: p.vesselScopes.map((vs) => vs.vesselId),
    })),
    deductibles: allDeductibles.map((d) => ({
      id: d.id, insuranceBlockRef: d.insuranceBlockId, scope: d.scope, claimCategory: d.claimCategory ?? '',
      amount: numOrUndef(d.amount), currency: d.currency, description: d.description ?? '', sortOrder: d.sortOrder,
      vesselRefs: d.vesselScopes.map((vs) => vs.vesselId),
    })),
    installments: pni.installments.map((i) => ({
      id: i.id, installmentNo: i.installmentNo, amount: numOrUndef(i.amount), currency: i.currency,
      dueDate: i.dueDate?.slice(0, 10) ?? '',
    })),
    requiredDocuments: pni.requiredDocuments.map((d) => ({ id: d.id, name: d.name, isRequired: d.isRequired, sortOrder: d.sortOrder })),
    organizationRoles: pni.organizationRoles.map((r) => ({ id: r.id, organization: r.organization ?? '', role: r.role, sortOrder: r.sortOrder })),
    coverRestrictions: allCoverRestrictions.map((r) => ({
      id: r.id, insuranceBlockRef: r.insuranceBlockId ?? undefined, name: r.name,
      partReference: r.partReference ?? '', sectionReference: r.sectionReference ?? '', isSelected: r.isSelected, sortOrder: r.sortOrder,
    })),
  }
}

function numOrUndef(v: string | number | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

// ─── Technical-department gate (shared by create & edit) ─────────

function usePniAccessGate() {
  const { user, can, isLoading, technicalDepartment } = useAuth()
  const allowed = can('quotation', 'create') && (user?.isSuperAdmin || technicalDepartment() === 'P&I')
  return { allowed, isLoading }
}

// ─── Create mode ──────────────────────────────────────────────────

function CreatePniQuotationForm() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { allowed, isLoading: authLoading } = usePniAccessGate()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: insuranceTypes, isLoading: insuranceTypesLoading } = useInsuranceTypes()
  const { data: clubFormats, isLoading: clubFormatsLoading } = usePniClubFormats()
  const createMutation = useCreatePniQuotation()

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } =
    useForm<CreatePniQuotationFormData>({
      resolver: zodResolver(createPniQuotationFormSchema),
      defaultValues: { clientMode: 'existing', pni: { clubFormat: 'INIGO_SYNDICATE_1301' } },
    })
  const clientMode = watch('clientMode')
  const clubFormat = useWatch({ control, name: 'pni.clubFormat' })
  const { data: template } = usePniClubFormatTemplate(clubFormat)

  if (authLoading) return <PageSpinner label="Loading…" />
  if (!allowed) {
    return (
      <ErrorState
        message="You don't have permission to create P&I quotations"
        description="P&I quotation creation is limited to Teknik P&I department members."
      />
    )
  }

  const onSubmit = handleSubmit((data) => {
    const selfInherit = findSelfInheritingBlocks(data.insuranceBlocks ?? [])
    if (selfInherit.length > 0) {
      toastError('Invalid insurance blocks', selfInherit[0].message)
      return
    }
    createMutation.mutate(toCreatePayload(data), {
      onSuccess: (created) => {
        success('P&I quotation created', `${created.quotation.quotationNumber} has been saved as Draft.`)
        router.push(ROUTES.quotations.detail(created.quotation.id))
      },
      onError: (err) => {
        const apiError = err as ApiError
        toastError('Failed to create P&I quotation', apiError.message)
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
            <FormField label="Address"><Input {...register('client.address')} /></FormField>
            <FormField label="Phone"><Input {...register('client.phone')} /></FormField>
            <FormField label="Email"><Input type="email" {...register('client.email')} /></FormField>
            <FormField label="Contact Person"><Input {...register('client.contactPerson')} /></FormField>
          </div>
        )}
      </FormSection>

      <FormSection title="Insurance Type & Club Format" columns={2}>
        <FormField label="Insurance Type" required error={errors.insuranceTypeId?.message}>
          <Select
            error={!!errors.insuranceTypeId}
            placeholder={insuranceTypesLoading ? 'Loading…' : 'Select insurance type'}
            options={(insuranceTypes ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
            {...register('insuranceTypeId')}
          />
        </FormField>
        <FormField
          label="P&I Club Format"
          required
          hint={clubFormat ? CLUB_FORMAT_HELP[clubFormat] : undefined}
        >
          <Select
            placeholder={clubFormatsLoading ? 'Loading…' : undefined}
            options={(clubFormats ?? []).map((f) => ({ value: f.code, label: f.displayName }))}
            {...register('pni.clubFormat')}
          />
        </FormField>
        {template && template.length > 0 && (
          <p className="col-span-2 text-xs text-[#9aa3ad]">
            Reference template available: {template.map((t) => t.name).join(', ')}
          </p>
        )}
      </FormSection>

      <FormSection title="Basic Information" columns={2}>
        <FormField label="Quotation Date"><Input type="date" {...register('quotationDate')} /></FormField>
        <FormField label="Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Period Start"><Input type="date" {...register('periodStart')} /></FormField>
        <FormField label="Period End"><Input type="date" {...register('periodEnd')} /></FormField>
        <FormField label="Address" className="col-span-2"><Input {...register('address')} /></FormField>
        <FormField label="Interest" className="col-span-2"><Input {...register('interest')} /></FormField>
      </FormSection>

      <FormSection title="P&I Details" columns={2}>
        <FormField label="Reference Number"><Input {...register('pni.referenceNumber')} /></FormField>
        <FormField label="Validity (Days)"><Input type="number" min={1} {...register('pni.validityDays', { valueAsNumber: true })} /></FormField>
        <FormField label="Assured Domicile"><Input {...register('pni.assuredDomicile')} /></FormField>
        <FormField label="Broker"><Input {...register('pni.broker')} /></FormField>
        <FormField label="Insurer / Security" className="col-span-2"><Input {...register('pni.insurerOrSecurity')} /></FormField>
        <FormField label="Trading Limits" className="col-span-2"><Input {...register('pni.tradingLimits')} /></FormField>
        <FormField label="Payment Terms Text" className="col-span-2"><Input {...register('pni.paymentTermsText')} /></FormField>
        <FormField label="Subjectivities" className="col-span-2"><Input {...register('pni.subjectivities')} /></FormField>
        <FormField label="Important Information" className="col-span-2"><Input {...register('pni.importantInformation')} /></FormField>
        <FormField label="Signature Name"><Input {...register('pni.signatureName')} /></FormField>
        <FormField label="Signature City"><Input {...register('pni.signatureCity')} /></FormField>
        <FormField label="Signature Date"><Input type="date" {...register('pni.signatureDate')} /></FormField>
      </FormSection>

      <FormSection title="Financial" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Premium"><Input type="number" step="any" min={0} {...register('premium', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible"><Input type="number" step="any" min={0} {...register('deductible', { valueAsNumber: true })} /></FormField>
        <FormField label="Brokerage"><Input type="number" step="any" min={0} {...register('brokerage', { valueAsNumber: true })} /></FormField>
      </FormSection>

      <PniVesselsSection control={control as any} register={register} errors={errors} />
      <PniInsuranceBlocksSection control={control as any} register={register} errors={errors} />
      <PniVesselCoveragesSection control={control as any} register={register} errors={errors} />
      <PniDeductiblesSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniProvisionsSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniCoverRestrictionsSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniInstallmentsSection control={control as any} register={register} errors={errors} />
      <PniRequiredDocumentsSection control={control as any} register={register} errors={errors} />
      <PniOrganizationRolesSection control={control as any} register={register} errors={errors} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.list)}>Cancel</Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={createMutation.isPending}>
          Create P&I Quotation
        </Button>
      </div>
    </form>
  )
}

// ─── Edit mode ────────────────────────────────────────────────────

function EditPniQuotationForm({ pni }: { pni: PniQuotationDetail }) {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const { data: clients, isLoading: clientsLoading } = useClients()
  const updateMutation = useUpdatePniQuotation(pni.quotationId)


  const { register, handleSubmit, control, setValue, reset, formState: { errors } } =
    useForm<UpdatePniQuotationFormData>({ resolver: zodResolver(updatePniQuotationFormSchema) })

  useEffect(() => {
    reset(detailToFormValues(pni))
  }, [pni, reset])

  const onSubmit = handleSubmit((data) => {
    const selfInherit = findSelfInheritingBlocks(data.insuranceBlocks ?? [])
    if (selfInherit.length > 0) {
      toastError('Invalid insurance blocks', selfInherit[0].message)
      return
    }
    updateMutation.mutate(toUpdatePayload(data), {
      onSuccess: () => {
        success('P&I quotation updated', 'Changes have been saved.')
        router.push(ROUTES.quotations.detail(pni.quotationId))
      },
      onError: (err) => {
        const apiError = err as ApiError
        toastError('Failed to update P&I quotation', apiError.message)
      },
    })
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
        <FormField label="P&I Club Format" hint="Set at creation — not changeable here.">
          <Input value={pni.clubFormat} disabled />
        </FormField>
      </FormSection>

      <FormSection title="Basic Information" columns={2}>
        <FormField label="Quotation Date"><Input type="date" {...register('quotationDate')} /></FormField>
        <FormField label="Insured"><Input {...register('insured')} /></FormField>
        <FormField label="Period Start"><Input type="date" {...register('periodStart')} /></FormField>
        <FormField label="Period End"><Input type="date" {...register('periodEnd')} /></FormField>
        <FormField label="Address" className="col-span-2"><Input {...register('address')} /></FormField>
        <FormField label="Interest" className="col-span-2"><Input {...register('interest')} /></FormField>
      </FormSection>

      <FormSection title="P&I Details" columns={2}>
        <FormField label="Reference Number"><Input {...register('pni.referenceNumber')} /></FormField>
        <FormField label="Validity (Days)"><Input type="number" min={1} {...register('pni.validityDays', { valueAsNumber: true })} /></FormField>
        <FormField label="Assured Domicile"><Input {...register('pni.assuredDomicile')} /></FormField>
        <FormField label="Broker"><Input {...register('pni.broker')} /></FormField>
        <FormField label="Insurer / Security" className="col-span-2"><Input {...register('pni.insurerOrSecurity')} /></FormField>
        <FormField label="Trading Limits" className="col-span-2"><Input {...register('pni.tradingLimits')} /></FormField>
        <FormField label="Payment Terms Text" className="col-span-2"><Input {...register('pni.paymentTermsText')} /></FormField>
        <FormField label="Subjectivities" className="col-span-2"><Input {...register('pni.subjectivities')} /></FormField>
        <FormField label="Important Information" className="col-span-2"><Input {...register('pni.importantInformation')} /></FormField>
        <FormField label="Signature Name"><Input {...register('pni.signatureName')} /></FormField>
        <FormField label="Signature City"><Input {...register('pni.signatureCity')} /></FormField>
        <FormField label="Signature Date"><Input type="date" {...register('pni.signatureDate')} /></FormField>
      </FormSection>

      <FormSection title="Financial" columns={2}>
        <FormField label="Rate"><Input type="number" step="any" min={0} {...register('rate', { valueAsNumber: true })} /></FormField>
        <FormField label="Premium"><Input type="number" step="any" min={0} {...register('premium', { valueAsNumber: true })} /></FormField>
        <FormField label="Deductible"><Input type="number" step="any" min={0} {...register('deductible', { valueAsNumber: true })} /></FormField>
        <FormField label="Brokerage"><Input type="number" step="any" min={0} {...register('brokerage', { valueAsNumber: true })} /></FormField>
      </FormSection>

      <PniVesselsSection control={control as any} register={register} errors={errors} />
      <PniInsuranceBlocksSection control={control as any} register={register} errors={errors} />
      <PniVesselCoveragesSection control={control as any} register={register} errors={errors} />
      <PniDeductiblesSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniProvisionsSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniCoverRestrictionsSection control={control as any} register={register} errors={errors} setValue={setValue} />
      <PniInstallmentsSection control={control as any} register={register} errors={errors} />
      <PniRequiredDocumentsSection control={control as any} register={register} errors={errors} />
      <PniOrganizationRolesSection control={control as any} register={register} errors={errors} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.quotations.detail(pni.quotationId))}>Cancel</Button>
        <Button type="submit" variant="primary" icon={<Save size={13} />} loading={updateMutation.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// ─── Public component ─────────────────────────────────────────────

export function PniQuotationForm(props: { mode: 'create' } | { mode: 'edit'; pni: PniQuotationDetail }) {
  return props.mode === 'create' ? <CreatePniQuotationForm /> : <EditPniQuotationForm pni={props.pni} />
}