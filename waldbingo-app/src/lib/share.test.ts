import { describe, expect, it } from 'vitest'
import { OBJEKTE } from '../data/objects'
import type { SpielKontext, WaldObjekt } from '../data/types'
import { cardsForGame, createGame } from './generator'
import { decodeCompact, encodeCompact, SHARE_VERSION, type SharedGame } from './share'

const CTX: SpielKontext = { season: 'sommer', weather: 'klar', time: 'tag', habitat: 'mischwald' }

function sharedFrom(seedStr: string, diff: number, players: number, data = OBJEKTE): SharedGame {
  const { pool } = createGame({ data, ctx: CTX, diff, seedStr, players })
  return { v: SHARE_VERSION, pool, ctx: CTX, diff, seedStr, players, createdAt: 1700000000000 }
}

describe('share – kompakte Kodierung', () => {
  it('round-trip erhält Pool-Reihenfolge und Kontext (kuratiert)', () => {
    const shared = sharedFrom('teilen-1', 1, 3)
    const decoded = decodeCompact(encodeCompact(shared))
    expect(decoded.pool.map((o) => o.id)).toEqual(shared.pool.map((o) => o.id))
    expect(decoded.ctx).toEqual(shared.ctx)
    expect(decoded.seedStr).toBe(shared.seedStr)
    expect(decoded.players).toBe(shared.players)
    expect(decoded.diff).toBe(shared.diff)
  })

  it('Gast leitet nach Decode dieselbe Karte ab wie der Host', () => {
    const host = createGame({ data: OBJEKTE, ctx: CTX, diff: 1, seedStr: 'q', players: 4 })
    const shared: SharedGame = {
      v: SHARE_VERSION,
      pool: host.pool,
      ctx: CTX,
      diff: 1,
      seedStr: 'q',
      players: 4,
      createdAt: 1700000000000,
    }
    const decoded = decodeCompact(encodeCompact(shared))
    const guestCards = cardsForGame(decoded.pool, decoded.seedStr, decoded.players)
    for (let p = 0; p < 4; p++) {
      expect(guestCards[p].map((o) => o.id)).toEqual(host.cards[p].map((o) => o.id))
    }
  })

  it('erhält Live-Arten (Foto, Info) über den kompakten Pfad', () => {
    const live: WaldObjekt = {
      id: 'inat-42',
      name: 'Steinpilz',
      kategorie: 'Pilz',
      emoji: '🍄',
      iconId: 'pilz',
      jahreszeiten: ['sommer'],
      wetter: ['klar'],
      tageszeit: ['tag'],
      habitat: ['mischwald'],
      regionen: ['DE-weit'],
      schwierigkeit: 2,
      info: { kurz: 'Speisepilz', erkennen: 'brauner Hut', wusstest_du: 'lebt mit Bäumen' },
      _live: true,
      _taxonId: 42,
      _media: { kind: 'foto', url: 'https://example.org/pilz.jpg', source: 'iNaturalist' },
    }
    const shared: SharedGame = {
      v: SHARE_VERSION,
      pool: [live, ...OBJEKTE.slice(0, 4)],
      ctx: CTX,
      diff: 3,
      seedStr: 'live',
      players: 2,
      createdAt: 1700000000000,
    }
    const decoded = decodeCompact(encodeCompact(shared))
    const got = decoded.pool[0]
    expect(got.id).toBe('inat-42')
    expect(got.name).toBe('Steinpilz')
    expect(got._live).toBe(true)
    expect(got._taxonId).toBe(42)
    expect(got._media?.url).toBe('https://example.org/pilz.jpg')
    expect(got.info.wusstest_du).toBe('lebt mit Bäumen')
    // kuratierte Felder bleiben über ID-Referenz erhalten
    expect(decoded.pool[1].id).toBe(OBJEKTE[0].id)
    expect(decoded.pool[1].name).toBe(OBJEKTE[0].name)
  })
})
