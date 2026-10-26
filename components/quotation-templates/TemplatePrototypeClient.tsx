// FILE: components/quotation-templates/TemplatePrototypeClient.tsx
// Insurer selector + generic workspace. Only insurers with a registered
// module are selectable; Inigo is not implemented in this phase.

'use client'

import { useState } from 'react'
import { TEMPLATE_INSURERS } from '@/lib/quotation-templates/insurers'
import { eagleModule } from './eagle/eagleModule'
import { msigModule } from './msig/msigModule'
import { TemplateWorkspace } from './TemplateWorkspace'

export function TemplatePrototypeClient() {
  const [code, setCode] = useState('')
  return (
    <div className="space-y-4 min-w-0">
      <div className="card"><div className="card-body flex flex-wrap items-center gap-3">
        <label htmlFor="insurer" className="text-xs font-medium text-gray-700">Insurer</label>
        <select id="insurer" className="form-input w-72 max-w-full" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">Select insurer…</option>
          {TEMPLATE_INSURERS.map((i) => <option key={i.code} value={i.code} disabled={!i.supported}>{i.label}{i.supported ? '' : ' — template not in this phase'}</option>)}
        </select>
      </div></div>
      {/* key: switching insurer remounts the workspace, so no form state leaks between templates */}
      {code === msigModule.code && <TemplateWorkspace key={code} module={msigModule} />}
      {code === eagleModule.code && <TemplateWorkspace key={code} module={eagleModule} />}
    </div>
  )
}