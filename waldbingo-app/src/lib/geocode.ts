// Reverse-Geocoding (Nominatim) + Höhe (Open-Meteo Elevation).
// Beide rein optional/kosmetisch – Fehlschläge dürfen das Spiel nie blockieren.
import type { Habitat } from '../data/types'

export interface RegionInfo {
  /** Anzeigename, z. B. "Harz, Sachsen-Anhalt". */
  label: string
  state?: string
  locality?: string
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/** Koordinaten → Regionsname (für die Standort-Kachel). Nur online. */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<RegionInfo | null> {
  try {
    const url = `${NOMINATIM}?format=jsonv2&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&zoom=10&accept-language=de`
    const r = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!r.ok) return null
    const j = (await r.json()) as {
      address?: Record<string, string>
      name?: string
    }
    const a = j.address ?? {}
    const locality =
      a.city || a.town || a.village || a.municipality || a.county || j.name || undefined
    const state = a.state || undefined
    const label = [locality, state].filter(Boolean).join(', ') || 'Unbekannte Region'
    return { label, state, locality }
  } catch {
    return null
  }
}

const ELEVATION = 'https://api.open-meteo.com/v1/elevation'

/** Koordinaten → Höhe über NN (m). Für die Gebirgs-Erkennung. */
export async function fetchElevation(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<number | null> {
  try {
    const url = `${ELEVATION}?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}`
    const r = await fetch(url, { signal })
    if (!r.ok) return null
    const j = (await r.json()) as { elevation: number[] }
    return Array.isArray(j.elevation) ? j.elevation[0] ?? null : null
  } catch {
    return null
  }
}

/** Höhenschwelle, ab der "gebirge" als Habitat vorgeschlagen wird. */
export const GEBIRGE_ELEVATION_M = 600

export function suggestHabitatFromElevation(elevationM: number | null): Habitat | null {
  if (elevationM == null) return null
  return elevationM >= GEBIRGE_ELEVATION_M ? 'gebirge' : null
}
