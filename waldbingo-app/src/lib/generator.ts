// Bingo-Generator – 1:1-Portierung der erprobten Logik aus dem Vanilla-Prototyp
// (waldbingo-app/index.html, Z. 370-417). Erweiterung: optionaler Live-Bonus,
// damit live geholte iNaturalist-Arten generische kuratierte Objekte verdrängen
// können, ohne die Kategorie-Obergrenze (Sicherheitsanker) zu durchbrechen.
import type { ScoredObjekt, SpielKontext, WaldObjekt, Wetter } from '../data/types'

export const CARD_SIZE = 25

/** Bonus pro Schwierigkeitsstufe für live geholte Arten (Gewichtungs-Ziel). */
export const LIVE_BONUS: Record<number, number> = { 1: 1, 2: 1.8, 3: 2.4 }

// ── Seeded RNG (mulberry32) – reproduzierbare Karten ──────────────────────
export function strToSeed(s: string): number {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0 || 12345
}

export type RNG = () => number

export function mulberry32(a: number): RNG {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Gewichtung ────────────────────────────────────────────────────────────
const NACH_REGEN_IDS = ['schnecke', 'pilz', 'fliegenpilz', 'regenwurm', 'baumpilz']
const SCHNEE_IDS = ['pfotenabdruck', 'schneeflocke', 'eiszapfen', 'tannenzapfen']

export function weatherBonus(obj: WaldObjekt, weather: Wetter | null): number {
  if (!weather) return 1
  if (obj.wetter.includes(weather)) {
    if (weather === 'nach_regen' && NACH_REGEN_IDS.includes(obj.id)) return 2.5
    if (weather === 'schnee' && SCHNEE_IDS.includes(obj.id)) return 2.2
    return 1.6
  }
  return 0.35
}

export function difficultyFactor(obj: WaldObjekt, diff: number): number {
  if (diff === 1) return obj.schwierigkeit === 1 ? 1.8 : obj.schwierigkeit === 2 ? 0.6 : 0.15
  if (diff === 2) return obj.schwierigkeit <= 2 ? 1.2 : 0.6
  return 1.0
}

// ── Filter (progressiver Fallback-Trichter, garantiert genug Pool) ─────────
export function filterByContext(data: WaldObjekt[], ctx: SpielKontext): WaldObjekt[] {
  let pool = data.filter(
    (o) =>
      o.jahreszeiten.includes(ctx.season) &&
      o.habitat.includes(ctx.habitat) &&
      o.tageszeit.includes(ctx.time),
  )
  if (pool.length < CARD_SIZE)
    pool = data.filter((o) => o.jahreszeiten.includes(ctx.season) && o.habitat.includes(ctx.habitat))
  if (pool.length < CARD_SIZE) pool = data.filter((o) => o.jahreszeiten.includes(ctx.season))
  if (pool.length < CARD_SIZE) pool = data.slice()
  return pool
}

/** Versieht jedes Objekt mit Score = gewicht × Wetter × Schwierigkeit × Live-Bonus. */
export function scorePool(pool: WaldObjekt[], ctx: SpielKontext, diff: number): ScoredObjekt[] {
  return pool.map((o) => ({
    ...o,
    _w:
      (o.gewicht || 1) *
      weatherBonus(o, ctx.weather) *
      difficultyFactor(o, diff) *
      (o._live ? LIVE_BONUS[diff] ?? 1 : 1),
  }))
}

// ── Gewichtete Ziehung mit Kategorie-Obergrenze ───────────────────────────
export function weightedSample(pool: ScoredObjekt[], n: number, rng: RNG): WaldObjekt[] {
  const chosen: WaldObjekt[] = []
  const items = pool.map((p) => ({ ...p }))
  const catCount: Record<string, number> = {}
  const maxPerCat = Math.max(3, Math.ceil(n / 4))
  while (chosen.length < n && items.length) {
    const avail = items.filter((it) => (catCount[it.kategorie] || 0) < maxPerCat)
    const use = avail.length ? avail : items
    const total = use.reduce((s, it) => s + it._w, 0)
    let r = rng() * total
    let pick = use[0]
    for (const it of use) {
      r -= it._w
      if (r <= 0) {
        pick = it
        break
      }
    }
    chosen.push(pick)
    catCount[pick.kategorie] = (catCount[pick.kategorie] || 0) + 1
    const idx = items.indexOf(pick)
    items.splice(idx, 1)
  }
  return chosen
}

/** Erzeugt einen 25er-Pool aus dem Kontext (Filter → Score → Ziehung). */
export function generateCard(
  data: WaldObjekt[],
  ctx: SpielKontext,
  diff: number,
  rng: RNG,
): WaldObjekt[] {
  const filtered = filterByContext(data, ctx)
  const scored = scorePool(filtered, ctx, diff)
  return weightedSample(scored, CARD_SIZE, rng)
}

export function shuffle<T>(arr: T[], rng: RNG): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Bingo-Prüfung (Reihe / Spalte / Diagonale) ────────────────────────────
export function checkBingo(found: Set<number>): boolean {
  const has = (i: number) => found.has(i)
  for (let r = 0; r < 5; r++) {
    let ok = true
    for (let c = 0; c < 5; c++) if (!has(r * 5 + c)) ok = false
    if (ok) return true
  }
  for (let c = 0; c < 5; c++) {
    let ok = true
    for (let r = 0; r < 5; r++) if (!has(r * 5 + c)) ok = false
    if (ok) return true
  }
  let d1 = true
  let d2 = true
  for (let i = 0; i < 5; i++) {
    if (!has(i * 5 + i)) d1 = false
    if (!has(i * 5 + (4 - i))) d2 = false
  }
  return d1 || d2
}

export interface GameSetup {
  data: WaldObjekt[]
  ctx: SpielKontext
  diff: number
  seedStr: string
  players: number
}

export interface GeneratedGame {
  /** Der gezogene 25er-Pool (Basis-Reihenfolge). */
  pool: WaldObjekt[]
  /** Pro Spieler eine eigene Anordnung desselben Pools. */
  cards: WaldObjekt[][]
}

/** Maximale Spielerzahl (Geräte) pro Spiel. */
export const MAX_PLAYERS = 10

/**
 * Leitet aus einem fixen Pool pro Spieler die Karten-Anordnung ab.
 * Deterministisch: identischer Pool + Seed ⇒ identische Karten auf jedem Gerät.
 * Genau das ermöglicht „Reihenfolge wird beim Beitreten festgelegt": ein Gast
 * berechnet seine Anordnung allein aus Pool, Seed und seiner Spielernummer.
 */
export function cardsForGame(pool: WaldObjekt[], seedStr: string, players: number): WaldObjekt[][] {
  const nP = Math.min(MAX_PLAYERS, Math.max(1, players))
  const cards: WaldObjekt[][] = []
  for (let p = 0; p < nP; p++) {
    cards.push(shuffle(pool, mulberry32(strToSeed(seedStr + '_' + p))))
  }
  return cards
}

/** Erzeugt das vollständige Spiel: ein Pool, pro Spieler eigene Anordnung. */
export function createGame({ data, ctx, diff, seedStr, players }: GameSetup): GeneratedGame {
  const baseRng = mulberry32(strToSeed(seedStr))
  const pool = generateCard(data, ctx, diff, baseRng)
  const cards = cardsForGame(pool, seedStr, players)
  return { pool, cards }
}
