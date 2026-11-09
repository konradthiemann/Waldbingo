import { describe, expect, it } from 'vitest'
import type { CurrentWeather } from '../../lib/weather'
import { ctxScene, nowScene, WEATHER_FRESH_MS } from './scene-input'

const weather = (fetchedAt: number): CurrentWeather => ({
  temperature: 4,
  weatherCode: 61,
  precipitation: 1.2,
  windSpeed: 8,
  label: 'Regen',
  wb: 'regen',
  fetchedAt,
})

describe('nowScene', () => {
  const now = new Date(2026, 10, 9, 21, 0) // 9. November, 21 Uhr

  it('leitet Jahreszeit und Tageszeit aus der Uhr ab', () => {
    const s = nowScene(null, now)
    expect(s.season).toBe('herbst')
    expect(s.time).toBe('daemmerung')
    expect(s.weather).toBeNull()
  })

  it('übernimmt frisches Wetter', () => {
    expect(nowScene(weather(now.getTime() - 60_000), now).weather).toBe('regen')
  })

  it('verwirft veraltetes Wetter', () => {
    expect(nowScene(weather(now.getTime() - WEATHER_FRESH_MS - 1), now).weather).toBeNull()
  })
})

describe('ctxScene', () => {
  it('lässt das Habitat weg', () => {
    expect(ctxScene({ season: 'winter', weather: 'schnee', time: 'nacht', habitat: 'nadelwald' })).toEqual({
      season: 'winter',
      weather: 'schnee',
      time: 'nacht',
    })
  })
})
