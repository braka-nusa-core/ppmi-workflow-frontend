// FILE: components/quotation-templates/eagle/EaglePdfDocument.tsx
// PDF renderer for the Eagle Ocean Marine document model. Geometry (points)
// was measured from the supplied sample PDF (A4 portrait, 11 pages). Loaded
// lazily via exportPdf.ts — never import from a server component.

import React from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { Document, Line, Page, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'
import { PDF_FAMILY, PpmiPageChrome, registerPpmiPdfFonts } from '@/components/quotation-templates/shared/PpmiPdfChrome'
import type { EagleDocBlock, EagleDocParagraph, EagleDocument } from '@/lib/quotation-templates/eagle/types'

// ─── Measured layout (pt) ───────────────────────────────────────
const G = {
  padTop: 146, padBottom: 102, padLeft: 45.1, padRight: 42.5,
  font: 9.1, labelW: 156.1, valueW: 321, fullW: 506, purple: '#4A0082',
  /** Eagle's footer + ship artwork sit 16.9 pt higher than MSIG's (measured). */
  footerOffsetY: -16.9,
  barW: 510.2, barH: 14.2,
}
const S = StyleSheet.create({
  page: { fontFamily: PDF_FAMILY, fontSize: G.font, paddingTop: G.padTop, paddingBottom: G.padBottom, paddingLeft: G.padLeft, paddingRight: G.padRight },
  bold: { fontWeight: 700 },
})
/** Absolute line pitch. Unitless multipliers rendered inconsistently in react-pdf 4.9 (doubled pitch in some layouts), so points are used. */
const lh = (pitch: number, _size: number = G.font) => `${pitch}pt`

function Paragraphs({ ps, pitch, size = G.font, width = G.fullW, indentBase = 0 }: { ps: EagleDocParagraph[]; pitch: number; size?: number; width?: number; indentBase?: number }) {
  return (
    <>
      {ps.map((p, i) => (
        <Text key={i} style={{ fontSize: size, lineHeight: lh(pitch, size), marginTop: i ? p.gapBefore : 0, marginLeft: indentBase + (p.indent ?? 0), width: width - (p.indent ?? 0) }}>{p.text}</Text>
      ))}
    </>
  )
}

function Bar({ text, bold, mt }: { text: string; bold?: boolean; mt: number }) {
  return (
    <View wrap={false} minPresenceAhead={50} style={{ marginTop: mt, marginLeft: -2.7, width: G.barW, height: G.barH, borderWidth: 0.57, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: bold ? 10.1 : G.font, fontWeight: bold ? 700 : 400, lineHeight: '10pt' }}>{text}</Text>
    </View>
  )
}

function Table({ b }: { b: Extract<EagleDocBlock, { type: 'table' }> }) {
  const border = { borderColor: '#000', borderRightWidth: 0.57, borderBottomWidth: 0.57 }
  const cellText = (align: 'left' | 'right', header: boolean) => ({ fontSize: 7.9, fontWeight: header ? 700 : 400, lineHeight: lh(header ? 13.4 : 14.2, 7.9), textAlign: align } as const)
  const lead = b.total ? b.columns.slice(0, b.total.column).reduce((a, c) => a + c.width, 0) : 0
  return (
    <View wrap={false} style={{ marginTop: b.gapBefore, marginLeft: -2.1 }}>
      {b.caption ? <Text style={{ fontSize: 7.9, fontWeight: 700, marginLeft: 2.1, marginBottom: 11.7, lineHeight: '9.5pt' }}>{b.caption}</Text> : null}
      <View style={{ borderColor: '#000', borderTopWidth: 0.57, borderLeftWidth: 0.57, alignSelf: 'flex-start' }}>
        <View style={{ flexDirection: 'row', flexShrink: 0, backgroundColor: '#EDE9E9' }}>
          {b.columns.map((c, i) => (
            <View key={i} style={[{ width: c.width, flexShrink: 0, paddingHorizontal: 2.6 }, border]}><Text style={cellText(c.align, true)}>{c.label}</Text></View>
          ))}
        </View>
        {b.rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: 'row' }}>
            {r.map((v, i) => (
              <View key={i} style={[{ width: b.columns[i].width, flexShrink: 0, paddingHorizontal: 2.6 }, border]}><Text style={cellText(b.columns[i].align, false)}>{v}</Text></View>
            ))}
          </View>
        ))}
      </View>
      {b.total && (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: lead, flexShrink: 0 }} />
          <View style={[{ width: b.columns[b.total.column].width, flexShrink: 0, paddingHorizontal: 2.6, borderLeftWidth: 0.57 }, border]}>
            <Text style={cellText('right', false)}>{b.total.value}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

function Block({ b }: { b: EagleDocBlock }) {
  switch (b.type) {
    case 'title':
      return <Text style={{ position: 'absolute', top: 138.3, left: 211.1, fontSize: 12, fontWeight: 700, color: G.purple }}>{b.text}</Text>
    case 'refLine':
      return <Text style={{ position: 'absolute', top: 173.9, left: 300, width: 247.4, textAlign: 'right', color: G.purple }}>{`${b.label} ${b.value}`}</Text>
    case 'headerRows':
      return (
        <View style={{ marginTop: 190.1 - 1 - G.padTop }}>
          {b.rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', marginTop: i ? 8.6 : 0 }}>
              <Text style={{ width: 127.8, lineHeight: lh(11.4) }}>{r.label}</Text>
              <Text style={{ flex: 1, lineHeight: lh(11.4) }}>{r.value}</Text>
            </View>
          ))}
        </View>
      )
    case 'paragraphs':
      return (
        <View style={{ marginTop: b.gapBefore, marginLeft: b.id === 'disclaimer' ? 1 : 0 }}>
          <Paragraphs ps={b.paragraphs} pitch={b.pitch} size={b.fontSize} />
        </View>
      )
    case 'dateSignature':
      return (
        <View wrap={false} style={{ marginTop: 32.6, height: 40, position: 'relative' }}>
          <Text style={{ position: 'absolute', top: 0, left: 1, lineHeight: lh(11.4) }}>{b.date}</Text>
          <Text style={{ position: 'absolute', top: 14, left: 282.9, lineHeight: lh(11.4) }}>{b.byLabel}</Text>
          <View style={{ position: 'absolute', top: 24.4, left: 280.8, width: 198.5, borderBottomWidth: 0.97, borderColor: '#000' }} />
          <Text style={{ position: 'absolute', top: 26.5, left: 338.8, lineHeight: lh(11.4) }}>{b.signatoryLabel}</Text>
        </View>
      )
    case 'bar':
      return <Bar text={b.text} bold={b.bold} mt={b.gapBefore} />
    case 'row': {
      const [head, ...rest] = b.paragraphs.length ? b.paragraphs : [{ text: '', gapBefore: 0 }]
      return (
        <>
          {/* label + first paragraph stay together; later paragraphs flow on and carry no label */}
          <View wrap={false} style={{ flexDirection: 'row', marginTop: b.pitch }}>
            <View style={{ width: G.labelW }}>{b.labelLines.map((l, i) => <Text key={i} style={{ lineHeight: lh(b.pitch) }}>{l}</Text>)}</View>
            <Text style={{ width: G.valueW, lineHeight: lh(b.pitch), marginLeft: head.indent ?? 0 }}>{head.text}</Text>
          </View>
          {rest.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', marginTop: p.gapBefore }}>
              <View style={{ width: G.labelW }} />
              <Text style={{ width: G.valueW - (p.indent ?? 0), marginLeft: p.indent ?? 0, lineHeight: lh(b.pitch) }}>{p.text}</Text>
            </View>
          ))}
        </>
      )
    }
    case 'table':
      return <Table b={b} />
    case 'acceptance':
      return (
        <View wrap={false} style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 11, marginLeft: 390.2 }}>{b.label}</Text>
          <View style={{ marginLeft: 388.5, marginTop: 92.8 }}>
            <Svg width={114} height={3}><Line x1={0} y1={1.5} x2={114} y2={1.5} stroke="#000000" strokeWidth={0.97} strokeDasharray="3.4 3.2" /></Svg>
          </View>
          <Text style={{ fontSize: 11, marginLeft: 388.5, marginTop: 1 }}>{b.signatoryLabel}</Text>
        </View>
      )
    case 'coassureds':
      return (
        <View wrap={false} style={{ marginTop: 22 }}>
          <View style={{ flexDirection: 'row' }}>
            {b.columns.map((c, i) => <Text key={i} style={{ width: i === 0 ? 127.8 : i === 1 ? 127.5 : 200, fontSize: 10.1, fontWeight: 700, lineHeight: lh(14, 10.1) }}>{c}</Text>)}
          </View>
          {b.rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', marginTop: i ? 0 : 14.8 }}>
              <Text style={{ width: 127.8, fontSize: 10.1, lineHeight: lh(14, 10.1) }}>{r.vessel}</Text>
              <Text style={{ width: 127.5, fontSize: 10.1, lineHeight: lh(14, 10.1) }}>{r.cover}</Text>
              <View style={{ width: 250 }}>{r.lines.map((l, k) => <Text key={k} style={{ fontSize: 10.1, lineHeight: lh(14, 10.1) }}>{l}</Text>)}</View>
            </View>
          ))}
        </View>
      )
  }
}

export function EaglePdfDocument({ document, assetBase }: { document: EagleDocument; assetBase: string }) {
  return (
    <Document title="Eagle Ocean Marine P&I Quotation" author="PT Pandi Proteksi Marine Indonesia">
      <Page size="A4" style={S.page}>
        <PpmiPageChrome footer={document.footer} assetBase={assetBase} footerOffsetY={G.footerOffsetY} />
        {document.blocks.map((b, i) => <Block key={i} b={b} />)}
      </Page>
    </Document>
  )
}

export function createEaglePdfElement(document: EagleDocument, assetBase: string) {
  registerPpmiPdfFonts(assetBase)
  return <EaglePdfDocument document={document} assetBase={assetBase} /> as unknown as React.ReactElement<DocumentProps>
}