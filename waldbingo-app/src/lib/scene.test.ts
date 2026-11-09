import { describe, expect, it } from 'vitest'
import {
  deriveScene,
  luminance,
  mix,
  parseSceneOverride,
  SCENE_SEASONS,
  SCENE_TIMES,
  SCENE_WEATHERS,
  sceneCssVars,
} from './scene'

const HEX = /^#[0-9a-f]{6}$/

describe('scene – Farb-Hilfen', () => {
  it('mix interpoliert linear', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
  it('luminance ordnet hell/dunkel richtig', () => {
    expect(luminance('#ffffff')).toBeGreaterThan(luminance('#14331f'))
  })
})

describe('scene – deriveScene', () => {
  it('liefert für alle 160 Kombinationen gültige Paletten', () => {
    for (const season of SCENE_SEASONS)
      for (const weather of SCENE_WEATHERS)
        for (const time of SCENE_TIMES) {
          const s = deriveScene({ season, weather, time })
          for (const [k, v] of Object.entries(s.palette)) {
            if (k === 'haze') expect(v).toMatch(/^rgba\(/)
            else expect(v, `${season}/${weather}/${time}.${k}`).toMatch(HEX)
          }
          expect(s.daylight).toBeGreaterThan(0)
          expect(s.daylight).toBeLessThanOrEqual(1)
        }
  })

  it('Nacht: Mond + Sterne bei klarem Himmel, dunkler Himmel, heller Text', () => {
    const s = deriveScene({ season: 'sommer', weather: 'klar', time: 'nacht' })
    expect(s.isNight).toBe(true)
    expect(s.celestial).toBe('moon')
    expect(s.stars).toBe(true)
    expect(s.fireflies).toBe(true)
    expect(s.palette.onScene).toBe('#ffffff')
  })

  it('Regen: kein Himmelskörper, Niederschlag, nass', () => {
    const s = deriveScene({ season: 'herbst', weather: 'regen', time: 'tag' })
    expect(s.celestial).toBe('none')
    expect(s.precipitation).toBe('rain')
    expect(s.wet).toBe(true)
    expect(s.fallingLeaves).toBe(true)
  })

  it('Schnee: Schneedecke und Schneefall', () => {
    const s = deriveScene({ season: 'winter', weather: 'schnee', time: 'morgen' })
    expect(s.snowCover).toBe(true)
    expect(s.precipitation).toBe('snow')
    expect(s.foliage).toBe('kahl')
  })

  it('Nebel: hohe Nebeldichte, keine Sterne', () => {
    const s = deriveScene({ season: 'herbst', weather: 'nebel', time: 'nacht' })
    expect(s.fog).toBeGreaterThan(0.5)
    expect(s.stars).toBe(false)
  })

  it('Nach Regen am Tag: Regenbogen', () => {
    expect(deriveScene({ season: 'sommer', weather: 'nach_regen', time: 'tag' }).rainbow).toBe(true)
    expect(deriveScene({ season: 'sommer', weather: 'nach_regen', time: 'nacht' }).rainbow).toBe(false)
  })

  it('Unbekanntes Wetter (null) funktioniert', () => {
    const s = deriveScene({ season: 'fruehling', weather: null, time: 'tag' })
    expect(s.celestial).toBe('sun')
    expect(s.petals).toBe(true)
  })
})

describe('scene – Lesbarkeit der Jahreszeit (Feintuning)', () => {
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

  it('Herbstlaub bleibt auch bei Regen am Abend orange (R > G > B)', () => {
    const [r, g, b] = rgb(deriveScene({ season: 'herbst', weather: 'regen', time: 'abend' }).palette.foliage)
    expect(r).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(b)
  })

  it('Abend bei Regen ist dunkler als Tag bei Regen und behält einen warmen Horizont', () => {
    const abend = deriveScene({ season: 'herbst', weather: 'regen', time: 'abend' }).palette
    const tag = deriveScene({ season: 'herbst', weather: 'regen', time: 'tag' }).palette
    expect(luminance(abend.skyTop)).toBeLessThan(luminance(tag.skyTop) * 0.8)
    expect(luminance(abend.ground)).toBeLessThan(luminance(tag.ground))
    // warmer Schimmer unten: Rot deutlich über Blau
    const [r, , b] = rgb(abend.skyBottom)
    expect(r - b).toBeGreaterThan(12)
  })

  it('Schneedecke macht die fernen Hügel heller', () => {
    const snow = deriveScene({ season: 'winter', weather: 'schnee', time: 'tag' }).palette.hillFar
    const bare = deriveScene({ season: 'winter', weather: 'klar', time: 'tag' }).palette.hillFar
    expect(luminance(snow)).toBeGreaterThan(luminance(bare))
  })

  it('Schnee leuchtet nachts heller als der Boden ohne Schnee', () => {
    const snow = deriveScene({ season: 'winter', weather: 'schnee', time: 'nacht' }).palette.ground
    const bare = deriveScene({ season: 'winter', weather: 'klar', time: 'nacht' }).palette.ground
    expect(luminance(snow)).toBeGreaterThan(luminance(bare))
  })
})

describe('scene – sceneCssVars', () => {
  it('erzeugt kebab-case Variablen', () => {
    const v = sceneCssVars(deriveScene({ season: 'sommer', weather: 'klar', time: 'tag' }))
    expect(v['--sc-sky-top']).toMatch(HEX)
    expect(v['--sc-on-scene']).toBeDefined()
    expect(v['--sc-daylight']).toBe('1.00')
  })
})

describe('scene – parseSceneOverride', () => {
  const fb = { season: 'sommer', weather: null, time: 'tag' } as const
  it('liest Teile in beliebiger Reihenfolge', () => {
    expect(parseSceneOverride('?scene=nacht,winter,schnee', fb)).toEqual({
      season: 'winter',
      weather: 'schnee',
      time: 'nacht',
    })
  })
  it('füllt fehlende Teile auf', () => {
    expect(parseSceneOverride('?scene=nebel', fb)).toEqual({ ...fb, weather: 'nebel' })
  })
  it('null ohne/ungültigen Parameter', () => {
    expect(parseSceneOverride('', fb)).toBeNull()
    expect(parseSceneOverride('?scene=quatsch', fb)).toBeNull()
  })
})
