// FILE: components/quotation-templates/shared/PpmiPdfChrome.tsx
// PPMI page chrome shared by all insurer papers (verified on the MSIG and
// Eagle samples): identical header artwork position, identical footer/ship
// artwork and text geometry. The only per-paper difference found is the
// vertical position of the footer block — Eagle's sits 16.9 pt higher — so it
// is a parameter, not a fork. Footer wording comes from each template.

import React from 'react'
import { Font, Image, Text, View } from '@react-pdf/renderer'
import type { PdfFooterColumn } from '@/lib/quotation-templates/shared/types'

export const PDF_FAMILY = 'LiberationSans' // SIL-OFL, metric-compatible with Arial (embedded in the PDF)

let registeredBase: string | null = null
/** Registers fonts once per asset base. Hyphenation is disabled so wording is never altered. */
export function registerPpmiPdfFonts(assetBase: string): void {
  if (registeredBase === assetBase) return
  Font.register({
    family: PDF_FAMILY,
    fonts: [
      { src: `${assetBase}/fonts/LiberationSans-Regular.ttf`, fontWeight: 400 },
      { src: `${assetBase}/fonts/LiberationSans-Bold.ttf`, fontWeight: 700 },
      { src: `${assetBase}/fonts/LiberationSans-BoldItalic.ttf`, fontWeight: 700, fontStyle: 'italic' },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
  registeredBase = assetBase
}

const COL_X = [37.2, 189.2, 364.5]

/** Fixed (every page) header artwork, ship artwork and footer columns. `footerOffsetY` shifts footer + ship (pt). */
export function PpmiPageChrome({ footer, assetBase, footerOffsetY = 0 }: { footer: PdfFooterColumn[]; assetBase: string; footerOffsetY?: number }) {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML <img> */}
      <Image fixed src={`${assetBase}/ppmi-header.png`} style={{ position: 'absolute', left: 39.1, top: 7.4, width: 185.8, height: 106.8 }} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML <img> */}
      <Image fixed src={`${assetBase}/ppmi-ship.png`} style={{ position: 'absolute', left: 507.8, top: 758.6 + footerOffsetY, width: 55.2, height: 71.1 }} />
      {footer.map((col, ci) => (
        <View fixed key={ci} style={{ position: 'absolute', left: COL_X[ci], top: 795.5 + footerOffsetY }}>
          <Text style={{ fontFamily: PDF_FAMILY, fontSize: 11, fontWeight: 700, color: '#A97B50', lineHeight: 1.1 }}>{col.heading}</Text>
          {col.lines.map((line, li) => (
            <View key={li} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: li === 0 ? 3 : 0 }}>
              {line.map((seg, si) => (
                <Text key={si} style={{ fontFamily: PDF_FAMILY, fontSize: seg.sup ? 4.6 : 7.9, color: '#231F20', lineHeight: seg.sup ? 1 : 10.3 / 7.9 }}>{seg.text}</Text>
              ))}
            </View>
          ))}
        </View>
      ))}
    </>
  )
}