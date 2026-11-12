// FILE: lib/quotation-templates/shared/previewSync.ts
// Pure geometry for editor → preview scroll synchronisation (no DOM access, so
// it is unit-testable). Returns the scrollTop that brings `target` into view
// inside `container`, or null when no scrolling is needed.

export interface RectLike { top: number; bottom: number; height: number }

/** Breathing room (px) kept between the target and the container edge. */
export const SYNC_MARGIN = 12

export function computeScrollTop(
  container: RectLike,
  target: RectLike,
  scrollTop: number,
  clientHeight: number,
  margin = SYNC_MARGIN,
): number | null {
  const fits = target.height <= clientHeight - margin * 2
  const visible = fits
    ? target.top >= container.top + margin && target.bottom <= container.bottom - margin
    // A section taller than the viewport counts as visible once its start is on screen.
    : target.top >= container.top && target.top <= container.top + clientHeight * 0.5
  if (visible) return null
  // Put the section's start ~15% down the viewport so the lines above it give context.
  const lead = Math.min(clientHeight * 0.15, 96)
  return Math.max(0, Math.round(scrollTop + (target.top - container.top) - lead))
}
