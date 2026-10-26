// FILE: components/quotation-templates/msig/MsigPreview.tsx
// HTML document preview. Reads ONLY the document model (same input as the PDF
// renderer). Geometry uses CSS `pt` so it mirrors the PDF measurements. The
// preview is one continuous page; the exported PDF paginates onto A4.

import type { CSSProperties } from 'react'
import { ScaledPaper } from '@/components/quotation-templates/shared/ScaledPaper'
import type { MsigDocBlock, MsigDocument } from '@/lib/quotation-templates/msig/types'

const FONT: CSSProperties = { fontFamily: '"Liberation Sans", Arial, Helvetica, sans-serif', fontSize: '10.1pt', lineHeight: '13.5pt', color: '#000' }
const LABEL: CSSProperties = { fontWeight: 700, fontStyle: 'italic' }

function Block({ b }: { b: MsigDocBlock }) {
  switch (b.type) {
    case 'title':
      return <div style={{ marginLeft: '234.4pt', marginTop: '6pt', fontWeight: 700, textDecoration: 'underline', width: 'max-content' }}>{b.text}</div>
    case 'lead':
      return <div style={{ marginTop: '40pt' }}>{b.text}</div>
    case 'row':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt`, display: 'grid', gridTemplateColumns: b.fullWidth ? '1fr' : '154pt 1fr', marginLeft: b.fullWidth ? '-2.1pt' : 0, whiteSpace: 'pre-line' }}>
          {!b.fullWidth && <div style={{ ...LABEL, alignSelf: b.labelAlign === 'middle' ? 'center' : 'start' }}>{b.label}</div>}
          <div>
            {b.paragraphs.map((p, i) => (
              <div key={i} style={{ marginTop: i ? '13.5pt' : 0, fontWeight: p.bold ? 700 : 400, minHeight: '13.5pt' }}>{p.text}</div>
            ))}
          </div>
        </div>
      )
    case 'vessel':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt` }}>
          {b.rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '154pt 100.1pt 1fr', minHeight: '14pt' }}>
              <div style={LABEL}>{i === 0 ? b.label : ''}</div>
              <div style={LABEL}>{r.label}</div>
              <div>{r.value}</div>
            </div>
          ))}
        </div>
      )
    case 'amount':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt`, display: 'grid', gridTemplateColumns: '154pt 40pt 70pt 1fr' }}>
          <div style={LABEL}>{b.label}</div>
          <div>{b.currency}</div>
          <div style={{ textAlign: 'right' }}>{b.amount}</div>
          <div style={{ marginLeft: '7.1pt' }}>{b.remark}</div>
        </div>
      )
    case 'signature':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: '-2.1pt' }}>
            <span style={{ fontWeight: 700, fontStyle: 'italic' }}>{b.placeDate}</span>
            <span>{b.eoe}</span>
          </div>
          <div style={{ marginLeft: '357.8pt', marginTop: '17pt', fontSize: '11pt' }}>{b.acceptLabel}</div>
          <div style={{ marginLeft: '355.95pt', marginTop: '70pt', width: '120.7pt', borderTop: '1px dashed #000' }} />
          <div style={{ marginLeft: '357.8pt', marginTop: '3pt', fontSize: '11pt' }}>{b.signatoryLabel}</div>
        </div>
      )
  }
}

export function MsigPreview({ document }: { document: MsigDocument }) {
  const cols = [37.2, 189.2, 364.5]
  return (
    <ScaledPaper>
      <div
        data-testid="template-preview"
        data-template="msig"
        style={{ ...FONT, position: 'relative', width: '595.28pt', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,.18)', padding: '140pt 61.3pt 120pt 57.1pt' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pdf-assets/ppmi-header.png" alt="PT Pandi Proteksi Marine Indonesia" style={{ position: 'absolute', left: '39.1pt', top: '7.4pt', width: '185.8pt', height: '106.8pt' }} />
        {document.blocks.map((b, i) => <Block key={i} b={b} />)}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '70pt' }}>
          {document.footer.map((col, ci) => (
            <div key={ci} style={{ position: 'absolute', left: `${cols[ci]}pt`, top: '8pt' }}>
              <div style={{ fontSize: '11pt', fontWeight: 700, color: '#A97B50', lineHeight: '12pt' }}>{col.heading}</div>
              {col.lines.map((line, li) => (
                <div key={li} style={{ fontSize: '7.9pt', lineHeight: '10.3pt', color: '#231F20', marginTop: li === 0 ? '3pt' : 0 }}>
                  {line.map((seg, si) => seg.sup ? <sup key={si} style={{ fontSize: '4.6pt' }}>{seg.text}</sup> : <span key={si}>{seg.text}</span>)}
                </div>
              ))}
            </div>
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pdf-assets/ppmi-ship.png" alt="" style={{ position: 'absolute', left: '507.8pt', bottom: '8pt', width: '55.2pt', height: '71.1pt' }} />
        </div>
        </div>
    </ScaledPaper>
  )
}