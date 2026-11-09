// Szenen-Eingaben für den Rahmen: „jetzt“ (Startbildschirm) und aus einem Spielkontext.
import type { SpielKontext } from '../../data/types'
import { seasonFromDate, timeFromHour } from '../../lib/datetime'
import type { SceneInput } from '../../lib/scene'
import type { CurrentWeather } from '../../lib/weather'

/** Wie lange ein gespeichertes Wetter für den Startbildschirm als „aktuell“ gilt. */
export const WEATHER_FRESH_MS = 12 * 60 * 60 * 1000

/**
 * Szene „jetzt“: Jahreszeit/Tageszeit aus der Uhr, Wetter aus der letzten
 * Messung – nur wenn sie frisch genug ist (sonst unbekannt).
 */
export function nowScene(lastWeather: CurrentWeather | null = null, now: Date = new Date()): SceneInput {
  const fresh = lastWeather != null && now.getTime() - lastWeather.fetchedAt < WEATHER_FRESH_MS
  return {
    season: seasonFromDate(now),
    weather: fresh ? lastWeather.wb : null,
    time: timeFromHour(now.getHours()),
  }
}

/** Szene eines Spiels (sein Kontext ohne Habitat). */
export function ctxScene(ctx: SpielKontext): SceneInput {
  return { season: ctx.season, weather: ctx.weather, time: ctx.time }
}
