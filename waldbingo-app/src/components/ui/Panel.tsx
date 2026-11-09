import type { ReactNode } from 'react'

export type PanelVariant = 'paper' | 'glass' | 'wood'

interface Props {
  children: ReactNode
  variant?: PanelVariant
  /** Holzschild-Beschriftung mittig auf der Oberkante (optional). */
  sign?: ReactNode
  className?: string
  /** Innenabstand abschalten (z. B. für randbündige Karten). */
  flush?: boolean
  as?: 'div' | 'section' | 'article'
}

const VARIANT: Record<PanelVariant, string> = {
  // Warmes Papier – Standard für Inhalte (immer gut lesbar, auch nachts).
  paper: 'bg-cream border-2 border-cream-line shadow-panel text-ink',
  // Milchglas – für HUD-Elemente direkt auf der Szene.
  glass: 'wb-glass-strong border border-white/70 shadow-wb2 backdrop-blur-md text-ink',
  // Holzrahmen – z. B. für das Spielbrett.
  wood:
    'bg-gradient-to-b from-wood-dark to-wood-lip border-2 border-wood-lip shadow-[0_6px_0_#4f2f17,0_14px_30px_rgba(15,38,23,.3)] text-white',
}

/** Grundfläche für Inhalte über der Wald-Szene. */
export function Panel({ children, variant = 'paper', sign, className = '', flush, as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`relative rounded-2xl ${VARIANT[variant]} ${flush ? '' : 'p-4 sm:p-5'} ${
        sign ? 'mt-5 pt-7 sm:pt-8' : ''
      } ${className}`}
    >
      {sign && <WoodSign className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">{sign}</WoodSign>}
      {children}
    </Tag>
  )
}

/** Kleines Holzschild (Überschrift-Plakette). */
export function WoodSign({ children, className = '' }: { children: ReactNode; className?: string }) {
  // Positioniert für das Glanzlicht – außer der Aufrufer setzt selbst eine Position.
  const pos = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? '' : 'relative'
  return (
    <div
      className={`${pos} whitespace-nowrap rounded-[14px] border-2 border-wood-lip bg-gradient-to-b from-wood-dark to-wood-lip px-4 py-1.5 font-display text-[15px] font-semibold text-white shadow-[0_3px_0_#4f2f17,0_6px_12px_rgba(15,38,23,.25)] [text-shadow:0_1.5px_0_rgba(50,28,12,.55)] ${className}`}
    >
      {/* Helle Holzkante oben (ein Glanzlicht, hinter der Schrift) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-[2px] h-[3px] rounded-full bg-wood-light/45"
      />
      <span className="relative">{children}</span>
    </div>
  )
}
