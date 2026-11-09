import { type CSSProperties, useState } from 'react'
import { playSfx } from '../../lib/sfx'
import { ChevronIcon } from '../home/ShellIcons'

interface Props {
  diff: number
  seed: string
  radiusKm: number
  onSeed: (s: string) => void
  onRadius: (km: number) => void
}

/** Dezente Zusatz-Optionen: Suchradius und Seed (eingeklappt). */
export function MoreOptions({ diff, seed, radiusKm, onSeed, onRadius }: Props) {
  const [open, setOpen] = useState(false)
  const pct = ((radiusKm - 5) / (100 - 5)) * 100
  return (
    <div className="mx-auto mt-4 max-w-[560px]">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            setOpen((v) => !v)
          }}
          aria-expanded={open}
          className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-4 font-display text-[14px] font-medium text-forest-900 shadow-wb2 backdrop-blur-md transition hover:bg-white/75"
        >
          Mehr Optionen
          <ChevronIcon open={open} />
        </button>
      </div>
      {open && (
        <div className="anim-pop-in mt-3 rounded-[24px] border-2 border-cream-line bg-cream p-4 shadow-panel">
          <label className="block">
            <span className="flex items-center justify-between text-[13px] font-bold text-forest-800">
              <span>Suchradius</span>
              <span className="font-display text-[15px] font-semibold text-forest-700">{radiusKm} km</span>
            </span>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={radiusKm}
              onChange={(e) => onRadius(Number(e.target.value))}
              aria-label="Suchradius in Kilometern"
              className="wb-range mt-2.5 w-full"
              style={{ '--p': `${pct}%` } as CSSProperties}
            />
            <span className="mt-1 block text-[12px] text-muted">
              Größe der Region für regionale Arten{diff === 1 ? ' – wirkt erst bei Mittel/Experte.' : '.'}
            </span>
          </label>

          <label className="mt-4 block">
            <span className="text-[13px] font-bold text-forest-800">Seed (optional)</span>
            <input
              type="text"
              value={seed}
              onChange={(e) => onSeed(e.target.value)}
              placeholder="z. B. wald42"
              className="focus-ring mt-1.5 w-full rounded-[14px] border-2 border-cream-line bg-white px-3 py-2.5 font-display text-[16px] text-forest-900 placeholder:text-muted/60"
            />
            <span className="mt-1 block text-[12px] text-muted">Gleicher Seed = gleiche Karten (zum Nachspielen).</span>
          </label>
        </div>
      )}
    </div>
  )
}
