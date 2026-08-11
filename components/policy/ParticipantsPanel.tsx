'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/form/FormField'
import { FormModal, ConfirmModal } from '@/components/modal/BaseModal'
import { useModal } from '@/hooks/useModal'
import { useToast } from '@/context/ToastContext'
import {
  addParticipantSchema, type AddParticipantFormData,
  updateParticipantSchema, type UpdateParticipantFormData,
} from '@/lib/validations/policy'
import { addLeader, addMember, updateMember, deleteMember, validatePlacement } from '@/lib/api/policy'
import type { PolicyDocument, PolicyParticipant, ValidatePlacementResult } from '@/types/policy'

interface ParticipantsPanelProps {
  policy:   PolicyDocument
  canEdit:  boolean
}

export function ParticipantsPanel({ policy, canEdit }: ParticipantsPanelProps) {
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  const addLeaderModal  = useModal()
  const addMemberModal  = useModal()
  const editModal       = useModal<PolicyParticipant>()
  const deleteModal     = useModal<PolicyParticipant>()

  const [validation, setValidation] = useState<ValidatePlacementResult | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['policy-detail', policy.id] })
    queryClient.invalidateQueries({ queryKey: ['policy-history', policy.id] })
    queryClient.invalidateQueries({ queryKey: ['policy-list'] })
  }

  // ── Add Leader ──────────────────────────────────────────────────
  const leaderForm = useForm<AddParticipantFormData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: { insuranceCompanyId: '', sharePercentage: 0 },
  })

  const addLeaderMutation = useMutation({
    mutationFn: (data: AddParticipantFormData) => addLeader(policy.id, data),
    onSuccess: () => {
      invalidate()
      success('Leader Added', 'The leader has been added to this placement.')
      addLeaderModal.close()
      leaderForm.reset()
    },
    onError: () => toastError('Add leader failed', 'Could not add the leader. Please try again.'),
  })

  // ── Add Member ──────────────────────────────────────────────────
  const memberForm = useForm<AddParticipantFormData>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: { insuranceCompanyId: '', sharePercentage: 0 },
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: AddParticipantFormData) => addMember(policy.id, data),
    onSuccess: () => {
      invalidate()
      success('Member Added', 'The member has been added to this placement.')
      addMemberModal.close()
      memberForm.reset()
    },
    onError: () => toastError('Add member failed', 'Could not add the member. Please try again.'),
  })

  // ── Edit Member Share ────────────────────────────────────────────
  const editForm = useForm<UpdateParticipantFormData>({
    resolver: zodResolver(updateParticipantSchema),
    defaultValues: { sharePercentage: 0 },
  })

  useEffect(() => {
    if (editModal.data) {
      editForm.reset({ sharePercentage: editModal.data.sharePercentage })
    }
  }, [editModal.data, editForm])

  const updateMemberMutation = useMutation({
    mutationFn: (data: UpdateParticipantFormData) =>
      updateMember(policy.id, editModal.data!.id, data),
    onSuccess: () => {
      invalidate()
      success('Share Updated', 'The member share has been updated.')
      editModal.close()
    },
    onError: () => toastError('Update failed', 'Could not update the share. Please try again.'),
  })

  // ── Delete Member ────────────────────────────────────────────────
  const deleteMemberMutation = useMutation({
    mutationFn: () => deleteMember(policy.id, deleteModal.data!.id),
    onSuccess: () => {
      invalidate()
      success('Member Removed', 'The member has been removed from this placement.')
      deleteModal.close()
    },
    onError: () => toastError('Remove failed', 'Could not remove the member. Please try again.'),
  })

  // ── Validate Placement ───────────────────────────────────────────
  const validateMutation = useMutation({
    mutationFn: () => validatePlacement(policy.id),
    onSuccess: (result) => setValidation(result),
    onError: () => toastError('Validation failed', 'Could not validate the placement. Please try again.'),
  })

  const canDeleteMember = canEdit && policy.status !== 'READY_FOR_RFI' && policy.status !== 'PLACEMENT_COMPLETED'
  const canAddLeader    = canEdit && !policy.leader && policy.status !== 'READY_FOR_RFI'
  const canAddMember    = canEdit && policy.status !== 'READY_FOR_RFI'

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Leader &amp; Member Placement</h3>
        <div className="flex items-center gap-2">
          {canAddLeader && (
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => addLeaderModal.open()}>
              Add Leader
            </Button>
          )}
          {canAddMember && (
            <Button variant="secondary" size="sm" icon={<Plus size={12} />} onClick={() => addMemberModal.open()}>
              Add Member
            </Button>
          )}
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Role</th>
              <th>Insurance Company</th>
              <th style={{ width: 120 }}>Share</th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {policy.participants.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-[12px] text-[#7a8fa3] py-6">
                  No leader or members added yet.
                </td>
              </tr>
            )}
            {policy.participants.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className={
                    p.role === 'leader'
                      ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border bg-[#e8f3fb] text-[#123d6b] border-[#93c4e5]'
                      : 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border bg-[#f7f9fb] text-[#3a5068] border-[#b5cede]'
                  }>
                    {p.role === 'leader' && <ShieldCheck size={10} />}
                    {p.role}
                  </span>
                </td>
                <td>
                  <span className="text-[13px] text-[#18273a]">
                    {p.insuranceCompanyName ?? p.insuranceCompanyId}
                  </span>
                </td>
                <td>
                  <span className="text-[13px] font-mono font-medium text-[#3a5068]">
                    {p.sharePercentage}%
                  </span>
                </td>
                <td>
                  {p.role === 'member' && canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-[#f0f4f7] text-[#7a8fa3] hover:text-[#3a5068]"
                        onClick={() => editModal.open(p)}
                        aria-label="Edit share"
                      >
                        <Pencil size={13} />
                      </button>
                      {canDeleteMember && (
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-[#fdf2e8] text-[#7a8fa3] hover:text-[#9b2020]"
                          onClick={() => deleteModal.open(p)}
                          aria-label="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Running total + validate */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#edf1f5]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#7a8fa3]">Total Share:</span>
          <span className={
            (policy.totalShare ?? 0) === 100
              ? 'text-[13px] font-mono font-semibold text-[#1a6b3a]'
              : 'text-[13px] font-mono font-semibold text-[#9b2020]'
          }>
            {policy.totalShare ?? 0}%
          </span>
        </div>
        {canEdit && (
          <Button
            variant="secondary" size="sm"
            loading={validateMutation.isPending}
            onClick={() => validateMutation.mutate()}
          >
            Validate Placement
          </Button>
        )}
      </div>

      {validation && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 mx-4 mb-4 rounded-lg"
          style={
            validation.valid
              ? { background: '#eaf6f0', border: '1px solid #96d6b4' }
              : { background: '#fdf2e8', border: '1px solid #f0b87a' }
          }
        >
          {validation.valid
            ? <CheckCircle2 size={14} className="text-[#1a6b3a] flex-shrink-0 mt-0.5" />
            : <AlertTriangle size={14} className="text-[#7a3800] flex-shrink-0 mt-0.5" />}
          <p className={validation.valid ? 'text-[12px] text-[#1a5c38]' : 'text-[12px] text-[#7a3800]'}>
            {validation.message ?? (validation.valid
              ? `Total share is ${validation.totalShare}% — placement is valid.`
              : `Total share is ${validation.totalShare}% — must equal 100%.`)}
          </p>
        </div>
      )}

      {/* ── Add Leader Modal ─────────────────────────────────────── */}
      <FormModal
        open={addLeaderModal.isOpen}
        onClose={addLeaderModal.close}
        onSubmit={leaderForm.handleSubmit((data) => addLeaderMutation.mutate(data))}
        title="Add Leader"
        description="The leader holds primary responsibility for this placement. Only one leader is allowed."
        submitLabel="Add Leader"
        loading={addLeaderMutation.isPending}
      >
        <FormField label="Insurance Company ID" required error={leaderForm.formState.errors.insuranceCompanyId?.message}>
          <Input {...leaderForm.register('insuranceCompanyId')} error={!!leaderForm.formState.errors.insuranceCompanyId} />
        </FormField>
        <FormField label="Share Percentage" required error={leaderForm.formState.errors.sharePercentage?.message}>
          <Input
            type="number" step="0.01" min={0} max={100}
            error={!!leaderForm.formState.errors.sharePercentage}
            {...leaderForm.register('sharePercentage', { valueAsNumber: true })}
          />
        </FormField>
      </FormModal>

      {/* ── Add Member Modal ─────────────────────────────────────── */}
      <FormModal
        open={addMemberModal.isOpen}
        onClose={addMemberModal.close}
        onSubmit={memberForm.handleSubmit((data) => addMemberMutation.mutate(data))}
        title="Add Member"
        submitLabel="Add Member"
        loading={addMemberMutation.isPending}
      >
        <FormField label="Insurance Company ID" required error={memberForm.formState.errors.insuranceCompanyId?.message}>
          <Input {...memberForm.register('insuranceCompanyId')} error={!!memberForm.formState.errors.insuranceCompanyId} />
        </FormField>
        <FormField label="Share Percentage" required error={memberForm.formState.errors.sharePercentage?.message}>
          <Input
            type="number" step="0.01" min={0} max={100}
            error={!!memberForm.formState.errors.sharePercentage}
            {...memberForm.register('sharePercentage', { valueAsNumber: true })}
          />
        </FormField>
      </FormModal>

      {/* ── Edit Member Share Modal ──────────────────────────────── */}
      <FormModal
        open={editModal.isOpen}
        onClose={editModal.close}
        onSubmit={editForm.handleSubmit((data) => updateMemberMutation.mutate(data))}
        title="Update Member Share"
        submitLabel="Save"
        loading={updateMemberMutation.isPending}
      >
        <FormField label="Share Percentage" required error={editForm.formState.errors.sharePercentage?.message}>
          <Input
            type="number" step="0.01" min={0} max={100}
            error={!!editForm.formState.errors.sharePercentage}
            {...editForm.register('sharePercentage', { valueAsNumber: true })}
          />
        </FormField>
      </FormModal>

      {/* ── Delete Member Confirm ────────────────────────────────── */}
      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMemberMutation.mutate()}
        title="Remove Member"
        description="Remove this member from the placement? This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteMemberMutation.isPending}
      />
    </div>
  )
}