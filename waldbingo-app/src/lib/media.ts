// Darstellung der Bingo-Felder: Piktogramm (leicht, OpenMoji) bzw. echtes
// iNaturalist-Foto (mittel & schwer) für live geholte Arten.
import type { Kategorie, MediaKind, ObjektMedia } from '../data/types'

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

/** Echtes Foto (mittel & schwer). */
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

/** Braucht ein Medium eine sichtbare Attribution (nicht bei CC0/PD)? */
export function needsAttribution(media: ObjektMedia | undefined): boolean {
  if (!media || !media.attribution) return false
  const lic = (media.license ?? '').toLowerCase()
  return !NO_ATTRIBUTION_LICENSES.has(lic)
}

/** Welche Darstellungsstufe gilt für eine Live-Art im gegebenen Modus? */
export function mediaKindForMode(diff: number): MediaKind {
  return diff >= 2 ? 'foto' : 'piktogramm'
}
