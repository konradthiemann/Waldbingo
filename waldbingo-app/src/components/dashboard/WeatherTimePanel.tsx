import { type ReactNode, useState } from 'react'
import type { Jahreszeit, Tageszeit, Wetter } from '../../data/types'
import { SEASON_LABEL, SEASONS, TIME_LABEL, TIMES, WEATHER_LABEL, WEATHERS } from '../../lib/labels'
import { playSfx } from '../../lib/sfx'
import type { CurrentWeather } from '../../lib/weather'
import { ChevronIcon } from '../home/ShellIcons'
import { Panel } from '../ui'
import { ChoiceGrid } from './ChoiceGrid'
import { SeasonIcon, TimeIcon, WeatherIcon } from './SceneIcons'

/** Woher stammt der aktuelle Wert? (Beschriftung unter der Kachel) */
export type ValueSource = 'auto' | 'live' | 'saved' | 'manual' | 'none'

interface Props {
  season: Jahreszeit
  weather: Wetter | null
  time: Tageszeit
  seasonSource: ValueSource
  weatherSource: ValueSource
  timeSource: ValueSource
  weatherData: CurrentWeather | null
  loadingWeather: boolean
  onSeason: (v: Jahreszeit) => void
  onWeather: (v: Wetter) => void
  onTime: (v: Tageszeit) => void
}

type Open = 'season' | 'weather' | 'time' | null

function relativeTime(ms: number): string {
  const min = Math.round((Date.now() - ms) / 60000)
  if (min < 1) return 'gerade eben'
  if (min === 1) return 'vor 1 Min.'
  if (min < 60) return `vor ${min} Min.`
  const h = Math.round(min / 60)
  if (h < 24) return h === 1 ? 'vor 1 Std.' : `vor ${h} Std.`
  const d = Math.round(h / 24)
  return d === 1 ? 'vor 1 Tag' : `vor ${d} Tagen`
}

const SOURCE_LABEL: Record<ValueSource, string> = {
  auto: 'automatisch',
  live: 'live',
  saved: 'zuletzt',
  manual: 'gewählt',
  none: 'antippen',
}

/**
 * „Wetter & Zeit“ – drei illustrierte Kacheln (Jahreszeit, Wetter, Tageszeit).
 * Antippen klappt die jeweilige Auswahl auf (manuelle Anpassung).
 */
export function WeatherTimePanel(p: Props) {
  const [open, setOpen] = useState<Open>(null)

  const toggle = (k: Exclude<Open, null>) => {
    playSfx('tap')
    setOpen((o) => (o === k ? null : k))
  }

  return (
    <Panel as="section" sign="Wetter & Zeit">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <SummaryTile
          title="Jahreszeit"
          label={SEASON_LABEL[p.season]}
          source={SOURCE_LABEL[p.seasonSource]}
          icon={<SeasonIcon season={p.season} size={50} />}
          active={open === 'season'}
          onClick={() => toggle('season')}
        />
        <SummaryTile
          title="Wetter"
          label={p.loadingWeather ? 'lädt…' : p.weather ? WEATHER_LABEL[p.weather] : 'Unbekannt'}
          source={SOURCE_LABEL[p.weatherSource]}
          icon={<WeatherIcon weather={p.weather} size={50} />}
          active={open === 'weather'}
          onClick={() => toggle('weather')}
          badge={p.weatherData && p.weatherSource !== 'manual' ? `${Math.round(p.weatherData.temperature)}°` : undefined}
        />
        <SummaryTile
          title="Tageszeit"
          label={TIME_LABEL[p.time]}
          source={SOURCE_LABEL[p.timeSource]}
          icon={<TimeIcon time={p.time} size={50} />}
          active={open === 'time'}
          onClick={() => toggle('time')}
        />
      </div>

      {open && (
        <div className="anim-fade mt-3 rounded-[20px] border-2 border-cream-line bg-cream-2/70 p-2.5 sm:p-3">
          {open === 'season' && (
            <ChoiceGrid
              label="Jahreszeit wählen"
              cols={4}
              options={SEASONS.map((s) => ({ value: s, label: SEASON_LABEL[s], icon: <SeasonIcon season={s} size={34} /> }))}
              value={p.season}
              onChange={p.onSeason}
            />
          )}
          {open === 'weather' && (
            <ChoiceGrid
              label="Wetter wählen"
              cols={4}
              options={WEATHERS.map((w) => ({ value: w, label: WEATHER_LABEL[w], icon: <WeatherIcon weather={w} size={34} /> }))}
              value={p.weather}
              onChange={p.onWeather}
            />
          )}
          {open === 'time' && (
            <ChoiceGrid
              label="Tageszeit wählen"
              cols={5}
              options={TIMES.map((t) => ({ value: t, label: TIME_LABEL[t], icon: <TimeIcon time={t} size={34} /> }))}
              value={p.time}
              onChange={p.onTime}
            />
          )}
        </div>
      )}

      {/* Live-Wetter-Details bzw. Hinweis */}
      <p className="mt-3 text-center text-[12.5px] leading-snug text-muted">
        {p.weatherData && p.weatherSource !== 'manual' ? (
          <>
            {Math.round(p.weatherData.temperature)} °C · {p.weatherData.label} · Regen {p.weatherData.precipitation} mm · Wind{' '}
            {Math.round(p.weatherData.windSpeed)} km/h · {relativeTime(p.weatherData.fetchedAt)}
          </>
        ) : p.weatherSource === 'manual' ? (
          'Selbst gewählt – Wingo zieht sich passend an.'
        ) : (
          'Ort wählen für Live-Wetter – oder eine Kachel antippen und selbst festlegen.'
        )}
      </p>
    </Panel>
  )
}

function SummaryTile({
  title,
  label,
  source,
  icon,
  active,
  onClick,
  badge,
}: {
  title: string
  label: string
  source: string
  icon: ReactNode
  active: boolean
  onClick: () => void
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-label={`${title}: ${label} – ändern`}
      className={`focus-ring relative flex flex-col items-center rounded-[22px] border-2 px-1 pb-2 pt-2.5 transition-[transform,box-shadow] duration-150 ease-soft active:translate-y-px ${
        active
          ? 'border-forest-500 bg-forest-100 shadow-[0_3px_0_#3f9d63,0_8px_16px_rgba(15,38,23,.14)]'
          : 'border-cream-line bg-white shadow-[0_4px_0_#ead8b8,0_8px_14px_rgba(15,38,23,.08)] hover:-translate-y-px'
      }`}
    >
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted">{title}</span>
      <span className="relative my-1">
        {icon}
        {badge && (
          <span className="absolute -right-3 -top-1 rounded-full border-2 border-white bg-berry px-1.5 font-display text-[12px] font-semibold leading-[18px] text-white shadow-[0_2px_0_#a8344c]">
            {badge}
          </span>
        )}
      </span>
      <span className="max-w-full truncate px-1 font-display text-[15px] font-semibold leading-tight text-forest-900">
        {label}
      </span>
      <span className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-forest-600">
        {source}
        <ChevronIcon size={12} open={active} />
      </span>
    </button>
  )
}
