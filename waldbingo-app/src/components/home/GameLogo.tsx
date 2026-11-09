import { useId } from 'react'

interface Props {
  className?: string
  /** Glitzer-Sternchen um das Logo (Startbildschirm). */
  sparkles?: boolean
}

// Hüpfende Buchstaben: Drehung (Grad) und Höhenversatz je Zeichen von „Waldbingo“.
const ROTATE = '-7 -2 4 -3 5 -4 3 -5 6'
// dy ist kumulativ (SVG): ergibt die Höhen 0, -4, 1, -3, 2, -2, 2, -3, 1.
const DY = '0 -4 5 -4 5 -4 4 -5 4'

/**
 * Spiel-Logo „Waldbingo“ als Inline-SVG (Fredoka, dicke Holz-Kontur, Lippe,
 * „Wald“ in Moos-Grün, „bingo“ in Sonnengelb, Blätter-Zweig auf dem W).
 * Skaliert mit der Breite des Containers.
 */
export function GameLogo({ className = '', sparkles = false }: Props) {
  const uid = useId().replace(/:/g, '')
  const gWald = `lg-wald-${uid}`
  const gBingo = `lg-bingo-${uid}`

  // Gemeinsame Text-Attribute aller Ebenen (gleiche Geometrie, andere Farbe).
  const textProps = {
    x: 190,
    y: 104,
    textAnchor: 'middle' as const,
    rotate: ROTATE,
    dy: DY,
    fontFamily: "'Fredoka Variable', Fredoka, system-ui, sans-serif",
    fontWeight: 700,
    fontSize: 76,
    letterSpacing: '-1',
  }

  return (
    <svg viewBox="0 0 380 150" className={`block w-full ${className}`} role="img" aria-label="Waldbingo">
      <defs>
        <linearGradient id={gWald} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.15" stopColor="#c4f0cf" />
          <stop offset="0.55" stopColor="#6fcb8c" />
          <stop offset="1" stopColor="#3f9d63" />
        </linearGradient>
        <linearGradient id={gBingo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.15" stopColor="#fff2bf" />
          <stop offset="0.55" stopColor="#ffd45e" />
          <stop offset="1" stopColor="#f0a92c" />
        </linearGradient>
      </defs>

      {/* Weicher Schatten auf der Szene */}
      <ellipse cx="190" cy="132" rx="150" ry="9" fill="rgba(15,38,23,.16)" />

      {/* Blätter-Zweig, der aus dem „W“ sprießt */}
      <g transform="translate(40 26) rotate(-18)">
        <path d="M0 22 C 2 12, 6 6, 12 0" fill="none" stroke="#6e4426" strokeWidth="7" strokeLinecap="round" />
        <path d="M0 22 C 2 12, 6 6, 12 0" fill="none" stroke="#a06d44" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M11 2 C 20 -10, 34 -8, 38 -4 C 32 6, 20 8, 11 2 Z" fill="#5fb87c" stroke="#1f5b38" strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M14 1 C 22 -3, 28 -4, 34 -4" fill="none" stroke="#c4f0cf" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
        <path d="M6 9 C -4 0, -14 2, -16 6 C -8 14, 2 14, 6 9 Z" fill="#8ed3a0" stroke="#1f5b38" strokeWidth="3.2" strokeLinejoin="round" />
      </g>

      {/* Ebene 1: Lippe (dunkles Holz, nach unten versetzt) */}
      <text {...textProps} transform="translate(0 7)" fill="#4f2f17" stroke="#4f2f17" strokeWidth="15" strokeLinejoin="round">
        Waldbingo
      </text>
      {/* Ebene 2: Kontur */}
      <text {...textProps} fill="#6e4426" stroke="#6e4426" strokeWidth="14" strokeLinejoin="round">
        Waldbingo
      </text>
      {/* Ebene 3: Innenkante (Creme-Saum für „Sticker“-Look) */}
      <text {...textProps} fill="#fff8ec" stroke="#fff8ec" strokeWidth="5" strokeLinejoin="round">
        Waldbingo
      </text>
      {/* Ebene 4: Füllung zweifarbig */}
      <text {...textProps}>
        <tspan fill={`url(#${gWald})`}>Wald</tspan>
        <tspan fill={`url(#${gBingo})`}>bingo</tspan>
      </text>

      {sparkles && (
        <g fill="#fff8ec" stroke="#f3c44d" strokeWidth="1.6" strokeLinejoin="round">
          <path className="wb-twinkle" d="M346 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
          <path className="wb-twinkle" style={{ animationDelay: '1.3s' }} d="M28 104 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z" />
          <path className="wb-twinkle" style={{ animationDelay: '2.4s' }} d="M362 96 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8z" />
        </g>
      )}
    </svg>
  )
}
