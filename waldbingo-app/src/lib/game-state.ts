import type { SpielKontext, WaldObjekt } from '../data/types'
import type { StoredGame } from './db'

/** Laufender Spielzustand (im RAM). `found` als Set pro Spieler. */
export interface GameState {
  pool: WaldObjekt[]
  cards: WaldObjekt[][]
  found: Set<number>[]
  activePlayer: number
  ctx: SpielKontext
  seedStr: string
  diff: number
  players: number
  createdAt: number
}

export function toStored(g: GameState): Omit<StoredGame, 'id'> {
  return {
    pool: g.pool,
    cards: g.cards,
    found: g.found.map((s) => [...s]),
    activePlayer: g.activePlayer,
    ctx: g.ctx,
    seedStr: g.seedStr,
    diff: g.diff,
    players: g.players,
    createdAt: g.createdAt,
  }
}

export function fromStored(s: StoredGame): GameState {
  return {
    pool: s.pool,
    cards: s.cards,
    found: s.found.map((a) => new Set(a)),
    activePlayer: s.activePlayer,
    ctx: s.ctx,
    seedStr: s.seedStr,
    diff: s.diff,
    players: s.players,
    createdAt: s.createdAt,
  }
}
