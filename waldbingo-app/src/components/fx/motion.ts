// Bewegungs-Präferenz: Bei „Bewegung reduzieren“ zeigen Effekte nur ihren
// ruhigen Endzustand (keine Partikel, keine Sprünge).
import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** Einmalige Abfrage (z. B. in Event-Handlern). */
export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches
  } catch {
    return false
  }
}

/** Reaktiver Hook – folgt Änderungen der Systemeinstellung. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(QUERY)
    const on = () => setReduced(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}
