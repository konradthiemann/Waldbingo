// iNaturalist-Arten-Pipeline: holt regional + saisonal vorkommende Arten,
// stuft sie nach Häufigkeit ein und normalisiert sie ins WaldObjekt-Schema,
// damit der bestehende Generator unverändert auf dem gemischten Pool arbeitet.
import type { Kategorie, SpielKontext, WaldObjekt, Wetter } from '../data/types'
import { seasonToMonths } from './datetime'
import { bandForMode, difficultyClassifier, MIN_COUNT } from './difficulty'
import { buildInfo, summaryToKurz } from './info-templates'
import { categoryFallbackIconId, type INatPhoto, photoMedia } from './media'
import { getCachedSpecies, putCachedSpecies, speciesCacheKey } from './db'

const SPECIES_COUNTS = 'https://api.inaturalist.org/v1/observations/species_counts'
const DEFAULT_RADIUS_KM = 30
const GROUP_DELAY_MS = 1100 // ~1 req/s respektieren (HTTP 429 vermeiden)
const GROUP_TIMEOUT_MS = 8000

const GROUPS: Array<{ iconic: string; kategorie: Kategorie }> = [
  { iconic: 'Fungi', kategorie: 'Pilz' },
  { iconic: 'Plantae', kategorie: 'Pflanze' },
  { iconic: 'Aves', kategorie: 'Vogel' },
  { iconic: 'Insecta', kategorie: 'Insekt' },
  { iconic: 'Mammalia', kategorie: 'Tier' },
]

const CATEGORY_EMOJI: Record<Kategorie, string> = {
  Pilz: '🍄',
  Vogel: '🐦',
  Insekt: '🪲',
  Tier: '🦌',
  Pflanze: '🌿',
  Baum: '🌳',
  Spur: '🐾',
  Landschaft: '🪨',
}

interface INatTaxon {
  id: number
  name: string
  rank?: string
  preferred_common_name?: string
  default_photo?: INatPhoto
  wikipedia_summary?: string
  iconic_taxon_name?: string
  conservation_status?: { status?: string } | null
}
interface SpeciesCount {
  count: number
  taxon: INatTaxon
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

function isSensitive(t: INatTaxon): boolean {
  const status = (t.conservation_status?.status ?? '').toLowerCase()
  if (!status) return false
  return /(en|vu|cr|nt|ex|ew|threatened|sensitive|endangered|vulnerable)/.test(status)
}

async function fetchGroup(
  lat: number,
  lng: number,
  radiusKm: number,
  months: number[],
  iconic: string,
  signal?: AbortSignal,
): Promise<SpeciesCount[]> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), GROUP_TIMEOUT_MS)
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true })
  try {
    const url =
      `${SPECIES_COUNTS}?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=${radiusKm}` +
      `&month=${months.join(',')}&iconic_taxa=${iconic}` +
      `&quality_grade=research&rank=species&locale=de&per_page=50`
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!r.ok) throw new Error(`iNaturalist HTTP ${r.status}`)
    const j = (await r.json()) as { results?: SpeciesCount[] }
    return j.results ?? []
  } finally {
    clearTimeout(timer)
  }
}

function normalize(
  sc: SpeciesCount,
  kategorie: Kategorie,
  classify: (n: number) => 1 | 2 | 3,
  ctx: SpielKontext,
): WaldObjekt | null {
  const t = sc.taxon
  const name = t.preferred_common_name?.trim()
  if (!name) return null // ohne deutschen Trivialnamen verwerfen (Kindertauglichkeit)
  if (sc.count < MIN_COUNT) return null // Zufallsbeobachtung raushalten
  if (isSensitive(t)) return null // geschützte/sensible Arten ausschließen

  const schwierigkeit = classify(sc.count)
  const kurz = summaryToKurz(t.wikipedia_summary)
  const media = photoMedia(t.default_photo)
  const wetter: Wetter[] = ctx.weather ? [ctx.weather] : ['klar', 'bewoelkt']

  return {
    id: 'inat-' + t.id,
    name,
    kategorie,
    emoji: CATEGORY_EMOJI[kategorie],
    iconId: categoryFallbackIconId(kategorie),
    jahreszeiten: [ctx.season],
    wetter,
    tageszeit: [ctx.time],
    habitat: [ctx.habitat],
    regionen: ['DE-weit'],
    schwierigkeit,
    gewicht: 1.0,
    info: buildInfo(kategorie, kurz),
    _live: true,
    _taxonId: t.id,
    _count: sc.count,
    _media: media ?? undefined,
  }
}

export interface RegionalOptions {
  lat: number
  lng: number
  ctx: SpielKontext
  diff: number
  radiusKm?: number
  /** Pause zwischen den Gruppen-Calls (Default ~1 req/s). Tests setzen 0. */
  delayMs?: number
  signal?: AbortSignal
}

/**
 * Liefert regional/saisonal passende Live-Arten, eingestuft + normalisiert.
 * Gibt [] zurück bei leichtem Modus (diff < 2) oder wenn nichts gefunden wird.
 * Wirft NIE – Fehler je Gruppe werden übersprungen (Spiel bleibt erstellbar).
 */
export async function getRegionalSpecies(opts: RegionalOptions): Promise<WaldObjekt[]> {
  const { lat, lng, ctx, diff } = opts
  if (diff < 2) return []

  const months = seasonToMonths(ctx.season)
  const key = speciesCacheKey(lat, lng, months[0], diff)
  const cached = await getCachedSpecies(key)
  // Leere Treffer NICHT als gültigen Cache behandeln (sonst „vergiftet" ein
  // früherer Fehlversuch den Ort dauerhaft) → nur nicht-leere Caches nutzen.
  if (cached && cached.length) return cached

  const radiusKm = opts.radiusKm ?? DEFAULT_RADIUS_KM
  const band = bandForMode(diff)
  const all: WaldObjekt[] = []

  for (let gi = 0; gi < GROUPS.length; gi++) {
    const g = GROUPS[gi]
    let counts: SpeciesCount[] = []
    try {
      counts = await fetchGroup(lat, lng, radiusKm, months, g.iconic, opts.signal)
    } catch {
      continue // Gruppe übersprungen, weiter mit der nächsten
    }
    if (counts.length) {
      const classify = difficultyClassifier(counts.map((c) => c.count))
      for (const sc of counts) {
        const obj = normalize(sc, g.kategorie, classify, ctx)
        if (obj && band.has(obj.schwierigkeit)) all.push(obj)
      }
    }
    const delay = opts.delayMs ?? GROUP_DELAY_MS
    if (gi < GROUPS.length - 1 && delay > 0) await sleep(delay)
  }

  // Nur nicht-leere Ergebnisse cachen (kein Vergiften bei Fehlversuch/offline).
  if (all.length) await putCachedSpecies(key, all)
  return all
}

/**
 * Wärmt den Bild-Cache (Service Worker "arten-medien") vor, damit das Spiel
 * offline alle Medien zeigt. Best-effort; Fehler werden ignoriert.
 */
export async function prefetchMedia(urls: string[]): Promise<void> {
  await Promise.allSettled(
    urls.map((u) => fetch(u, { mode: 'no-cors' }).catch(() => undefined)),
  )
}
