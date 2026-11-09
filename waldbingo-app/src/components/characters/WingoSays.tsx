// Wingo + Sprechblase als fertiger Baustein.
// Bei jedem Textwechsel poppt die Blase neu ein und Wingo „spricht“ kurz
// (Mund bewegt sich). Die Blase bleibt dabei dasselbe DOM-Element, damit
// Screenreader die Änderung über aria-live zuverlässig vorlesen.
import { isValidElement, type ReactNode, useEffect, useRef, useState } from 'react'
import type { Jahreszeit, Wetter } from '../../data/types'
import { SpeechBubble } from '../ui'
import { Wingo, type WingoMood } from './Wingo'
import './characters.css'

interface Props {
  children: ReactNode
  mood?: WingoMood
  size?: number
  season?: Jahreszeit
  weather?: Wetter | null
  night?: boolean
  /**
   * Wingo links (Blase rechts) oder rechts (Blase links).
   * Erweiterung: 'top' = Blase über Wingo (zentriert, z. B. Startbildschirm).
   */
  side?: 'left' | 'right' | 'top'
  className?: string
  /** Erweiterung: Schlüssel für den Textwechsel, falls `children` kein reiner Text ist. */
  speakKey?: string | number
  /** Erweiterung: 'face' = kompakter Kopf-Ausschnitt statt ganzer Figur. */
  variant?: 'full' | 'face'
  /** Erweiterung: Animationen (Standard: an). */
  animated?: boolean
  /** Erweiterung: zusätzliche Klassen für die Sprechblase (z. B. Schriftgröße). */
  bubbleClassName?: string
}

/** Reiner Text eines ReactNode (für den Wechsel-Schlüssel). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Wingo spricht: Figur + Sprechblase nebeneinander (oder Blase darüber). */
export function WingoSays({
  children,
  mood = 'happy',
  size = 96,
  season,
  weather,
  night,
  side = 'left',
  className = '',
  speakKey,
  variant = 'full',
  animated = true,
  bubbleClassName = '',
}: Props) {
  const key = speakKey ?? textOf(children)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [talking, setTalking] = useState(false)
  const first = useRef(true)

  useEffect(() => {
    if (!animated || prefersReducedMotion()) return
    // Sprechdauer grob nach Textlänge (0,9–2,4 s).
    const ms = Math.min(2400, Math.max(900, String(key).length * 32))
    setTalking(true)
    const t = window.setTimeout(() => setTalking(false), ms)
    // Blase neu einpoppen lassen (beim ersten Erscheinen aus dem Nichts).
    const el = bubbleRef.current
    if (el && typeof el.animate === 'function') {
      el.animate(
        [
          { opacity: first.current ? 0 : 0.4, transform: 'scale(0.72)' },
          { opacity: 1, transform: 'scale(1.04)', offset: 0.6 },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' },
      )
    }
    first.current = false
    return () => window.clearTimeout(t)
  }, [key, animated])

  const wingo = (
    <Wingo
      mood={mood}
      size={size}
      season={season}
      weather={weather}
      night={night}
      title=""
      variant={variant}
      talking={talking}
      animated={animated}
    />
  )
  // Kopf-Ausschnitt sitzt in einer runden Plakette (saubere Kante statt hartem Quadrat).
  const fig =
    variant === 'face' ? (
      <span
        className="grid place-items-center overflow-hidden rounded-full border-2 border-moss-dark bg-gradient-to-b from-moss-light to-cream shadow-[0_3px_0_rgba(47,107,85,.35)]"
        style={{ width: size, height: size }}
      >
        {wingo}
      </span>
    ) : (
      wingo
    )

  const tail = side === 'left' ? 'left' : side === 'right' ? 'right' : 'bottom'
  const origin = side === 'left' ? '0% 60%' : side === 'right' ? '100% 60%' : '50% 100%'
  const bubble = (
    <div ref={bubbleRef} className={side === 'top' ? 'max-w-full' : 'min-w-0 flex-1'} style={{ transformOrigin: origin }}>
      <SpeechBubble tail={tail} className={bubbleClassName}>
        {children}
      </SpeechBubble>
    </div>
  )

  if (side === 'top') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {bubble}
        <div className="flex-none">{fig}</div>
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''} ${className}`}>
      <div className="flex-none">{fig}</div>
      {bubble}
    </div>
  )
}
