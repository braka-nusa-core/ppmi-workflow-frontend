'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id:       string
  file:     File
  name:     string
  size:     number
  preview?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext ?? ''))             return { icon: FileText, color: 'text-[#8c1f1f]', bg: 'bg-[#fdecea]' }
  if (['doc', 'docx'].includes(ext ?? ''))     return { icon: FileText, color: 'text-[#123d6b]', bg: 'bg-[#e8f3fb]' }
  if (['xls', 'xlsx'].includes(ext ?? ''))     return { icon: FileText, color: 'text-[#1a5c38]', bg: 'bg-[#eaf6f0]' }
  return { icon: File, color: 'text-[#3a5068]', bg: 'bg-[#f0f4f7]' }
}

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

export function QSAttachmentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024)
    const mapped: UploadedFile[] = valid.map((file) => ({
      id:   Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: file.size,
    }))
    setFiles((prev) => [...prev, ...mapped])
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <div>
      <p className="text-[12px] font-medium text-[#3a5068] mb-1.5">
        Attachments
        <span className="ml-1 text-[11px] font-normal text-[#7a8fa3]">
          (PDF, Word, Excel, Images — max {MAX_SIZE_MB}MB each)
        </span>
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e)  => { e.preventDefault(); setDragging(true)  }}
        onDragLeave={()  => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed cursor-pointer',
          'transition-colors duration-150',
          isDragging
            ? 'border-[#123d6b] bg-[#e8f3fb]'
            : 'border-[#b5cede] bg-[#f7f9fb] hover:border-[#7a8fa3] hover:bg-[#f0f4f7]'
        )}
      >
        <Upload size={18} className={isDragging ? 'text-[#123d6b]' : 'text-[#7a8fa3]'} />
        <p className="text-[12px] text-[#3a5068] font-medium">
          Drop files here or <span className="text-[#123d6b] underline">browse</span>
        </p>
        <p className="text-[11px] text-[#7a8fa3]">
          Certificate of Registry, Classification Certificate, Previous Policy
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {files.map((f) => {
            const { icon: Icon, color, bg } = getFileIcon(f.name)
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white border border-[#d5e3ef]"
              >
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0', bg)}>
                  <Icon size={13} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#18273a] truncate">{f.name}</p>
                  <p className="text-[10px] text-[#7a8fa3]">{formatFileSize(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                  className="text-[#7a8fa3] hover:text-[#8c1f1f] transition-colors duration-100 flex-shrink-0 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
