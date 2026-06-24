import { describe, expect, it } from 'vitest'
import { OBJEKTE } from '../data/objects'
import type { SpielKontext, WaldObjekt } from '../data/types'
import { CARD_SIZE, checkBingo, createGame } from './generator'

const CONTEXTS: SpielKontext[] = [
  { season: 'herbst', weather: 'nach_regen', time: 'tag', habitat: 'mischwald' },
  { season: 'winter', weather: 'schnee', time: 'morgen', habitat: 'nadelwald' },
  { season: 'sommer', weather: 'klar', time: 'abend', habitat: 'lichtung' },
  { season: 'fruehling', weather: null, time: 'tag', habitat: 'park' },
]

function maxCategoryCount(card: WaldObjekt[]): number {
  const counts: Record<string, number> = {}
  for (const o of card) counts[o.kategorie] = (counts[o.kategorie] ?? 0) + 1
  return Math.max(...Object.values(counts))
}

describe('createGame – Invarianten', () => {
  for (const ctx of CONTEXTS) {
    for (const diff of [1, 2, 3]) {
      it(`liefert 25 eindeutige Felder (${ctx.season}/${ctx.habitat}, diff ${diff})`, () => {
        const { pool, cards } = createGame({
          data: OBJEKTE,
          ctx,
          diff,
          seedStr: 'test-seed',
          players: 3,
        })
        expect(pool).toHaveLength(CARD_SIZE)
        const ids = new Set(pool.map((o) => o.id))
        expect(ids.size).toBe(CARD_SIZE) // keine Duplikate
        // Kategorie-Obergrenze: max(3, ceil(25/4)) = 7
        expect(maxCategoryCount(pool)).toBeLessThanOrEqual(7)
        // Jeder Spieler hat denselben Satz, andere Reihenfolge.
        for (const card of cards) {
          expect(new Set(card.map((o) => o.id))).toEqual(ids)
        }
      })
    }
  }

  it('ist mit gleichem Seed reproduzierbar', () => {
    const ctx = CONTEXTS[0]
    const a = createGame({ data: OBJEKTE, ctx, diff: 2, seedStr: 'wald42', players: 2 })
    const b = createGame({ data: OBJEKTE, ctx, diff: 2, seedStr: 'wald42', players: 2 })
    expect(a.cards[0].map((o) => o.id)).toEqual(b.cards[0].map((o) => o.id))
    expect(a.cards[1].map((o) => o.id)).toEqual(b.cards[1].map((o) => o.id))
  })

  it('erzeugt mit verschiedenen Seeds verschiedene Karten', () => {
    const ctx = CONTEXTS[0]
    const a = createGame({ data: OBJEKTE, ctx, diff: 2, seedStr: 'aaa', players: 1 })
    const b = createGame({ data: OBJEKTE, ctx, diff: 2, seedStr: 'bbb', players: 1 })
    expect(a.cards[0].map((o) => o.id)).not.toEqual(b.cards[0].map((o) => o.id))
  })

  it('mischt Live-Arten bevorzugt in den Pool (LIVE_BONUS)', () => {
    const ctx = CONTEXTS[0]
    // 30 künstliche Live-Arten, die zum Kontext passen.
    const live: WaldObjekt[] = Array.from({ length: 30 }, (_, i) => ({
      id: `inat-${i}`,
      name: `Live-Art ${i}`,
      kategorie: 'Pilz',
      emoji: '🍄',
      iconId: 'pilz',
      jahreszeiten: [ctx.season],
      wetter: ctx.weather ? [ctx.weather] : ['klar'],
      tageszeit: [ctx.time],
      habitat: [ctx.habitat],
      regionen: ['DE-weit'],
      schwierigkeit: 2,
      info: { kurz: 'x', erkennen: 'y', wusstest_du: 'z' },
      _live: true,
    }))
    const { pool } = createGame({
      data: OBJEKTE.concat(live),
      ctx,
      diff: 2,
      seedStr: 'mix',
      players: 1,
    })
    // Kategorie-Cap begrenzt Pilze auf 7 → es gibt Live-Felder, aber nicht nur Live.
    const liveCount = pool.filter((o) => o._live).length
    expect(liveCount).toBeGreaterThan(0)
    expect(liveCount).toBeLessThan(CARD_SIZE)
  })
})

describe('checkBingo', () => {
  it('erkennt eine volle Reihe', () => {
    expect(checkBingo(new Set([0, 1, 2, 3, 4]))).toBe(true)
  })
  it('erkennt eine Spalte', () => {
    expect(checkBingo(new Set([0, 5, 10, 15, 20]))).toBe(true)
  })
  it('erkennt eine Diagonale', () => {
    expect(checkBingo(new Set([0, 6, 12, 18, 24]))).toBe(true)
  })
  it('ist false ohne vollständige Linie', () => {
    expect(checkBingo(new Set([0, 1, 2, 3]))).toBe(false)
  })
})
