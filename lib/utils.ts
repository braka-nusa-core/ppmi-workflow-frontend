import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Class name merger (clsx + tailwind-merge) ───────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Type guard: is non-null ─────────────────────────────────────
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

// ─── Generate unique ID ──────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

// ─── Sleep ───────────────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Clamp ───────────────────────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
