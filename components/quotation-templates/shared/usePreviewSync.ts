// FILE: components/quotation-templates/shared/usePreviewSync.ts
// Connects the editor to the document preview: when a field (or a protected
// wording block) in the editor gains focus or is clicked, the matching section
// of the preview scrolls into view — inside the PREVIEW's own scroll container,
// never the page.
//
// Contract between the two panes (plain data attributes, no shared state):
//   editor:   an element carrying  data-sync="<section key>"
//   preview:  an element carrying data-preview-section="<section key>"
// Design choices that keep it calm:
//   • it reacts to focusin / click only — never to typing, so no scroll per keystroke;
//   • a section that is already comfortably visible is not scrolled at all;
//   • the same section is not re-triggered within a short window (focusin + click pair);
//   • there is no scroll listener, so a manual scroll of the preview is never undone.
'use client'

import { useEffect, type RefObject } from 'react'
import { computeScrollTop } from '@/lib/quotation-templates/shared/previewSync'

const REPEAT_WINDOW_MS = 700
const FLASH_MS = 900

export function usePreviewSync(editorRef: RefObject<HTMLElement>, previewRef: RefObject<HTMLElement>, enabled: boolean): void {
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !enabled) return
    let lastKey = ''
    let lastAt = 0
    let flashTimer: ReturnType<typeof setTimeout> | undefined
    let flashed: HTMLElement | null = null

    const reveal = (event: Event) => {
      const origin = (event.target as HTMLElement | null)?.closest?.('[data-sync]') as HTMLElement | null
      const key = origin?.dataset.sync
      const container = previewRef.current
      if (!key || !container || container.clientHeight === 0) return // preview hidden (tabbed layout) or not mounted
      const now = Date.now()
      if (key === lastKey && now - lastAt < REPEAT_WINDOW_MS) return
      lastKey = key; lastAt = now

      const target = container.querySelector<HTMLElement>(`[data-preview-section="${key.replace(/"/g, '\\"')}"]`)
      if (!target) return
      const top = computeScrollTop(container.getBoundingClientRect(), target.getBoundingClientRect(), container.scrollTop, container.clientHeight)
      if (top === null) return
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      container.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })

      if (flashed) flashed.style.outline = ''
      clearTimeout(flashTimer)
      target.style.outline = '2px solid #c9a65a'
      target.style.outlineOffset = '2px'
      flashed = target
      flashTimer = setTimeout(() => { target.style.outline = ''; target.style.outlineOffset = '' }, FLASH_MS)
    }

    editor.addEventListener('focusin', reveal)
    editor.addEventListener('click', reveal)
    return () => {
      editor.removeEventListener('focusin', reveal)
      editor.removeEventListener('click', reveal)
      clearTimeout(flashTimer)
      if (flashed) flashed.style.outline = ''
    }
  }, [editorRef, previewRef, enabled])
}
