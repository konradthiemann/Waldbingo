import type { ReactNode } from 'react'
import { playSfx } from '../../lib/sfx'

export interface Choice<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface Props<T extends string> {
  /** Barrierefreie Gruppenbeschriftung. */
  label: string
  options: Choice<T>[]
  value: T | null
  onChange: (v: T) => void
  /** Spalten auf dem Handy (ab sm automatisch mehr). */
  cols?: 3 | 4 | 5
}

const COLS: Record<3 | 4 | 5, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

/**
 * Auswahl-Raster mit illustrierten Kacheln (Jahreszeit, Wetter, Tageszeit …).
 * Gewählte Kachel: Moos-Rahmen, leicht angehoben.
 */
export function ChoiceGrid<T extends string>({ label, options, value, onChange, cols = 4 }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${COLS[cols]}`}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              playSfx('tap')
              onChange(o.value)
            }}
            className={`focus-ring flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-[18px] border-2 px-1 py-2 transition-[transform,box-shadow,background-color] duration-150 ease-soft active:translate-y-px ${
              active
                ? '-translate-y-0.5 border-forest-500 bg-forest-100 shadow-[0_3px_0_#3f9d63,0_8px_14px_rgba(15,38,23,.14)]'
                : 'border-cream-line bg-white shadow-[0_3px_0_#ead8b8] hover:-translate-y-px'
            }`}
          >
            {o.icon && <span className="flex-none">{o.icon}</span>}
            <span
              className={`max-w-full text-center font-display text-[12.5px] font-medium leading-[1.1] [overflow-wrap:anywhere] ${
                active ? 'text-forest-800' : 'text-ink'
              }`}
            >
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Kleine Pillen-Auswahl (Text), z. B. Lebensraum. */
export function ChipChoice<T extends string>({
  label,
  options,
  value,
  onChange,
}: Omit<Props<T>, 'cols'>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              playSfx('tap')
              onChange(o.value)
            }}
            className={`focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 px-3.5 font-display text-[14px] font-medium transition active:translate-y-px ${
              active
                ? 'border-forest-500 bg-forest-500 text-white shadow-[0_3px_0_#1f5b38]'
                : 'border-cream-line bg-white text-ink shadow-[0_3px_0_#ead8b8] hover:-translate-y-px'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
