// FILE: components/quotation-templates/msig/MsigPdfDocument.tsx
// PDF renderer for the MSIG document model. Geometry (points) was measured
// from the supplied sample PDF. Loaded lazily via exportPdf.ts — never import
// this file from a server component or the main bundle.

import React from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { Document, Line, Page, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'
import type { MsigDocBlock, MsigDocument } from '@/lib/quotation-templates/msig/types'
import { PDF_FAMILY, PpmiPageChrome, registerPpmiPdfFonts } from '@/components/quotation-templates/shared/PpmiPdfChrome'

const FAMILY = PDF_FAMILY

// ─── Measured layout (pt) ───────────────────────────────────────
const G = {
  padTop: 140, padBottom: 92, padLeft: 57.1, padRight: 61.3,
  labelW: 154, subLabelW: 100.1, font: 10.1, line: 13.5,
  paraGap: 13.5,
  currencyW: 40, amountW: 70, remarkGap: 7.1,
}

const S = StyleSheet.create({
  page: { fontFamily: FAMILY, fontSize: G.font, lineHeight: G.line / G.font, paddingTop: G.padTop, paddingBottom: G.padBottom, paddingLeft: G.padLeft, paddingRight: G.padRight },
  row: { flexDirection: 'row' },
  label: { width: G.labelW, fontFamily: FAMILY, fontWeight: 700, fontStyle: 'italic' },
  value: { flex: 1 },
  bold: { fontWeight: 700 },
})

type Row = Extract<MsigDocBlock, { type: 'row' }>

function RowBlock({ b }: { b: Row }) {
  const [head, ...rest] = b.paragraphs.length ? b.paragraphs : [{ text: '' }]
  const mt = b.gapBefore
  if (b.fullWidth) {
    return (
      <View wrap={false} style={{ marginTop: mt, marginLeft: -2.1 }}>
        {[head, ...rest].map((p, i) => <Text key={i} style={[p.bold ? S.bold : {}, i ? { marginTop: G.paraGap } : {}]}>{p.text}</Text>)}
      </View>
    )
  }
  return (
    <>
      {/* label + first paragraph stay together; continuation paragraphs flow on and carry no label */}
      <View wrap={false} style={[S.row, { marginTop: mt }]}>
        <View style={[{ width: G.labelW }, b.labelAlign === 'middle' ? { justifyContent: 'center' } : {}]}>
          {b.label ? <Text style={S.label}>{b.label}</Text> : null}
        </View>
        <Text style={[S.value, head.bold ? S.bold : {}]}>{head.text}</Text>
      </View>
      {rest.map((p, i) => (
        <View key={i} style={[S.row, { marginTop: G.paraGap }]}>
          <View style={{ width: G.labelW }} />
          <Text style={[S.value, p.bold ? S.bold : {}]}>{p.text}</Text>
        </View>
      ))}
    </>
  )
}

function Block({ b }: { b: MsigDocBlock }) {
  switch (b.type) {
    case 'title':
      return (
        <View style={{ position: 'absolute', top: 147.2, left: 291.5 }}>
          <Text style={S.bold}>{b.text}</Text>
          <View style={{ height: 0.96, width: 59.06, backgroundColor: '#000000', marginTop: -1.2 }} />
        </View>
      )
    case 'lead':
      return <Text style={{ marginTop: 206 - 1 - G.padTop }}>{b.text}</Text>
    case 'row':
      return <RowBlock b={b} />
    case 'vessel':
      return (
        <View wrap={false} style={{ marginTop: b.gapBefore }}>
          {b.rows.map((r, i) => (
            <View key={i} style={[S.row, { minHeight: 14 /* sample spaces vessel rows 14.0 pt apart */ }]}>
              <View style={{ width: G.labelW }}>{i === 0 ? <Text style={S.label}>{b.label}</Text> : null}</View>
              <Text style={[S.label, { width: G.subLabelW }]}>{r.label}</Text>
              <Text style={S.value}>{r.value}</Text>
            </View>
          ))}
        </View>
      )
    case 'amount':
      return (
        <View wrap={false} style={[S.row, { marginTop: b.gapBefore }]}>
          <Text style={[S.label]}>{b.label}</Text>
          <Text style={{ width: G.currencyW }}>{b.currency}</Text>
          <Text style={{ width: G.amountW, textAlign: 'right' }}>{b.amount}</Text>
          <Text style={[S.value, { marginLeft: G.remarkGap }]}>{b.remark}</Text>
        </View>
      )
    case 'signature':
      return (
        <View wrap={false} style={{ marginTop: b.gapBefore }}>
          <View style={[S.row, { marginLeft: -2.1, justifyContent: 'space-between' }]}>
            <Text style={[S.bold, { fontStyle: 'italic' }]}>{b.placeDate}</Text>
            <Text>{b.eoe}</Text>
          </View>
          <View style={{ marginLeft: 357.8, marginTop: 17 }}>
            <Text style={{ fontSize: 11 }}>{b.acceptLabel}</Text>
          </View>
          {/* dashed signature rule, x 413–534 in the sample */}
          <View style={{ marginLeft: 355.95, marginTop: 79 }}>
            <Svg width={120.7} height={3}>
              <Line x1={0} y1={1.5} x2={120.7} y2={1.5} stroke="#000000" strokeWidth={1} strokeDasharray="2.9 0.95" />
            </Svg>
          </View>
          <View style={{ marginLeft: 357.8, marginTop: 3.5 }}>
            <Text style={{ fontSize: 11 }}>{b.signatoryLabel}</Text>
          </View>
        </View>
      )
  }
}

export function MsigPdfDocument({ document, assetBase }: { document: MsigDocument; assetBase: string }) {
  return (
    <Document title="MSIG P&I Quotation" author="PT Pandi Proteksi Marine Indonesia">
      <Page size="A4" style={S.page}>
        <PpmiPageChrome footer={document.footer} assetBase={assetBase} />
        {document.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
      </Page>
    </Document>
  )
}

/** Element typed as a react-pdf Document so it can be passed straight to pdf(). */
export function createMsigPdfElement(document: MsigDocument, assetBase: string) {
  registerPpmiPdfFonts(assetBase)
  return <MsigPdfDocument document={document} assetBase={assetBase} /> as unknown as React.ReactElement<DocumentProps>
}