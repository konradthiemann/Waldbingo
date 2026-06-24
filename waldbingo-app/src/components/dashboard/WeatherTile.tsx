import type { CurrentWeather } from '../../lib/weather'
import { Tile } from './Tile'

interface Props {
  weather: CurrentWeather | null
  loading: boolean
}

function relativeTime(ms: number): string {
  const min = Math.round((Date.now() - ms) / 60000)
  if (min < 1) return 'gerade eben'
  if (min === 1) return 'vor 1 Minute'
  if (min < 60) return `vor ${min} Minuten`
  const h = Math.round(min / 60)
  return h === 1 ? 'vor 1 Stunde' : `vor ${h} Stunden`
}

export function WeatherTile({ weather, loading }: Props) {
  return (
    <Tile title="Wetter" glyph="weather">
      {loading ? (
        <p className="text-[14px] text-muted">Lädt…</p>
      ) : weather ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-extrabold text-forest-900">
              {Math.round(weather.temperature)}°C
            </span>
            <span className="text-[14px] font-semibold text-ink">{weather.label}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
            <span>🌧 {weather.precipitation} mm</span>
            <span>🍃 {Math.round(weather.windSpeed)} km/h</span>
          </div>
          <div className="mt-1 text-[11px] text-muted">aktualisiert {relativeTime(weather.fetchedAt)}</div>
        </div>
      ) : (
        <p className="text-[13.5px] text-muted">
          Standort wählen, um das Wetter zu laden – oder unten manuell festlegen.
        </p>
      )}
    </Tile>
  )
}
