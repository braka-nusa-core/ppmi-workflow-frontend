import type { Variants, Transition } from 'framer-motion'

// ─── Base Transitions ─────────────────────────────────────────────
export const ENTERPRISE_EASE = [0.2, 0, 0, 1] as const

export const transition = {
  fast:     { duration: 0.10, ease: ENTERPRISE_EASE } satisfies Transition,
  base:     { duration: 0.15, ease: ENTERPRISE_EASE } satisfies Transition,
  slow:     { duration: 0.25, ease: ENTERPRISE_EASE } satisfies Transition,
  spring:   { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
}

// ─── Page Transition ─────────────────────────────────────────────
// Used on page-level content mount
export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: ENTERPRISE_EASE },
  },
}

// ─── Fade In ─────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: ENTERPRISE_EASE } },
}

// ─── Fade Up (cards, list items) ─────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: ENTERPRISE_EASE } },
}

// ─── Stagger container (for lists of cards) ──────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren:   0.05,
    },
  },
}

// ─── Modal Backdrop ──────────────────────────────────────────────
export const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15, ease: ENTERPRISE_EASE } },
}

// ─── Modal Panel ─────────────────────────────────────────────────
export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: ENTERPRISE_EASE },
  },
}

// ─── Slide in from right (detail panel / drawer) ─────────────────
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: ENTERPRISE_EASE },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.15, ease: ENTERPRISE_EASE },
  },
}

// ─── Dropdown ────────────────────────────────────────────────────
export const dropdownVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.1, ease: ENTERPRISE_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: 0.08, ease: ENTERPRISE_EASE },
  },
}

// ─── Toast ───────────────────────────────────────────────────────
export const toastVariants: Variants = {
  hidden:  { opacity: 0, x: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.2, ease: ENTERPRISE_EASE },
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.97,
    transition: { duration: 0.15, ease: ENTERPRISE_EASE },
  },
}

// ─── Hover effects (use with whileHover prop) ─────────────────────
export const hoverLift = {
  y: -1,
  transition: { duration: 0.1, ease: ENTERPRISE_EASE },
}

export const hoverScale = {
  scale: 1.01,
  transition: { duration: 0.1, ease: ENTERPRISE_EASE },
}
