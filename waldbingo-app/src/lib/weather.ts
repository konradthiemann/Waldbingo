// Open-Meteo-Anbindung (kostenlos, kein API-Key). Portiert + erweitert aus
// index.html (Z. 551-582): mehr Felder für die Wetter-Kachel.
import type { Wetter } from '../data/types'

/** WMO-Wettercode (+ Temperatur) → Waldbingo-Wetterlage. Port aus index.html. */
export function mapWeatherCode(code: number, temp?: number): Wetter {
  if (temp !== undefined && temp <= 0 && ![71, 73, 75, 77, 85, 86].includes(code)) return 'frost'
  if (code === 0) return 'klar'
  if ([1, 2, 3].includes(code)) return 'bewoelkt'
  if ([45, 48].includes(code)) return 'nebel'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'regen'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'schnee'
  return 'bewoelkt'
}

/** Kindgerechte Kurzbeschreibung eines WMO-Codes (für die Wetter-Kachel). */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Klar'
  if (code === 1) return 'Überwiegend klar'
  if (code === 2) return 'Teils bewölkt'
  if (code === 3) return 'Bewölkt'
  if ([45, 48].includes(code)) return 'Nebel'
  if ([51, 53, 55].includes(code)) return 'Nieselregen'
  if ([56, 57, 66, 67].includes(code)) return 'Gefrierender Regen'
  if ([61, 63, 65, 80, 81, 82].includes(code)) return 'Regen'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Schnee'
  if ([95, 96, 99].includes(code)) return 'Gewitter'
  return 'Wechselhaft'
}

export interface CurrentWeather {
  temperature: number
  weatherCode: number
  precipitation: number
  windSpeed: number
  label: string
  /** Auf das Waldbingo-Vokabular gemappte Wetterlage. */
  wb: Wetter
  /** Zeitpunkt der Messung (ms). */
  fetchedAt: number
}

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'

/** Holt das aktuelle Wetter für Koordinaten. Wirft bei Netzfehler/Timeout. */
export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url =
    `${OPEN_METEO}?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}` +
    `&current=temperature_2m,weather_code,precipitation,wind_speed_10m&timezone=auto`
  const r = await fetch(url, { signal })
  if (!r.ok) throw new Error(`Open-Meteo HTTP ${r.status}`)
  const j = (await r.json()) as {
    current: {
      temperature_2m: number
      weather_code: number
      precipitation: number
      wind_speed_10m: number
    }
  }
  const c = j.current
  return {
    temperature: c.temperature_2m,
    weatherCode: c.weather_code,
    precipitation: c.precipitation,
    windSpeed: c.wind_speed_10m,
    label: weatherCodeLabel(c.weather_code),
    wb: mapWeatherCode(c.weather_code, c.temperature_2m),
    fetchedAt: Date.now(),
  }
}
