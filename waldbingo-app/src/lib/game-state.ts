import type { SpielKontext, WaldObjekt } from '../data/types'
import type { StoredGame } from './db'
import { cardsForGame } from './generator'
import { SHARE_VERSION, type SharedGame } from './share'

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
  /**
   * Bei einem über mehrere Geräte geteilten Spiel: die eigene Spielernummer
   * (0-basiert). Dann ist das Gerät auf diesen Spieler fixiert (keine Tabs).
   * `undefined` ⇒ lokales Spiel (alle Spieler auf einem Gerät, mit Tabs).
   */
  selfPlayer?: number
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
    selfPlayer: g.selfPlayer,
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
    selfPlayer: s.selfPlayer,
  }
}

/** Baut aus einem laufenden Spiel die teilbare Einladung (ohne Fortschritt). */
export function toShared(g: GameState): SharedGame {
  return {
    v: SHARE_VERSION,
    pool: g.pool,
    ctx: g.ctx,
    diff: g.diff,
    seedStr: g.seedStr,
    players: g.players,
    createdAt: g.createdAt,
  }
}

/**
 * Erzeugt aus einer Einladung den lokalen Spielzustand für die gewählte
 * Spielernummer. Karten werden deterministisch aus Pool + Seed abgeleitet,
 * das Gerät ist auf `selfPlayer` fixiert, Fortschritt startet leer.
 */
export function gameFromShared(shared: SharedGame, selfPlayer: number): GameState {
  const cards = cardsForGame(shared.pool, shared.seedStr, shared.players)
  return {
    pool: shared.pool,
    cards,
    found: cards.map(() => new Set<number>()),
    activePlayer: selfPlayer,
    ctx: shared.ctx,
    seedStr: shared.seedStr,
    diff: shared.diff,
    players: shared.players,
    createdAt: shared.createdAt,
    selfPlayer,
  }
}
