// Visueller Schwierigkeits-Gradient: Piktogramm (leicht) → Illustration (mittel)
// → Foto (schwer). Dieser Resolver liefert die Darstellung für live geholte Arten.
//
// Illustrations-Stufe OHNE KI:
//   1. Wikimedia Commons (gemeinfreies Bild via Wikidata P18) – echte Zeichnung
//      wenn vorhanden (beste Abdeckung für heimische Arten).
//   2. Fallback: iNaturalist-Foto, per CSS/SVG posterisiert ("gemalt"-Look) –
//      immer verfügbar, konsistent.
import type { Kategorie, MediaKind, ObjektMedia } from '../data/types'
import { getCachedMedia, putCachedMedia } from './db'

/** Repräsentatives kuratiertes Piktogramm je Kategorie (Fallback-Icon). */
export function categoryFallbackIconId(kategorie: Kategorie): string {
  switch (kategorie) {
    case 'Pilz':
      return 'pilz'
    case 'Vogel':
      return 'specht'
    case 'Insekt':
      return 'kaefer'
    case 'Tier':
      return 'reh'
    case 'Baum':
      return 'baumrinde'
    case 'Spur':
      return 'pfotenabdruck'
    case 'Landschaft':
      return 'steine'
    case 'Pflanze':
    default:
      return 'blatt'
  }
}

export interface INatPhoto {
  url?: string
  medium_url?: string
  square_url?: string
  attribution?: string
  license_code?: string
}

function bestPhotoUrl(photo: INatPhoto | undefined): string | null {
  if (!photo) return null
  return photo.medium_url || photo.url || photo.square_url || null
}

const NO_ATTRIBUTION_LICENSES = new Set(['cc0', 'pd', 'no rights reserved'])

/** Stilisiertes Foto als Illustrations-Fallback (immer verfügbar). */
export function paintedPhotoMedia(photo: INatPhoto | undefined): ObjektMedia | null {
  const url = bestPhotoUrl(photo)
  if (!url) return null
  return {
    kind: 'illustration',
    url,
    painted: true,
    source: 'iNaturalist (stilisiert)',
    attribution: photo?.attribution,
    license: photo?.license_code,
  }
}

/** Echtes Foto (schwerste Stufe). */
export function photoMedia(photo: INatPhoto | undefined): ObjektMedia | null {
  const url = bestPhotoUrl(photo)
  if (!url) return null
  return {
    kind: 'foto',
    url,
    source: 'iNaturalist',
    attribution: photo?.attribution,
    license: photo?.license_code,
  }
}

const SPARQL = 'https://query.wikidata.org/sparql'

/**
 * Sucht eine gemeinfreie Commons-Illustration zur Art (Wikidata P18).
 * Best-effort, mit Dexie-Cache. Liefert null, wenn nichts gefunden/offline.
 */
export async function resolveCommonsIllustration(
  taxonId: number,
  scientificName: string,
  signal?: AbortSignal,
): Promise<ObjektMedia | null> {
  const cached = await getCachedMedia(taxonId)
  if (cached) {
    return {
      kind: 'illustration',
      url: cached.url,
      attribution: cached.attribution,
      license: cached.license,
      source: cached.source,
    }
  }
  try {
    const query = `SELECT ?image WHERE { ?item wdt:P225 "${scientificName.replace(/"/g, '')}". ?item wdt:P18 ?image. } LIMIT 1`
    const url = `${SPARQL}?format=json&query=${encodeURIComponent(query)}`
    const r = await fetch(url, {
      signal,
      headers: { Accept: 'application/sparql-results+json' },
    })
    if (!r.ok) return null
    const j = (await r.json()) as {
      results?: { bindings?: Array<{ image?: { value?: string } }> }
    }
    const raw = j.results?.bindings?.[0]?.image?.value
    if (!raw) return null
    const thumb = raw.replace(/^http:/, 'https:') + '?width=320'
    await putCachedMedia({
      taxonId,
      url: thumb,
      attribution: 'Wikimedia Commons',
      license: 'Public Domain / CC',
      source: 'Wikimedia Commons',
    })
    return {
      kind: 'illustration',
      url: thumb,
      attribution: 'Wikimedia Commons',
      license: 'Public Domain / CC',
      source: 'Wikimedia Commons',
    }
  } catch {
    return null
  }
}

/** Braucht ein Medium eine sichtbare Attribution (nicht bei CC0/PD)? */
export function needsAttribution(media: ObjektMedia | undefined): boolean {
  if (!media || !media.attribution) return false
  const lic = (media.license ?? '').toLowerCase()
  return !NO_ATTRIBUTION_LICENSES.has(lic)
}

/** Welche Darstellungsstufe gilt für eine Live-Art im gegebenen Modus? */
export function mediaKindForMode(diff: number): MediaKind {
  if (diff >= 3) return 'foto'
  if (diff === 2) return 'illustration'
  return 'piktogramm'
}
