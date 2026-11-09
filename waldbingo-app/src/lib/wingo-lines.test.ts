import { describe, expect, it } from 'vitest'
import type { Jahreszeit, Tageszeit, Wetter } from '../data/types'
import { type LineContext, MAX_LINE_LENGTH, WINGO_SITUATIONS, wingoLine, wingoLines, wingoMood } from './wingo-lines'

const SEASONS: (Jahreszeit | undefined)[] = [undefined, 'fruehling', 'sommer', 'herbst', 'winter']
const WEATHERS: (Wetter | null | undefined)[] = [
  undefined,
  null,
  'klar',
  'bewoelkt',
  'regen',
  'nach_regen',
  'schnee',
  'frost',
  'wind',
  'nebel',
]
const TIMES: (Tageszeit | undefined)[] = [undefined, 'morgen', 'tag', 'abend', 'daemmerung', 'nacht']

/** Alle Kontext-Kombinationen (inkl. „unbekannt“). */
function allContexts(extra: Partial<LineContext> = {}): LineContext[] {
  const out: LineContext[] = []
  for (const season of SEASONS)
    for (const weather of WEATHERS) for (const time of TIMES) out.push({ season, weather, time, ...extra })
  return out
}

describe('wingo-lines', () => {
  it('liefert für jede Situation und jeden Kontext nicht-leere Zeilen ≤ 90 Zeichen', () => {
    const extras: Partial<LineContext>[] = [{}, { thing: 'Fliegenpilz', count: 1 }, { thing: 'Moos', count: 10 }, { count: 7 }]
    for (const situation of WINGO_SITUATIONS) {
      for (const extra of extras) {
        for (const ctx of allContexts(extra)) {
          const pool = wingoLines(situation, ctx)
          expect(pool.length, `${situation} ${JSON.stringify(ctx)}`).toBeGreaterThan(0)
          for (const line of pool) {
            expect(line.trim(), situation).toBe(line)
            expect(line.length, `${situation}: „${line}“`).toBeGreaterThan(0)
            expect(line.length, `${situation}: „${line}“`).toBeLessThanOrEqual(MAX_LINE_LENGTH)
          }
        }
      }
    }
  })

  it('hat je Situation mehrere Varianten', () => {
    for (const situation of WINGO_SITUATIONS) {
      expect(wingoLines(situation, {}).length, situation).toBeGreaterThanOrEqual(3)
    }
  })

  it('ist deterministisch und wechselt reihum durch alle Varianten', () => {
    const ctx: LineContext = { season: 'herbst', weather: 'regen', time: 'abend' }
    for (const situation of WINGO_SITUATIONS) {
      const pool = wingoLines(situation, ctx)
      expect(wingoLines(situation, ctx)).toEqual(pool)
      for (let v = 0; v < pool.length * 2; v++) {
        expect(wingoLine(situation, ctx, v)).toBe(pool[v % pool.length])
        expect(wingoLine(situation, ctx, v)).toBe(wingoLine(situation, ctx, v))
      }
      // Robust gegen negative/krumme Varianten
      expect(wingoLine(situation, ctx, -1)).toBe(pool[1 % pool.length])
      expect(wingoLine(situation, ctx, 2.7)).toBe(pool[2 % pool.length])
      expect(wingoLine(situation, ctx, Number.NaN)).toBe(pool[0])
    }
  })

  it('enthält keine doppelten Zeilen im Pool', () => {
    for (const situation of WINGO_SITUATIONS) {
      for (const ctx of allContexts({ thing: 'Eichel', count: 5 })) {
        const pool = wingoLines(situation, ctx)
        expect(new Set(pool).size).toBe(pool.length)
      }
    }
  })

  it('stellt Kontextzeilen nach Wetter nach vorn', () => {
    expect(wingoLine('welcome', { weather: 'regen' })).toMatch(/Regen/)
    expect(wingoLine('welcome', { weather: 'schnee' })).toMatch(/Schnee/)
    expect(wingoLine('setup', { weather: 'nebel' })).toMatch(/Nebel/)
    expect(wingoLine('start', { weather: 'frost' })).toMatch(/Frost/)
    expect(wingoLine('idle', { weather: 'nach_regen' })).toBe('Nach dem Regen kommen die Schnecken raus!')
    expect(wingoLine('welcomeBack', { weather: 'wind' })).toMatch(/Wind/)
  })

  it('stellt Kontextzeilen nach Tageszeit nach vorn – Nacht hat Vorrang', () => {
    expect(wingoLine('idle', { time: 'nacht', weather: 'regen' })).toMatch(/nachts/i)
    expect(wingoLine('welcome', { time: 'nacht', weather: 'klar' })).toMatch(/Nacht|Eulen/)
    expect(wingoLine('welcome', { time: 'morgen' })).toMatch(/Morgen/)
    expect(wingoLine('start', { time: 'abend' })).toMatch(/Abend/)
    expect(wingoLine('welcome', { time: 'daemmerung' })).toMatch(/Dämmerung/)
  })

  it('stellt Kontextzeilen nach Jahreszeit nach vorn', () => {
    expect(wingoLine('welcome', { season: 'herbst' })).toMatch(/Herbst/)
    expect(wingoLine('setup', { season: 'winter' })).toMatch(/Winter/)
    expect(wingoLine('idle', { season: 'fruehling' })).toMatch(/Frühling/)
    expect(wingoLine('start', { season: 'sommer' })).toMatch(/Sommer/)
  })

  it('verspricht nachts keine Sonne', () => {
    for (const situation of WINGO_SITUATIONS) {
      for (const time of ['nacht', 'daemmerung'] as Tageszeit[]) {
        for (const line of wingoLines(situation, { weather: 'klar', time })) {
          expect(line, situation).not.toMatch(/Sonne/)
        }
      }
    }
  })

  it('nennt beim Fund den Namen und feiert Meilensteine', () => {
    const pool = wingoLines('found', { thing: 'Fliegenpilz' })
    expect(pool.filter((l) => l.includes('Fliegenpilz')).length).toBeGreaterThanOrEqual(4)
    expect(wingoLine('found', { thing: 'Fliegenpilz' })).toContain('Fliegenpilz')
    expect(wingoLine('found', { thing: 'Moos', count: 1 })).toBe('Dein erster Fund: Moos! Super!')
    expect(wingoLine('found', { thing: 'Eichel', count: 10 })).toMatch(/10 Funde/)
    expect(wingoLine('found', {})).toBe('Super gefunden!')
  })

  it('bleibt auch bei sehr langen Fundnamen ≤ 90 Zeichen', () => {
    const thing = 'Gewöhnlicher Wald-Sauerklee mit ganz besonders langem wissenschaftlichem Beinamen'
    const pool = wingoLines('found', { thing, count: 3 })
    expect(pool.length).toBeGreaterThan(0)
    for (const line of pool) expect(line.length).toBeLessThanOrEqual(MAX_LINE_LENGTH)
  })

  it('zeigt beim Wiederkommen den Fortschritt', () => {
    expect(wingoLine('welcomeBack', { count: 7 })).toMatch(/7 Funde/)
    expect(wingoLine('welcomeBack', { count: 1 })).toMatch(/Einen Fund/)
  })

  it('spricht beim Spielerwechsel die Spielerin mit Namen an', () => {
    expect(wingoLine('switch', { player: 'Flitz' })).toBe('Jetzt bist du dran, Flitz! Was findest du?')
    expect(wingoLines('switch', { player: 'Olli 2' }).filter((l) => l.includes('Olli 2')).length).toBe(3)
    expect(wingoLine('switch', {})).toBe('Jetzt bist du dran! Was findest du?')
  })

  it('fragt bei der Foto/Manuell-Wahl passend zum Kontext', () => {
    expect(wingoLine('choose', {})).toMatch(/Foto/)
    expect(wingoLine('choose', { weather: 'regen' })).toMatch(/nass/)
    expect(wingoLine('choose', { time: 'nacht', weather: 'regen' })).toMatch(/Dunkeln/)
  })

  it('empfiehlt passende Stimmungen', () => {
    expect(wingoMood('bingo')).toBe('cheer')
    expect(wingoMood('error')).toBe('sad')
    expect(wingoMood('welcome')).toBe('wave')
    for (const s of WINGO_SITUATIONS) expect(typeof wingoMood(s)).toBe('string')
  })
})
