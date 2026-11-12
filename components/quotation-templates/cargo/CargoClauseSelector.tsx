// FILE: components/quotation-templates/cargo/CargoClauseSelector.tsx
// Clause selector — main clause radio + additional clauses checkboxes.

'use client'

import { useState, useMemo } from 'react'
import type { MainClauseEntry, AdditionalClauseEntry } from '@/lib/quotation-templates/cargo/types'
import { Input } from '@/components/ui/Input'

interface CargoClauseSelectorProps {
  mainClauses: MainClauseEntry[]
  additionalClauses: AdditionalClauseEntry[]
  value?: {
    mainClause?: string
    additionalClauses?: string[]
  }
  onChange?: (value: { mainClause?: string; additionalClauses?: string[] }) => void
}

/**
 * Clause selector — 6 main clause radio + 39 additional clause checkboxes.
 * Main clause: Single-select radio (instituteCargoClause enum).
 * Additional clauses: Multi-select checkboxes with search.
 */
export function CargoClauseSelector({
  mainClauses,
  additionalClauses,
  value,
  onChange,
}: CargoClauseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const selectedMain = value?.mainClause || ''
  const selectedAdditional = value?.additionalClauses || []

  // Filter additional clauses by search term
  const filteredAdditional = useMemo(() => {
    if (!searchTerm.trim()) return additionalClauses
    const term = searchTerm.toLowerCase()
    return additionalClauses.filter(
      (clause) =>
        clause.label.toLowerCase().includes(term) ||
        clause.code.toLowerCase().includes(term)
    )
  }, [additionalClauses, searchTerm])

  const handleMainChange = (code: string) => {
    onChange?.({ mainClause: code, additionalClauses: selectedAdditional })
  }

  const handleAdditionalToggle = (code: string) => {
    const newSelected = selectedAdditional.includes(code)
      ? selectedAdditional.filter((c) => c !== code)
      : [...selectedAdditional, code]
    onChange?.({ mainClause: selectedMain, additionalClauses: newSelected })
  }

  const handleSelectAll = () => {
    const allCodes = additionalClauses.map((c) => c.code)
    onChange?.({ mainClause: selectedMain, additionalClauses: allCodes })
  }

  const handleClearAll = () => {
    onChange?.({ mainClause: selectedMain, additionalClauses: [] })
  }

  return (
    <div className="space-y-6">
      {/* Main Clause Section */}
      <div>
        <h3 className="text-sm font-medium text-[#0d2847] mb-3">
          Institute Cargo Clause <span className="text-red-500">*</span>
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Pilih salah satu klausul utama (wajib dipilih sebelum submit)
        </p>
        <div className="space-y-2">
          {mainClauses.map((clause) => (
            <label
              key={clause.code}
              className="flex items-start gap-3 p-3 border border-[#e2e8f0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="mainClause"
                value={clause.code}
                checked={selectedMain === clause.code}
                onChange={() => handleMainChange(clause.code)}
                className="mt-0.5 h-4 w-4 text-[#1e40af] border-gray-300 focus:ring-[#1e40af]"
              />
              <span className="text-sm text-[#0d2847]">{clause.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Clauses Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#0d2847]">
            Additional Clauses
          </h3>
          <span className="text-xs text-[#64748b]">
            {selectedAdditional.length} / {additionalClauses.length} dipilih
          </span>
        </div>
        <p className="text-xs text-[#64748b] mb-4">
          Klausul tambahan (opsional, bisa pilih lebih dari satu)
        </p>

        {/* Search + Actions */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Cari klausul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-2 text-xs font-medium text-[#1e40af] border border-[#1e40af] rounded-lg hover:bg-[#eff6ff] transition-colors"
          >
            Pilih Semua
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 text-xs font-medium text-[#64748b] border border-[#cbd5e1] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hapus Semua
          </button>
        </div>

        {/* Clause List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAdditional.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              Tidak ada klausul yang cocok dengan pencarian
            </p>
          ) : (
            filteredAdditional.map((clause) => (
              <label
                key={clause.code}
                className="flex items-start gap-3 p-3 border border-[#e2e8f0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAdditional.includes(clause.code)}
                  onChange={() => handleAdditionalToggle(clause.code)}
                  className="mt-0.5 h-4 w-4 text-[#1e40af] border-gray-300 rounded focus:ring-[#1e40af]"
                />
                <span className="text-sm text-[#0d2847]">{clause.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
