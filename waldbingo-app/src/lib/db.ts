// Offline-Persistenz (IndexedDB über Dexie). Drei Aufgaben:
//  - aktives Spiel speichern, damit es Reload/Neustart übersteht (AP2)
//  - iNaturalist-Ergebnisse cachen (Rate-Limit schonen)
//  - aufgelöste Medien-Lookups cachen (Wikidata/Commons)
//  - letzte Einstellungen (grob gerundeter Standort, letztes Wetter)
import Dexie, { type Table } from 'dexie'
import type { SpielKontext, WaldObjekt } from '../data/types'
import type { CurrentWeather } from './weather'

export interface StoredGame {
  id: string // immer "active" (genau ein laufendes Spiel)
  pool: WaldObjekt[]
  cards: WaldObjekt[][]
  found: number[][] // pro Spieler die abgehakten Indizes
  activePlayer: number
  ctx: SpielKontext
  seedStr: string
  diff: number
  players: number
  createdAt: number
}

export interface SpeciesCacheEntry {
  key: string // gerundete lat,lng + Monat + diff
  species: WaldObjekt[]
  createdAt: number
}

export interface MediaCacheEntry {
  taxonId: number
  url: string
  attribution?: string
  license?: string
  source?: string
  createdAt: number
}

export interface Settings {
  id: string // "user"
  lastLat?: number
  lastLng?: number
  lastWeather?: CurrentWeather
  liveDisabled?: boolean
}

class WaldbingoDB extends Dexie {
  games!: Table<StoredGame, string>
  speciesCache!: Table<SpeciesCacheEntry, string>
  mediaCache!: Table<MediaCacheEntry, number>
  settings!: Table<Settings, string>

  constructor() {
    super('waldbingo')
    this.version(1).stores({
      games: 'id',
      speciesCache: 'key, createdAt',
      mediaCache: 'taxonId, createdAt',
      settings: 'id',
    })
  }
}

export const db = new WaldbingoDB()

// ── Aktives Spiel ─────────────────────────────────────────────────────────
const ACTIVE = 'active'

export async function saveGame(game: Omit<StoredGame, 'id'>): Promise<void> {
  await db.games.put({ ...game, id: ACTIVE })
}

export async function loadGame(): Promise<StoredGame | undefined> {
  return db.games.get(ACTIVE)
}

export async function updateFound(found: number[][], activePlayer: number): Promise<void> {
  const g = await db.games.get(ACTIVE)
  if (!g) return
  await db.games.put({ ...g, found, activePlayer })
}

export async function clearGame(): Promise<void> {
  await db.games.delete(ACTIVE)
}

// ── Arten-Cache ─────────────────────────────────────────────────────────--
export function speciesCacheKey(lat: number, lng: number, month: number, diff: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}:${month}:${diff}`
}

const SPECIES_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 Tage

export async function getCachedSpecies(key: string): Promise<WaldObjekt[] | null> {
  const e = await db.speciesCache.get(key)
  if (!e) return null
  if (Date.now() - e.createdAt > SPECIES_TTL_MS) return null
  return e.species
}

export async function putCachedSpecies(key: string, species: WaldObjekt[]): Promise<void> {
  await db.speciesCache.put({ key, species, createdAt: Date.now() })
}

// ── Medien-Cache (aufgelöste Illustrations-/Foto-URLs) ─────────────────────
export async function getCachedMedia(taxonId: number): Promise<MediaCacheEntry | undefined> {
  return db.mediaCache.get(taxonId)
}

export async function putCachedMedia(e: Omit<MediaCacheEntry, 'createdAt'>): Promise<void> {
  await db.mediaCache.put({ ...e, createdAt: Date.now() })
}

// ── Einstellungen ──────────────────────────────────────────────────────────
const USER = 'user'

export async function loadSettings(): Promise<Settings> {
  return (await db.settings.get(USER)) ?? { id: USER }
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const cur = (await db.settings.get(USER)) ?? { id: USER }
  await db.settings.put({ ...cur, ...patch, id: USER })
}
