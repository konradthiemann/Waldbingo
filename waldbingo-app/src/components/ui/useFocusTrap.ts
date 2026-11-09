// Fokusfalle für Dialoge: Tab/Shift+Tab bleiben im Container, solange er der
// oberste offene Dialog ist. Mehrere Dialoge übereinander (z. B. Feier über dem
// Brett) teilen sich einen Stapel – nur der oberste fängt den Fokus.
import { type RefObject, useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'video[controls]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const stack: symbol[] = []

/** Fokussierbare, sichtbare Elemente im Container (in DOM-Reihenfolge). */
export function focusablesIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute('inert') && (el.offsetParent !== null || el.getClientRects().length > 0),
  )
}

/**
 * Hält den Tastatur-Fokus im Element `ref` (Standard: aktiv). Springt der Fokus
 * per Tab aus dem Dialog, landet er wieder am Anfang bzw. Ende.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active = true): void {
  useEffect(() => {
    if (!active) return
    const token = Symbol('trap')
    stack.push(token)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || stack[stack.length - 1] !== token) return
      const root = ref.current
      if (!root) return
      const items = focusablesIn(root)
      if (items.length === 0) {
        e.preventDefault()
        root.focus({ preventScroll: true })
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const cur = document.activeElement
      const inside = cur instanceof Node && root.contains(cur)
      if (e.shiftKey && (cur === first || cur === root || !inside)) {
        e.preventDefault()
        last.focus({ preventScroll: true })
      } else if (!e.shiftKey && (cur === last || !inside)) {
        e.preventDefault()
        first.focus({ preventScroll: true })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const i = stack.indexOf(token)
      if (i >= 0) stack.splice(i, 1)
    }
  }, [ref, active])
}
