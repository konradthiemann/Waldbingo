import { useState } from 'react'
import type { Habitat, Jahreszeit, Tageszeit, Wetter } from '../../data/types'
import {
  HABITAT_LABEL,
  HABITATS,
  SEASON_LABEL,
  SEASONS,
  TIME_LABEL,
  TIMES,
  WEATHER_LABEL,
  WEATHERS,
} from '../../lib/labels'

interface Props {
  season: Jahreszeit
  weather: Wetter | null
  time: Tageszeit
  habitat: Habitat
  onSeason: (v: Jahreszeit) => void
  onWeather: (v: Wetter) => void
  onTime: (v: Tageszeit) => void
  onHabitat: (v: Habitat) => void
}

function ChipRow<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: T[]
  labels: Record<T, string>
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`focus-ring rounded-full border-[1.5px] px-3.5 py-2 text-[14px] font-semibold transition ${
              value === o
                ? 'border-forest-600 bg-forest-600 text-white shadow-wb1'
                : 'border-line bg-white text-ink hover:-translate-y-px hover:border-forest-300'
            }`}
          >
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ManualChips(props: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-wb1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-[13.5px] font-bold text-forest-700"
      >
        <span>{open ? '▾' : '▸'}</span>
        Manuell anpassen (Jahreszeit, Wetter, Tageszeit, Habitat)
      </button>
      {open && (
        <div className="mt-3 border-t border-line pt-3">
          <ChipRow
            label="Jahreszeit"
            options={SEASONS}
            labels={SEASON_LABEL}
            value={props.season}
            onChange={props.onSeason}
          />
          <ChipRow
            label="Wetter"
            options={WEATHERS}
            labels={WEATHER_LABEL}
            value={props.weather}
            onChange={props.onWeather}
          />
          <ChipRow
            label="Tageszeit"
            options={TIMES}
            labels={TIME_LABEL}
            value={props.time}
            onChange={props.onTime}
          />
          <ChipRow
            label="Wo seid ihr? (Habitat)"
            options={HABITATS}
            labels={HABITAT_LABEL}
            value={props.habitat}
            onChange={props.onHabitat}
          />
        </div>
      )}
    </div>
  )
}
