// Kleiner Media-Query-Hook (z. B. größere Figuren ab Tablet-Breite).
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const get = () => {
    try {
      return typeof window !== 'undefined' && !!window.matchMedia?.(query).matches
    } catch {
      return false
    }
  }
  const [match, setMatch] = useState(get)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [query])
  return match
}
