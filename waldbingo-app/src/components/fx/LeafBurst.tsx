// Blätter-Burst: kurzer Funken-Regen aus Blättern (≤ 1 s), wenn ein Feld
// gefunden wurde. Liegt absolut in einem `relative`-Container (der Kachel).
import type { CSSProperties } from 'react'
import type { Jahreszeit } from '../../data/types'
import './fx.css'
import { useReducedMotion } from './motion'
import { BitSvg, bitsFor, hash01 } from './particles'

interface Props {
  season?: Jahreszeit
  /** Anzahl der Blätter (Standard 12). */
  count?: number
  /** Flugweite in px (Standard 46). */
  spread?: number
  /** Unterschiedliche Muster je Auslösung (z. B. Feld-Index). */
  seed?: number
  /** Lichtring in der Mitte. */
  ring?: boolean
  className?: string
}

type BitStyle = CSSProperties & Record<'--dx' | '--dy' | '--rot' | '--dur' | '--delay', string>

export function LeafBurst({ season, count = 12, spread = 46, seed = 0, ring = true, className = '' }: Props) {
  const reduced = useReducedMotion()
  if (reduced) return null
  const bits = bitsFor(season)
  return (
    <span aria-hidden="true" className={`fx-burst ${className}`}>
      {ring && <span className="fx-burst-ring" />}
      {Array.from({ length: count }, (_, i) => {
        const r1 = hash01(seed * 31 + i)
        const r2 = hash01(seed * 17 + i * 7 + 3)
        const angle = (i / count) * Math.PI * 2 + (r1 - 0.5) * 0.7
        const dist = spread * (0.65 + r2 * 0.5)
        const bit = bits[i % bits.length]
        const size = bit.shape === 'sparkle' ? 10 + r1 * 6 : 13 + r2 * 7
        const style: BitStyle = {
          '--dx': `${Math.cos(angle) * dist}px`,
          // leichte Schwerkraft: Blätter sinken am Ende etwas ab
          '--dy': `${Math.sin(angle) * dist * 0.85 + 10}px`,
          '--rot': `${(r1 > 0.5 ? 1 : -1) * (140 + r2 * 200)}deg`,
          '--dur': `${0.7 + r2 * 0.3}s`,
          '--delay': `${r1 * 0.06}s`,
        }
        return (
          <span key={i} className="fx-burst-bit" style={style}>
            <BitSvg shape={bit.shape} color={bit.color} size={size} />
          </span>
        )
      })}
    </span>
  )
}
