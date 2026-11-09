import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deriveScene, SCENE_SEASONS, SCENE_TIMES, SCENE_WEATHERS } from '../../lib/scene'
import { CALM_FACTOR, MAX_AREA_FACTOR, ParticleEngine, particlePlan, PHONE_BUDGET } from './particles'

const total = (p: { count: number }[]) => p.reduce((n, x) => n + x.count, 0)

describe('particlePlan – Budget & Skalierung', () => {
  it('bleibt auf Handy-Fläche für alle Szenen im Budget (≤ ~80)', () => {
    for (const season of SCENE_SEASONS)
      for (const weather of SCENE_WEATHERS)
        for (const time of SCENE_TIMES) {
          const s = deriveScene({ season, weather, time })
          // Rundung pro Art kann das Budget um wenige Partikel überschreiten.
          expect(total(particlePlan(s, 390, 844)), `${season}/${weather}/${time}`).toBeLessThanOrEqual(PHONE_BUDGET + 4)
        }
  })

  it('skaliert mit der Fläche, gedeckelt auf das Dreifache', () => {
    const s = deriveScene({ season: 'winter', weather: 'schnee', time: 'tag' })
    const phone = total(particlePlan(s, 390, 844))
    const desk = total(particlePlan(s, 1280, 800))
    const huge = total(particlePlan(s, 3840, 2160))
    expect(desk).toBeGreaterThan(phone)
    expect(huge).toBeLessThanOrEqual(Math.ceil(PHONE_BUDGET * MAX_AREA_FACTOR) + 8)
  })

  it('calm dämpft die Partikelzahl deutlich', () => {
    const s = deriveScene({ season: 'herbst', weather: 'regen', time: 'tag' })
    const normal = total(particlePlan(s, 390, 844))
    const calm = total(particlePlan(s, 390, 844, true))
    expect(calm).toBeLessThanOrEqual(Math.ceil(normal * CALM_FACTOR) + 2)
  })

  it('Sparmodus-Budget dünnt aus, jede Art bleibt sichtbar', () => {
    const s = deriveScene({ season: 'herbst', weather: 'regen', time: 'abend' })
    const full = particlePlan(s, 390, 844)
    const lite = particlePlan(s, 390, 844, false, 0.5)
    expect(total(lite)).toBeLessThanOrEqual(Math.ceil(total(full) * 0.5) + 2)
    expect(lite.map((p) => p.kind)).toEqual(full.map((p) => p.kind))
    for (const p of lite) expect(p.count).toBeGreaterThan(0)
  })

  it('leere Fläche → keine Partikel', () => {
    const s = deriveScene({ season: 'sommer', weather: 'regen', time: 'tag' })
    expect(particlePlan(s, 0, 0)).toEqual([])
  })
})

describe('particlePlan – Wetter ist erkennbar', () => {
  const kinds = (season: Parameters<typeof deriveScene>[0]['season'], weather: Parameters<typeof deriveScene>[0]['weather'], time: Parameters<typeof deriveScene>[0]['time']) =>
    particlePlan(deriveScene({ season, weather, time }), 390, 844).map((p) => p.kind)

  it('Regen → Regentropfen', () => expect(kinds('herbst', 'regen', 'abend')).toContain('rain'))
  it('Schnee → Flocken', () => expect(kinds('winter', 'schnee', 'nacht')).toContain('snow'))
  it('Herbst → fallende Blätter', () => expect(kinds('herbst', 'nebel', 'morgen')).toContain('leaf'))
  it('Frühling am Tag → Blütenblätter', () => expect(kinds('fruehling', 'klar', 'morgen')).toContain('petal'))
  it('Sommernacht → Glühwürmchen', () => expect(kinds('sommer', 'klar', 'nacht')).toContain('firefly'))
  it('Wind → Böen', () => expect(kinds('sommer', 'wind', 'abend')).toContain('gust'))
  it('Frost → Glitzer', () => expect(kinds('winter', 'frost', 'tag')).toContain('sparkle'))
  it('Sommer klar Tag → nur sanfte Lichtpünktchen, kein Niederschlag', () => {
    const k = kinds('sommer', 'klar', 'tag')
    expect(k).toContain('mote')
    expect(k).not.toContain('rain')
    expect(k).not.toContain('snow')
  })
})

describe('ParticleEngine – Leerlauf', () => {
  // jsdom hat kein Canvas: Kontext null, rAF als Zähler.
  const fakeCanvas = () => ({ width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement
  const colors = { leaves: ['#e8892f'], petals: ['#ffc4d8'] }

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('startet ohne Partikel keinen rAF-Loop und startet ihn, sobald es Partikel gibt', () => {
    const eng = new ParticleEngine(fakeCanvas())
    eng.resize(390, 844, 1)
    // Winter · klar · Tag: kein Niederschlag, keine Blätter, kein Glitzer.
    const leer = deriveScene({ season: 'winter', weather: 'klar', time: 'tag' })
    expect(particlePlan(leer, 390, 844)).toEqual([])
    eng.setScene(leer, colors, false)
    eng.start()
    expect(eng.isRunning).toBe(false)
    expect(requestAnimationFrame).not.toHaveBeenCalled()

    eng.setScene(deriveScene({ season: 'winter', weather: 'schnee', time: 'tag' }), colors, false)
    expect(eng.isRunning).toBe(true)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

    // Zurück zu „nichts los“: Loop wird beendet.
    eng.setScene(leer, colors, false)
    expect(eng.isRunning).toBe(false)
  })

  it('bleibt bei versteckter Seite/reduzierter Bewegung (stop) aus, auch wenn Partikel kommen', () => {
    const eng = new ParticleEngine(fakeCanvas())
    eng.resize(390, 844, 1)
    eng.stop()
    eng.setScene(deriveScene({ season: 'herbst', weather: 'regen', time: 'tag' }), colors, false)
    expect(eng.isRunning).toBe(false)
    eng.start()
    expect(eng.isRunning).toBe(true)
  })
})
