import { useState } from 'react'
import { DIFF_LABEL } from '../../lib/labels'
import { Tile } from './Tile'

interface Props {
  diff: number
  players: number
  seed: string
  radiusKm: number
  onDiff: (d: number) => void
  onPlayers: (p: number) => void
  onSeed: (s: string) => void
  onRadius: (km: number) => void
}

const DIFF_HINT: Record<number, string> = {
  1: 'Piktogramme · generische Funde',
  2: 'Illustrationen · regionale Arten',
  3: 'Fotos · seltenere Arten',
}

export function OptionsTile({
  diff,
  players,
  seed,
  radiusKm,
  onDiff,
  onPlayers,
  onSeed,
  onRadius,
}: Props) {
  const [showSeed, setShowSeed] = useState(false)
  return (
    <Tile title="Optionen" glyph="dice">
      <div className="mb-1 text-[12px] font-semibold text-muted">Schwierigkeit</div>
      <div className="flex overflow-hidden rounded border border-line">
        {[1, 2, 3].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDiff(d)}
            className={`flex-1 px-2 py-2 text-[13.5px] font-bold transition ${
              diff === d ? 'bg-forest-600 text-white' : 'bg-white text-forest-700 hover:bg-forest-100'
            } ${d > 1 ? 'border-l border-line' : ''}`}
          >
            {DIFF_LABEL[d]}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11.5px] text-muted">{DIFF_HINT[diff]}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted">Spieler</span>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            aria-label="Weniger Spieler"
            onClick={() => onPlayers(Math.max(1, players - 1))}
            className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-[18px] leading-none text-forest-700 hover:bg-forest-100"
          >
            −
          </button>
          <span className="w-6 text-center text-[16px] font-bold text-forest-900">{players}</span>
          <button
            type="button"
            aria-label="Mehr Spieler"
            onClick={() => onPlayers(Math.min(10, players + 1))}
            className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-[18px] leading-none text-forest-700 hover:bg-forest-100"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
          <span>Suchradius</span>
          <span className="text-forest-700">{radiusKm} km</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={radiusKm}
          onChange={(e) => onRadius(Number(e.target.value))}
          aria-label="Suchradius in Kilometern"
          className="mt-1 w-full accent-forest-600"
        />
        <p className="mt-0.5 text-[11px] text-muted">
          Größe der Region für regionale Arten (wirkt bei Mittel/Schwer).
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowSeed((v) => !v)}
        className="mt-3 text-[12px] font-semibold text-forest-600 hover:underline"
      >
        {showSeed ? '▾ Seed ausblenden' : '▸ Seed (optional)'}
      </button>
      {showSeed && (
        <input
          type="text"
          value={seed}
          onChange={(e) => onSeed(e.target.value)}
          placeholder="z. B. wald42"
          className="focus-ring mt-2 w-full rounded border-[1.5px] border-line px-3 py-2 text-[15px]"
        />
      )}
    </Tile>
  )
}
