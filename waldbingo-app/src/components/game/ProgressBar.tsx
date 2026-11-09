// Fortschritt als wachsende Ranke: Ein gepunkteter Waldpfad, auf dem mit
// jedem Fund ein Blatt sprießt. Am Ende wartet eine Knospe, die bei voller
// Karte aufblüht. Zähler links in Spiel-Schrift. Flitz (Sammel-Fortschritt,
// Figuren-Bibel) sitzt an der Spitze der Ranke und hüpft bei jedem Fund weiter.
import { useEffect, useRef, useState } from 'react'
import { Friend } from '../characters/Friends'
import { prefersReducedMotion } from '../fx'
import { SparkleIcon } from './icons'

interface Props {
  found: number
  total: number
  bingo: boolean
  /** Anzahl kompletter Bingo-Linien (optional, für den Hinweis). */
  lines?: number
  className?: string
}

const H = 38
const MID = H / 2

export function ProgressBar({ found, total, bingo, lines = 0, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(240)

  // Pfad an die echte Breite anpassen (Blätter sollen nicht verzerren).
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setW(Math.max(120, Math.round(el.clientWidth)))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const x0 = 8
  const x1 = w - 26
  const y = (x: number) => MID + 4.5 * Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 4)
  let d = `M${x0} ${y(x0).toFixed(1)}`
  for (let x = x0 + 4; x <= x1; x += 4) d += ` L${x} ${y(x).toFixed(1)}`
  d += ` L${x1} ${y(x1).toFixed(1)}`

  const p = total ? Math.min(1, found / total) : 0
  const full = total > 0 && found >= total
  // Flitz sitzt an der Spitze der Ranke (am Ziel kurz vor der Blüte).
  const tipX = Math.min(x0 + p * (x1 - x0), x1 - 10)
  const tipY = y(tipX)

  // Hüpfer nur bei einem neuen Fund (nicht beim ersten Anzeigen), per Web
  // Animations – Flitz bleibt eingehängt.
  const lastFound = useRef(found)
  const flitzRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = flitzRef.current
    const grew = found > lastFound.current
    lastFound.current = found
    if (!grew || !el || typeof el.animate !== 'function' || prefersReducedMotion()) return
    el.animate(
      [
        { transform: 'translateY(0) rotate(0)' },
        { transform: 'translateY(-10px) rotate(-8deg)', offset: 0.35 },
        { transform: 'translateY(-2px) rotate(4deg)', offset: 0.65 },
        { transform: 'translateY(0) rotate(0)' },
      ],
      { duration: 600, delay: 150, easing: 'cubic-bezier(.34,1.56,.64,1)' },
    )
  }, [found])
  const slots = Array.from({ length: total }, (_, i) => {
    const x = x0 + ((i + 0.5) / total) * (x1 - x0)
    const slope = (y(x + 1) - y(x - 1)) / 2
    const base = (Math.atan(slope) * 180) / Math.PI
    return { x, y: y(x), angle: base + (i % 2 ? 58 : -58) }
  })

  return (
    <div
      className={`flex items-center gap-2 rounded-full border-2 border-cream-line bg-cream py-1 pl-1 pr-2 shadow-[0_2px_0_rgba(110,68,38,.25)] ${className}`}
    >
      {/* Zähler */}
      <div
        className={`relative grid h-[42px] min-w-[60px] flex-none place-items-center rounded-full px-2.5 font-display leading-none ${
          bingo
            ? 'bg-gradient-to-b from-sun-light to-sun text-wood-lip shadow-[0_3px_0_#b8861a]'
            : 'bg-gradient-to-b from-forest-400 to-forest-600 text-white shadow-[0_3px_0_#1f5b38]'
        }`}
      >
        <span className="whitespace-nowrap">
          <b className="text-[21px] font-semibold">{found}</b>
          <span className="text-[13px] font-medium opacity-80">/{total}</span>
        </span>
        {bingo && (
          <span className="absolute -right-1 -top-1.5 text-berry" aria-hidden="true">
            <SparkleIcon size={16} />
          </span>
        )}
      </div>

      {/* Ranke */}
      <div
        ref={wrapRef}
        className="relative min-w-0 flex-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={found}
        aria-label={`${found} von ${total} gefunden${bingo ? ` – Bingo${lines > 1 ? ` (${lines} Reihen)` : ''}!` : ''}`}
      >
        <svg viewBox={`0 0 ${w} ${H}`} width="100%" height={H} aria-hidden="true" className="block overflow-visible">
          {/* Weg, der noch vor uns liegt (gepunktet) */}
          <path d={d} fill="none" stroke="#dcc49c" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="0.1 7" />
          {/* Gewachsene Ranke */}
          <path
            d={d}
            pathLength={1}
            fill="none"
            stroke="#3f9a70"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
            className="gb-vine"
          />
          {/* Blätter */}
          {slots.map((s, i) =>
            i < found ? (
              <g key={i} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.angle.toFixed(1)})`}>
                <path
                  className="gb-vine-leaf"
                  style={{ animationDelay: `${Math.min(i, 12) * 0.025}s` }}
                  d="M0 0C3 -5 9 -5.5 12.5 0 9 5.5 3 5 0 0Z"
                  fill={i % 3 === 1 ? '#5bb88a' : '#4fae7e'}
                  stroke="#2f7d63"
                  strokeWidth="1.1"
                />
              </g>
            ) : null,
          )}
          {/* Knospe → Blüte am Ziel */}
          <g transform={`translate(${w - 13} ${MID})`}>
            {full ? (
              <g className="gb-vine-leaf" style={{ transformOrigin: '50% 50%' }}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse
                    key={a}
                    cx="0"
                    cy="-6.5"
                    rx="4.6"
                    ry="6.4"
                    fill="#ffd34d"
                    stroke="#d9a21f"
                    strokeWidth="1.1"
                    transform={`rotate(${a})`}
                  />
                ))}
                <circle r="3.8" fill="#e8892f" stroke="#b25a1d" strokeWidth="1" />
              </g>
            ) : (
              <g>
                <path
                  d="M-6 3C-6 -4 -1 -9 0 -10 1 -9 6 -4 6 3 4 6 -4 6 -6 3Z"
                  fill="#ffc2cd"
                  stroke="#c2405a"
                  strokeWidth="1.2"
                />
                <path
                  d="M-6 3C-3 1 -1 2 0 5 1 2 3 1 6 3 4 7 -4 7 -6 3Z"
                  fill="#5fb87c"
                  stroke="#2f7d63"
                  strokeWidth="1.1"
                />
              </g>
            )}
          </g>
        </svg>
        <span
          aria-hidden="true"
          className="gb-flitz pointer-events-none absolute"
          style={{ left: tipX - 17, top: tipY - 30 }}
        >
          <span ref={flitzRef} className="block">
            <Friend id="flitz" size={34} mood={full ? 'happy' : 'idle'} title="" />
          </span>
        </span>
      </div>
    </div>
  )
}
