import { useId, useState } from 'react'
import type { LegalPage } from '../legal/LegalView'

interface Props {
  onLegal: (page: LegalPage) => void
  className?: string
  /**
   * Kompakt (Startbildschirm): nur eine Zeile „Impressum · Datenschutz · Credits“,
   * die Credits klappen bei Bedarf auf. So bleibt unten Platz für die Szene.
   */
  compact?: boolean
}

const LINK =
  'focus-ring inline-flex min-h-[44px] items-center rounded-full px-2.5 font-semibold underline decoration-forest-900/35 underline-offset-2 hover:bg-white/50'

function Credits() {
  return (
    <>
      Symbole:{' '}
      <a
        className="font-semibold underline decoration-forest-900/35 underline-offset-2"
        href="https://openmoji.org"
        target="_blank"
        rel="noreferrer"
      >
        OpenMoji
      </a>{' '}
      (CC BY-SA 4.0) · Arten &amp; Fotos: iNaturalist · Karte: © OpenStreetMap · Wetter: Open-Meteo
    </>
  )
}

/** Fußzeile: Credits + Impressum/Datenschutz auf einer Milchglas-Pille. */
export function Footer({ onLegal, className = '', compact = false }: Props) {
  const [open, setOpen] = useState(false)
  const creditsId = useId()

  return (
    <footer className={`wb-footer no-print flex justify-center px-3 ${className}`}>
      <div
        className={`wb-glass max-w-[640px] text-balance border border-white/60 text-center text-[12px] leading-relaxed text-forest-900 shadow-wb2 backdrop-blur-md ${
          compact ? 'rounded-[22px] px-2 py-0' : 'rounded-[22px] px-4 py-1.5'
        }`}
      >
        {!compact && (
          <p className="pt-1">
            <Credits />
          </p>
        )}
        {compact && open && (
          <p id={creditsId} className="anim-fade px-2 pt-2">
            <Credits />
          </p>
        )}
        <p className="flex flex-wrap items-center justify-center gap-x-0.5">
          <button type="button" className={LINK} onClick={() => onLegal('impressum')}>
            Impressum
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className={LINK} onClick={() => onLegal('datenschutz')}>
            Datenschutz
          </button>
          {compact && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className={LINK}
                aria-expanded={open}
                aria-controls={open ? creditsId : undefined}
                onClick={() => setOpen((v) => !v)}
              >
                Credits
              </button>
            </>
          )}
        </p>
      </div>
    </footer>
  )
}
