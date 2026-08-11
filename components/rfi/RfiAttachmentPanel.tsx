'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, File, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/context/ToastContext'
import { uploadRfiAttachment, deleteRfiAttachment } from '@/lib/api/rfi'
import { ConfirmModal } from '@/components/modal/BaseModal'
import { useModal } from '@/hooks/useModal'
import type { RfiAttachment } from '@/types/rfi'

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')                        return { icon: FileText, color: 'text-[#8c1f1f]', bg: 'bg-[#fdecea]' }
  if (['doc', 'docx'].includes(ext ?? ''))  return { icon: FileText, color: 'text-[#123d6b]', bg: 'bg-[#e8f3fb]' }
  if (['xls', 'xlsx'].includes(ext ?? ''))  return { icon: FileText, color: 'text-[#1a5c38]', bg: 'bg-[#eaf6f0]' }
  return { icon: File, color: 'text-[#3a5068]', bg: 'bg-[#f0f4f7]' }
}

interface RfiAttachmentPanelProps {
  rfiId:       string
  attachments: RfiAttachment[]
  canEdit:     boolean
}

export function RfiAttachmentPanel({ rfiId, attachments, canEdit }: RfiAttachmentPanelProps) {
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()
  const [isDragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteModal = useModal<RfiAttachment>()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['rfi-detail', rfiId] })
    queryClient.invalidateQueries({ queryKey: ['rfi-history', rfiId] })
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadRfiAttachment(rfiId, file),
    onSuccess: () => {
      invalidate()
      success('File Uploaded', 'The attachment has been uploaded.')
    },
    onError: () => toastError('Upload failed', 'Could not upload the file. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRfiAttachment(rfiId, deleteModal.data!.id),
    onSuccess: () => {
      invalidate()
      success('Attachment Removed', 'The file has been removed.')
      deleteModal.close()
    },
    onError: () => toastError('Remove failed', 'Could not remove the file. Please try again.'),
  })

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    Array.from(incoming)
      .filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024)
      .forEach((file) => uploadMutation.mutate(file))
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Attachments</h3>
      </div>

      <div className="px-4 pt-3">
        {canEdit && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150',
              isDragging
                ? 'border-[#123d6b] bg-[#e8f3fb]'
                : 'border-[#b5cede] bg-[#f7f9fb] hover:border-[#7a8fa3] hover:bg-[#f0f4f7]'
            )}
          >
            <Upload size={18} className={isDragging ? 'text-[#123d6b]' : 'text-[#7a8fa3]'} />
            <p className="text-[12px] text-[#3a5068] font-medium">
              Drop files here or <span className="text-[#123d6b] underline">browse</span>
            </p>
            <p className="text-[11px] text-[#9aa3ad]">PDF, Word, Excel, Images — max {MAX_SIZE_MB}MB each</p>
            <input
              ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        )}
      </div>

      <ul className="px-4 py-2">
        {attachments.length === 0 && (
          <li className="text-center text-[12px] text-[#7a8fa3] py-4">No attachments uploaded yet.</li>
        )}
        {attachments.map((att) => {
          const { icon: Icon, color, bg } = getFileIcon(att.fileName)
          return (
            <li key={att.id} className="flex items-center gap-2.5 py-2 border-b border-[#f0f4f7] last:border-0">
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0', bg)}>
                <Icon size={14} className={color} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-[#123d6b] hover:underline truncate block">
                  {att.fileName}
                </a>
                <p className="text-[10px] text-[#9aa3ad]">
                  {att.uploadedBy} · {formatDateTime(att.uploadedAt)}
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-[#fdf2e8] text-[#7a8fa3] hover:text-[#9b2020] flex-shrink-0"
                  onClick={() => deleteModal.open(att)}
                  aria-label="Delete attachment"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Attachment"
        description={`Delete ${deleteModal.data?.fileName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}