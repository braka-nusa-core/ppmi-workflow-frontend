// FILE: components/quotation-templates/eagle/EaglePreview.tsx
// HTML document preview for the Eagle document model (same input as the PDF
// renderer). Geometry uses CSS `pt` to mirror the PDF measurements; the paper
// is scaled to fit by ScaledPaper. One continuous page — the PDF paginates.

import type { CSSProperties } from 'react'
import { ScaledPaper } from '@/components/quotation-templates/shared/ScaledPaper'
import type { EagleDocBlock, EagleDocParagraph, EagleDocument } from '@/lib/quotation-templates/eagle/types'

const FONT: CSSProperties = { fontFamily: '"Liberation Sans", Arial, Helvetica, sans-serif', fontSize: '9.1pt', color: '#000' }
const PURPLE = '#4A0082'

function Paras({ ps, pitch, size, width = '506pt' }: { ps: EagleDocParagraph[]; pitch: number; size?: number; width?: string }) {
  return (
    <>
      {ps.map((p, i) => (
        <div key={i} style={{ marginTop: i ? `${p.gapBefore}pt` : 0, marginLeft: `${p.indent ?? 0}pt`, maxWidth: width, lineHeight: `${pitch}pt`, fontSize: size ? `${size}pt` : undefined, minHeight: `${pitch}pt` }}>{p.text}</div>
      ))}
    </>
  )
}

function Block({ b }: { b: EagleDocBlock }) {
  switch (b.type) {
    case 'title':
      return <div style={{ position: 'absolute', top: '138.3pt', left: '211.1pt', fontSize: '12pt', fontWeight: 700, color: PURPLE }}>{b.text}</div>
    case 'refLine':
      return <div style={{ position: 'absolute', top: '173.9pt', right: '47.9pt', color: PURPLE }}>{`${b.label} ${b.value}`}</div>
    case 'headerRows':
      return (
        <div style={{ marginTop: `${190.1 - 1 - 146}pt` }}>
          {b.rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '127.8pt 1fr', height: '11.4pt', lineHeight: '11.4pt', marginTop: i ? '8.6pt' : 0 }}>
              <div>{r.label}</div><div>{r.value}</div>
            </div>
          ))}
        </div>
      )
    case 'paragraphs':
      return <div style={{ marginTop: `${b.gapBefore}pt`, marginLeft: b.id === 'disclaimer' ? '1pt' : 0 }}><Paras ps={b.paragraphs} pitch={b.pitch} size={b.fontSize} /></div>
    case 'dateSignature':
      return (
        <div style={{ position: 'relative', height: '40pt', marginTop: '32.6pt' }}>
          <div style={{ position: 'absolute', top: 0, left: '1pt' }}>{b.date}</div>
          <div style={{ position: 'absolute', top: '14pt', left: '282.9pt' }}>{b.byLabel}</div>
          <div style={{ position: 'absolute', top: '24.4pt', left: '280.8pt', width: '198.5pt', borderBottom: '0.97pt solid #000' }} />
          <div style={{ position: 'absolute', top: '26.5pt', left: '338.8pt' }}>{b.signatoryLabel}</div>
        </div>
      )
    case 'bar':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt`, marginLeft: '-2.7pt', width: '510.2pt', height: '14.2pt', border: '0.57pt solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: b.bold ? '10.1pt' : undefined, fontWeight: b.bold ? 700 : 400 }}>{b.text}</div>
      )
    case 'row':
      return (
        <div style={{ marginTop: `${b.pitch}pt`, display: 'grid', gridTemplateColumns: '156.1pt 321pt', lineHeight: `${b.pitch}pt` }}>
          <div>{b.labelLines.map((l, i) => <div key={i}>{l}</div>)}</div>
          <div><Paras ps={b.paragraphs} pitch={b.pitch} width="321pt" /></div>
        </div>
      )
    case 'table':
      return (
        <div style={{ marginTop: `${b.gapBefore}pt`, marginLeft: '-2.1pt', fontSize: '7.9pt' }}>
          {b.caption && <div style={{ fontWeight: 700, marginLeft: '2.1pt', marginBottom: '11.7pt' }}>{b.caption}</div>}
          <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: `${b.columns.reduce((a, c) => a + c.width, 0)}pt` }}>
            <colgroup>{b.columns.map((c, i) => <col key={i} style={{ width: `${c.width}pt` }} />)}</colgroup>
            <thead><tr>{b.columns.map((c, i) => <th key={i} style={{ border: '0.57pt solid #000', background: '#EDE9E9', textAlign: c.align, padding: '0 2.6pt', lineHeight: '13.4pt', fontWeight: 700 }}>{c.label}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, ri) => <tr key={ri}>{r.map((v, i) => <td key={i} style={{ border: '0.57pt solid #000', textAlign: b.columns[i].align, padding: '0 2.6pt', lineHeight: '14.2pt', verticalAlign: 'top' }}>{v}</td>)}</tr>)}
              {b.total && (
                <tr>
                  {b.columns.map((_, i) => i === b.total!.column
                    ? <td key={i} style={{ border: '0.57pt solid #000', textAlign: 'right', padding: '0 2.6pt', lineHeight: '14.2pt' }}>{b.total!.value}</td>
                    : <td key={i} style={{ border: 'none' }} />)}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )
    case 'acceptance':
      return (
        <div style={{ marginTop: '14pt' }}>
          <div style={{ marginLeft: '390.2pt', fontSize: '11pt' }}>{b.label}</div>
          <div style={{ marginLeft: '388.5pt', marginTop: '92.8pt', width: '114pt', borderTop: '1px dashed #000' }} />
          <div style={{ marginLeft: '388.5pt', marginTop: '1pt', fontSize: '11pt' }}>{b.signatoryLabel}</div>
        </div>
      )
    case 'coassureds':
      return (
        <div style={{ marginTop: '22pt', fontSize: '10.1pt', lineHeight: '14pt' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '127.8pt 127.5pt 1fr', fontWeight: 700 }}>{b.columns.map((c, i) => <div key={i}>{c}</div>)}</div>
          {b.rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '127.8pt 127.5pt 1fr', marginTop: i ? 0 : '14.8pt' }}>
              <div>{r.vessel}</div><div>{r.cover}</div><div>{r.lines.map((l, k) => <div key={k}>{l}</div>)}</div>
            </div>
          ))}
        </div>
      )
  }
}

export function EaglePreview({ document }: { document: EagleDocument }) {
  const cols = [37.2, 189.2, 364.5]
  return (
    <ScaledPaper>
      <div data-testid="template-preview" data-template="eagle" style={{ ...FONT, position: 'relative', width: '595.28pt', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,.18)', padding: '146pt 42.5pt 130pt 45.1pt' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pdf-assets/ppmi-header.png" alt="PT Pandi Proteksi Marine Indonesia" style={{ position: 'absolute', left: '39.1pt', top: '7.4pt', width: '185.8pt', height: '106.8pt' }} />
        {document.blocks.map((b, i) => <Block key={i} b={b} />)}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '16.9pt', height: '70pt' }}>
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