import { useEffect, useState } from 'react'

/** true, sobald die Seite um mehr als `threshold` px gescrollt ist (z. B. HUD-Hintergrund). */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      setScrolled(window.scrollY > threshold)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [threshold])
  return scrolled
}
