// Feier-Overlay für Bingo und volle Karte: Blätter-Konfetti, Wingo jubelt,
// großes Holzschild („BINGO!“ bzw. „Waldmeister!“). Der Burst dauert ≤ 2,5 s,
// danach bleibt eine ruhige Szene, bis das Kind weiterspielt.
// Volle Karte = größter Erfolg: alle Waldfreunde hüpfen dazu, Eichel-Krone und
// Medaille am Schild, mehr Konfetti und Glitzer.
import { type CSSProperties, useEffect, useId, useRef, useState } from 'react'
import type { Jahreszeit, Wetter } from '../../data/types'
import { Friend, FRIEND_ORDER } from '../characters/Friends'
import { Wingo } from '../characters/Wingo'
import { Badge, GameButton, SpeechBubble, useFocusTrap } from '../ui'
import './fx.css'
import { LeafBurst } from './LeafBurst'
import { useReducedMotion } from './motion'
import { Portal } from './Portal'
import { BitSvg, bitsFor, hash01 } from './particles'

export type CelebrationKind = 'bingo' | 'full'

interface Props {
  kind: CelebrationKind
  /** Wingos Spruch (z. B. aus wingoLine('bingo')). */
  line: string
  season?: Jahreszeit
  weather?: Wetter | null
  night?: boolean
  /** Gefundene Felder (für die kleine Bilanz). */
  found?: number
  /** Anzahl kompletter Bingo-Linien. */
  lines?: number
  onClose: () => void
}

export function Celebration({ kind, line, season, weather, night, found, lines, onClose }: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const reduced = useReducedMotion()

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    actionsRef.current?.querySelector('button')?.focus({ preventScroll: true })
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', h)
    return () => {
      document.removeEventListener('keydown', h)
      prev?.focus?.({ preventScroll: true })
    }
  }, [])

  const full = kind === 'full'
  return (
    <Portal>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fx-party-backdrop anim-fade fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto overflow-x-hidden p-4 outline-none backdrop-blur-[3px]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Goldenes Glühen + Sonnenstrahlen hinter Wingo */}
        <span aria-hidden="true" className="fx-party-glow pointer-events-none absolute left-1/2 top-[44%]" />
        <Rays />

        {!reduced && <Confetti season={season} count={full ? 56 : 32} />}
        {!reduced && full && <Glitter />}

        <div className="pointer-events-none relative my-auto flex w-full max-w-[400px] flex-col items-center">
          <BigSign id={titleId} small={full} crown={full}>
            {full ? 'Waldmeister!' : 'BINGO!'}
          </BigSign>

          <div className={`fx-hop relative -mb-1 ${full ? 'mt-1' : 'mt-3'}`}>
            <span className="absolute left-1/2 top-[46%]">
              <LeafBurst season={season} count={full ? 22 : 16} spread={full ? 140 : 120} seed={full ? 7 : 3} ring={false} />
            </span>
            <Wingo
              mood="cheer"
              size={full ? 176 : 184}
              season={season}
              weather={weather}
              night={night}
              title={full ? 'Wingo jubelt: alles gefunden!' : 'Wingo jubelt über dein Bingo!'}
            />
          </div>

          {/* Volle Karte: alle Waldfreunde feiern mit (versetzt hineinhüpfend) */}
          {full && (
            <div className="relative z-[1] -mt-7 mb-1 flex items-end justify-center gap-0.5" aria-hidden="true">
              {FRIEND_ORDER.map((id, i) => (
                <span
                  key={id}
                  className="fx-friend-in block"
                  style={{ animationDelay: `${0.55 + (i % 2 ? 0.1 : 0) + Math.abs(i - 2) * 0.12}s` }}
                >
                  <Friend id={id} size={i === 2 ? 64 : 58} mood="happy" title="" />
                </span>
              ))}
            </div>
          )}

          <div ref={actionsRef} className="fx-rise-late pointer-events-auto flex w-full flex-col items-center">
            <SpeechBubble tail="top" className="max-w-[330px] text-center !text-[17px]">
              {line}
            </SpeechBubble>

            {(found != null || (lines != null && lines > 0)) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {found != null && <Badge tone="cream">{found} von 25 gefunden</Badge>}
                {lines != null && lines > 0 && (
                  <Badge tone="sun">
                    {lines} {lines === 1 ? 'Bingo-Reihe' : 'Bingo-Reihen'}
                  </Badge>
                )}
              </div>
            )}

            <GameButton variant="accent" size="lg" className="mt-5 min-w-[220px]" onClick={onClose}>
              {full ? 'Juhu, geschafft!' : 'Weiter suchen!'}
            </GameButton>
          </div>
        </div>
      </div>
    </Portal>
  )
}

/** Großes, hängendes Holzschild mit Maserung, Nägeln und Blättchen. */
export function BigSign({
  children,
  id,
  small,
  crown,
}: {
  children: string
  id?: string
  small?: boolean
  /** Volle Karte: Eichel-Krone oben und Medaille unten am Schild. */
  crown?: boolean
}) {
  return (
    <div className={`fx-sign-drop relative ${crown ? 'mt-14' : 'mt-10'}`}>
      {crown && <AcornCrown />}
      {crown && <Medal />}
      {/* Seile */}
      <span
        aria-hidden="true"
        className="absolute -top-10 left-[22%] h-12 w-[4px] -rotate-6 rounded-full bg-[#7a5232]"
      />
      <span
        aria-hidden="true"
        className="absolute -top-10 right-[22%] h-12 w-[4px] rotate-6 rounded-full bg-[#7a5232]"
      />
      <div className="fx-plank relative rounded-[24px] border-[3px] border-wood-dark px-8 pb-3 pt-2.5 shadow-[0_7px_0_#6e4426,0_18px_36px_rgba(0,0,0,.35)]">
        {/* Nägel */}
        <span
          aria-hidden="true"
          className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#6e4426] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#6e4426] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
        />
        {/* Blättchen an der Ecke */}
        <span aria-hidden="true" className="absolute -left-4 -top-5 rotate-[-30deg]">
          <BitSvg shape="leaf" color="#5bb88a" size={30} />
        </span>
        <span aria-hidden="true" className="absolute -left-1 -top-6 rotate-[20deg]">
          <BitSvg shape="leaf" color="#3f9a70" size={22} />
        </span>
        <h2
          id={id}
          className={`whitespace-nowrap font-display font-bold leading-none tracking-wide text-white [text-shadow:0_3px_0_#6e4426,0_0_1px_#6e4426,0_0_3px_#6e4426] ${
            small ? 'text-[40px] sm:text-[50px]' : 'text-[50px] sm:text-[58px]'
          }`}
        >
          {children}
        </h2>
      </div>
    </div>
  )
}

/** Krone aus drei Eicheln auf goldenem Reif (über dem Schild). */
function AcornCrown() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 64"
      width="112"
      height="60"
      className="fx-crown absolute -top-[58px] left-1/2 z-[1] -translate-x-1/2 overflow-visible"
    >
      <path d="M14 56 8 20l26 18 26-30 26 30 26-18-6 36Z" fill="#f3c44d" stroke="#b8861a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M17 48h86" stroke="#ffe9a8" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M14 56h92" stroke="#b8861a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="44" r="6" fill="#e85d75" stroke="#b8861a" strokeWidth="3" />
      <circle cx="34" cy="47" r="4" fill="#5bb88a" stroke="#b8861a" strokeWidth="2.5" />
      <circle cx="86" cy="47" r="4" fill="#5bb88a" stroke="#b8861a" strokeWidth="2.5" />
      {[
        [8, 18],
        [60, 6],
        [112, 18],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="2" rx="7" ry="8.5" fill="#c48d58" stroke="#6e4426" strokeWidth="2.6" />
          <path d="M-8 -3.5C-8 -9 8 -9 8 -3.5Z" fill="#8a5a33" stroke="#6e4426" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M0 -8.5v-3" stroke="#6e4426" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M-3 0c0-2 1-3 2.5-3.5" stroke="#ffe9a8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      ))}
    </svg>
  )
}

/** Medaille mit Band (unten rechts am Schild). */
function Medal() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 64" width="44" height="58" className="fx-medal absolute -bottom-9 -right-3 z-[1]">
      <path d="M14 2h8l6 22h-8Z" fill="#e85d75" stroke="#a8344c" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M34 2h-8l-6 22h8Z" fill="#5bb88a" stroke="#2f7d63" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="24" cy="40" r="17" fill="#f3c44d" stroke="#b8861a" strokeWidth="3.5" />
      <circle cx="24" cy="40" r="11" fill="none" stroke="#ffe9a8" strokeWidth="2" />
      <path d="M24 31.5 26.6 37l6 .7-4.5 4 1.3 5.9L24 44.7l-5.4 2.9 1.3-5.9-4.5-4 6-.7Z" fill="#fff4c9" stroke="#b8861a" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/** Glitzer-Sternchen, die kurz aufblitzen (nur volle Karte, ≤ 2,5 s). */
function Glitter() {
  return (
    <div aria-hidden="true" className="fx-confetti">
      {Array.from({ length: 18 }, (_, i) => {
        const r1 = hash01(i * 7 + 5)
        const r2 = hash01(i * 13 + 2)
        return (
          <span
            key={i}
            className="fx-glitter absolute"
            style={{ left: `${6 + r1 * 88}%`, top: `${8 + r2 * 74}%`, animationDelay: `${0.3 + r2 * 1.4}s` }}
          >
            <BitSvg shape="sparkle" color={i % 3 ? '#fff4c9' : '#ffd34d'} size={12 + r1 * 14} />
          </span>
        )
      })}
    </div>
  )
}

/** Langsam drehende, weiche Lichtstrahlen. */
function Rays() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[42%] h-[min(150vw,900px)] w-[min(150vw,900px)] -translate-x-1/2 -translate-y-1/2"
    >
      <svg viewBox="-100 -100 200 200" className="fx-rays block h-full w-full">
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d="M0 0 L-9 -100 L9 -100 Z"
            fill="#ffe08a"
            opacity={i % 2 ? 0.06 : 0.13}
            transform={`rotate(${(i * 360) / 14})`}
          />
        ))}
      </svg>
    </div>
  )
}

type FallStyle = CSSProperties & Record<'--dur' | '--delay' | '--sway', string>

/** Blätter-Konfetti, das von oben herabtrudelt (≤ 2,5 s), danach ausgehängt. */
function Confetti({ season, count }: { season?: Jahreszeit; count: number }) {
  const bits = bitsFor(season)
  // Längstes Teilchen: Verzögerung ≤ 0,35 s + Dauer ≤ 2,3 s → nach 2,7 s ist alles unten.
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 2700)
    return () => window.clearTimeout(t)
  }, [])
  if (done) return null
  return (
    <div aria-hidden="true" className="fx-confetti">
      {Array.from({ length: count }, (_, i) => {
        const r1 = hash01(i + 1)
        const r2 = hash01(i * 3 + 11)
        const bit = bits[i % bits.length]
        const style: FallStyle = {
          left: `${(i / count) * 100 + (r1 - 0.5) * 6}%`,
          '--dur': `${1.7 + r2 * 0.6}s`,
          '--delay': `${r1 * 0.35}s`,
          '--sway': `${0.8 + r2 * 0.6}s`,
        }
        return (
          <span key={i} className="fx-fall" style={style}>
            <span className="fx-sway block">
              <BitSvg shape={bit.shape} color={bit.color} size={14 + r2 * 12} />
            </span>
          </span>
        )
      })}
    </div>
  )
}
