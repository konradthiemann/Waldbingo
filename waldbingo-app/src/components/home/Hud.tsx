import { useEffect, useRef, useState } from 'react'
import { useScrolled } from '../../hooks/useScrolled'
import { Wingo } from '../characters/Wingo'
import { IconButton } from '../ui'
import { CloudOffIcon, SoundOffIcon, SoundOnIcon } from './ShellIcons'

interface Props {
  /** Kleines Logo links zeigen (nicht auf dem Startbildschirm – dort ist das große Logo). */
  showLogo: boolean
  onHome: () => void
  online: boolean
  soundOn: boolean
  onToggleSound: () => void
}

/**
 * Schlanke HUD-Leiste über der Szene: Logo (→ Startbildschirm), Offline-Plakette,
 * Ton an/aus. Durchsichtig am Seitenanfang, beim Scrollen weiches Milchglas.
 */
export function Hud({ showLogo, onHome, online, soundOn, onToggleSound }: Props) {
  const scrolled = useScrolled()
  return (
    <header
      className={`wb-hud no-print sticky top-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? 'wb-glass shadow-[0_6px_20px_rgba(15,38,23,.14)] backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="mx-auto flex h-[60px] max-w-[1180px] items-center gap-2 px-3 sm:px-5">
        {showLogo && (
          <button
            type="button"
            onClick={onHome}
            aria-label="Zum Startbildschirm"
            className="wb-glass-strong focus-ring group flex h-11 items-center gap-1.5 rounded-full border border-white/70 py-1 pl-1 pr-3.5 shadow-wb2 backdrop-blur-md transition active:translate-y-px hover:bg-white/80"
          >
            <span className="grid h-9 w-9 flex-none place-items-end justify-center overflow-hidden rounded-full bg-gradient-to-b from-moss-light to-[#b6e6c4] ring-2 ring-white/80">
              <Wingo size={40} mood="happy" animated={false} title="" className="-mb-[5px]" />
            </span>
            <span className="font-display text-[17px] font-semibold leading-none tracking-[0.01em] text-forest-900">
              Wald<span className="text-wood-dark">bingo</span>
            </span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!online && <OfflineBadge />}
          {/* Umschalter: feste Beschriftung + aria-pressed (WAI-ARIA), der
              Tooltip sagt, was ein Tipp bewirkt. */}
          <IconButton
            tone="glass"
            label="Ton"
            title={soundOn ? 'Ton ausschalten' : 'Ton einschalten'}
            aria-pressed={soundOn}
            onClick={onToggleSound}
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon className="opacity-70" />}
          </IconButton>
        </div>
      </div>
    </header>
  )
}

/** Offline-Plakette – antippen zeigt kurz, was offline geht und was nicht. */
function OfflineBadge() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Außerhalb tippen oder Escape schließt die Erklärung.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring inline-flex h-11 items-center gap-1.5 rounded-full border border-sun-dark/40 bg-sun-light/90 px-3.5 font-display text-[14px] font-semibold text-wood-lip shadow-[0_3px_0_rgba(185,134,26,.45),0_6px_14px_rgba(15,38,23,.16)] backdrop-blur-md transition active:translate-y-px"
      >
        <CloudOffIcon size={18} />
        Offline
      </button>
      {open && (
        <div
          role="status"
          className="anim-pop-in absolute right-0 top-[calc(100%+10px)] z-40 w-[250px] rounded-[18px] border-2 border-cream-line bg-cream p-3 text-[13px] leading-snug text-ink shadow-panel"
        >
          <span
            aria-hidden="true"
            className="absolute -top-[8px] right-7 h-3.5 w-3.5 rotate-45 border-l-2 border-t-2 border-cream-line bg-cream"
          />
          <b className="font-display text-[14px] font-semibold text-forest-900">Kein Netz – kein Problem!</b>
          <p className="mt-1 text-muted">
            Karte &amp; neue Arten brauchen Netz – erstellte Spiele bleiben voll spielbar.
          </p>
        </div>
      )}
    </div>
  )
}
