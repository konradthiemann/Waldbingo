import { describe, expect, it } from 'vitest'
import { OBJEKTE } from '../data/objects'
import { createGame } from './generator'
import { fromStored, gameFromShared, toShared, toStored } from './game-state'
import { SHARE_VERSION } from './share'
import type { SpielKontext } from '../data/types'

const CTX: SpielKontext = { season: 'herbst', weather: 'nach_regen', time: 'tag', habitat: 'mischwald' }

describe('toStored / fromStored roundtrip', () => {
  it('preserves game state through serialization', () => {
    const { pool, cards } = createGame({ data: OBJEKTE, ctx: CTX, diff: 1, seedStr: 'rt', players: 2 })
    const original = {
      pool,
      cards,
      found: [new Set([0, 3, 7]), new Set([1, 2])],
      activePlayer: 1,
      ctx: CTX,
      seedStr: 'rt',
      diff: 1,
      players: 2,
      createdAt: 1700000000000,
    }
    const stored = toStored(original)
    expect(stored.found[0]).toEqual([0, 3, 7])
    expect(stored.found[1]).toEqual([1, 2])

    const restored = fromStored({ ...stored, id: 'active' })
    expect(restored.found[0]).toBeInstanceOf(Set)
    expect(restored.found[0].has(3)).toBe(true)
    expect(restored.activePlayer).toBe(1)
    expect(restored.pool.map((o) => o.id)).toEqual(pool.map((o) => o.id))
  })
})

describe('toShared / gameFromShared', () => {
  it('creates a shared game without found state', () => {
    const { pool, cards } = createGame({ data: OBJEKTE, ctx: CTX, diff: 2, seedStr: 'sh', players: 3 })
    const game = {
      pool,
      cards,
      found: cards.map(() => new Set<number>()),
      activePlayer: 0,
      ctx: CTX,
      seedStr: 'sh',
      diff: 2,
      players: 3,
      createdAt: 1700000000000,
    }
    const shared = toShared(game)
    expect(shared.v).toBe(SHARE_VERSION)
    expect(shared.pool).toHaveLength(25)
    expect((shared as unknown as Record<string, unknown>).found).toBeUndefined()
  })

  it('gameFromShared creates correct state for a player', () => {
    const { pool } = createGame({ data: OBJEKTE, ctx: CTX, diff: 2, seedStr: 'gfs', players: 4 })
    const shared = {
      v: SHARE_VERSION,
      pool,
      ctx: CTX,
      diff: 2,
      seedStr: 'gfs',
      players: 4,
      createdAt: 1700000000000,
    }
    const state = gameFromShared(shared, 2)
    expect(state.selfPlayer).toBe(2)
    expect(state.activePlayer).toBe(2)
    expect(state.cards).toHaveLength(4)
    expect(state.found.every((s) => s.size === 0)).toBe(true)
  })
})
