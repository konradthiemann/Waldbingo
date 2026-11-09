// Partikel-Formen für Effekte (Blätter, Blütenblätter, Glitzer, Flocken).
// Farben folgen der Jahreszeit, damit Effekte zur Szene passen.
import type { Jahreszeit } from '../../data/types'

export type BitShape = 'leaf' | 'petal' | 'sparkle' | 'flake' | 'needle'

export interface Bit {
  shape: BitShape
  color: string
}

/** Partikel-Mischung je Jahreszeit (Reihenfolge = Häufigkeit im Zyklus). */
const SEASON_BITS: Record<Jahreszeit, Bit[]> = {
  fruehling: [
    { shape: 'leaf', color: '#8fd16a' },
    { shape: 'petal', color: '#ffb7cf' },
    { shape: 'leaf', color: '#6cc46a' },
    { shape: 'petal', color: '#ffd6e4' },
    { shape: 'sparkle', color: '#ffe066' },
  ],
  sommer: [
    { shape: 'leaf', color: '#3f9d50' },
    { shape: 'leaf', color: '#6cc46a' },
    { shape: 'sparkle', color: '#ffe08a' },
    { shape: 'leaf', color: '#8ed3a0' },
    { shape: 'petal', color: '#ff8fa3' },
  ],
  herbst: [
    { shape: 'leaf', color: '#e8892f' },
    { shape: 'leaf', color: '#c9482f' },
    { shape: 'leaf', color: '#f2c14e' },
    { shape: 'sparkle', color: '#ffe08a' },
    { shape: 'leaf', color: '#b8642a' },
  ],
  winter: [
    { shape: 'flake', color: '#ffffff' },
    { shape: 'needle', color: '#2f7a4a' },
    { shape: 'flake', color: '#d4eefc' },
    { shape: 'sparkle', color: '#ffffff' },
    { shape: 'leaf', color: '#5bb88a' },
  ],
}

export function bitsFor(season: Jahreszeit | undefined): Bit[] {
  return SEASON_BITS[season ?? 'sommer']
}

/** Kleines Inline-SVG einer Partikel-Form (viewBox 20 × 20, dekorativ). */
export function BitSvg({ shape, color, size }: Bit & { size: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" className="block overflow-visible">
      {shape === 'leaf' && (
        <>
          <path d="M10 1.2C16.4 4.2 17.6 11 10 18.8 2.4 11 3.6 4.2 10 1.2Z" fill={color} />
          <path d="M10 4.5V17" stroke="rgba(0,0,0,.18)" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M7 6.5C8 5.5 9 5 10 4.8"
            stroke="rgba(255,255,255,.45)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {shape === 'petal' && (
        <path
          d="M10 2.5C14.5 2.5 17 7 15 11.5 13.5 15 11 17.5 10 18 9 17.5 6.5 15 5 11.5 3 7 5.5 2.5 10 2.5Z"
          fill={color}
        />
      )}
      {shape === 'sparkle' && <path d="M10 1.5 12 8 18.5 10 12 12 10 18.5 8 12 1.5 10 8 8Z" fill={color} />}
      {shape === 'flake' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M10 2v16M3 6l14 8M17 6 3 14" />
          <path d="M8 3.5l2 2 2-2M8 16.5l2-2 2 2" fill="none" strokeWidth="1.5" />
        </g>
      )}
      {shape === 'needle' && (
        <g stroke={color} strokeWidth="2.2" strokeLinecap="round">
          <path d="M10 3v14" />
          <path d="M10 7 6 4.5M10 7l4-2.5M10 11 6 8.5M10 11l4-2.5M10 15l-3.5-2.5M10 15l3.5-2.5" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  )
}

/** Deterministischer Pseudo-Zufall (gleiche Effekte bei jedem Render). */
export function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
