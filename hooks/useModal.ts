import { useState, useCallback } from 'react'

interface UseModalReturn<T = undefined> {
  isOpen:  boolean
  data:    T | null
  open:    (data?: T) => void
  close:   () => void
  toggle:  () => void
}

/**
 * Manage modal open/close state with optional payload data
 *
 * @example
 * // Simple modal
 * const modal = useModal()
 * <button onClick={() => modal.open()}>Open</button>
 * <MyModal open={modal.isOpen} onClose={modal.close} />
 *
 * @example
 * // Modal with data (edit modal)
 * const editModal = useModal<QSListItem>()
 * <button onClick={() => editModal.open(row)}>Edit</button>
 * <EditModal open={editModal.isOpen} data={editModal.data} onClose={editModal.close} />
 */
export function useModal<T = undefined>(): UseModalReturn<T> {
  const [isOpen, setOpen] = useState(false)
  const [data, setData]   = useState<T | null>(null)

  const open = useCallback((payload?: T) => {
    setData(payload ?? null)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    // Clear data after animation (150ms)
    setTimeout(() => setData(null), 200)
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return { isOpen, data, open, close, toggle }
}
