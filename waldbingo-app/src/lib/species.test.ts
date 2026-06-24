/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Dexie/IndexedDB im Test umgehen – Cache wird gemockt.
vi.mock('./db', () => ({
  getCachedSpecies: vi.fn(async () => null),
  putCachedSpecies: vi.fn(async () => undefined),
  speciesCacheKey: () => 'test-key',
  getCachedMedia: vi.fn(async () => undefined),
  putCachedMedia: vi.fn(async () => undefined),
}))

import type { SpielKontext } from '../data/types'
import { getRegionalSpecies } from './species'

const ctx: SpielKontext = {
  season: 'herbst',
  weather: 'nach_regen',
  time: 'tag',
  habitat: 'mischwald',
}

function resp(results: unknown[]) {
  return { ok: true, json: async () => ({ results }) } as unknown as Response
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getRegionalSpecies', () => {
  it('normalisiert Arten und verwirft namenlose, zu seltene und sensible', async () => {
    const fungi = [
      {
        count: 500,
        taxon: {
          id: 1,
          name: 'Amanita muscaria',
          preferred_common_name: 'Fliegenpilz',
          default_photo: { medium_url: 'http://x/p1.jpg', attribution: '© A', license_code: 'cc-by' },
          wikipedia_summary: '<p>Ein <b>roter</b> Pilz mit weißen Punkten.</p>',
        },
      },
      {
        count: 300,
        taxon: { id: 2, name: 'Boletus edulis', preferred_common_name: 'Steinpilz', default_photo: { medium_url: 'http://x/p2.jpg' } },
      },
      { count: 200, taxon: { id: 3, name: 'NoName sp.', default_photo: { medium_url: 'http://x/p3.jpg' } } },
      { count: 2, taxon: { id: 4, name: 'Selten sp.', preferred_common_name: 'Seltling', default_photo: {} } },
      {
        count: 400,
        taxon: { id: 5, name: 'Protected sp.', preferred_common_name: 'Geschützt', conservation_status: { status: 'EN' }, default_photo: {} },
      },
    ]
    global.fetch = vi.fn(async (url: any) =>
      String(url).includes('iconic_taxa=Fungi') ? resp(fungi) : resp([]),
    ) as any

    const species = await getRegionalSpecies({ lat: 51.79, lng: 10.62, ctx, diff: 2, delayMs: 0 })
    const names = species.map((s) => s.name)

    expect(names).toContain('Fliegenpilz')
    expect(names).toContain('Steinpilz')
    expect(names).not.toContain('Seltling') // count < 5 verworfen
    expect(names).not.toContain('Geschützt') // sensibel verworfen
    expect(species.find((s) => !s.name)).toBeUndefined() // keine namenlosen

    for (const s of species) {
      expect(s._live).toBe(true)
      expect(s.kategorie).toBe('Pilz')
      expect(s.id.startsWith('inat-')).toBe(true)
      expect(s.info.kurz.length).toBeGreaterThan(0)
    }

    const fp = species.find((s) => s.name === 'Fliegenpilz')!
    expect(fp._media?.kind).toBe('illustration') // mittel → Illustration
    expect(fp._media?.painted).toBe(true)
    expect(fp.info.kurz).toContain('roter') // HTML aus wikipedia_summary gestrippt
  })

  it('liefert [] im leichten Modus (diff 1) ohne Netz-Call', async () => {
    global.fetch = vi.fn() as any
    const species = await getRegionalSpecies({ lat: 1, lng: 2, ctx, diff: 1, delayMs: 0 })
    expect(species).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('liefert Fotos im schweren Modus (diff 3)', async () => {
    const fungi = [
      { count: 50, taxon: { id: 10, name: 'Boletus edulis', preferred_common_name: 'Steinpilz', default_photo: { medium_url: 'http://x/p.jpg', license_code: 'cc0' } } },
      { count: 8, taxon: { id: 11, name: 'Rare sp.', preferred_common_name: 'Seltling', default_photo: { medium_url: 'http://x/q.jpg' } } },
    ]
    global.fetch = vi.fn(async (url: any) =>
      String(url).includes('iconic_taxa=Fungi') ? resp(fungi) : resp([]),
    ) as any
    const species = await getRegionalSpecies({ lat: 51, lng: 10, ctx, diff: 3, delayMs: 0 })
    expect(species.length).toBeGreaterThan(0)
    for (const s of species) expect(s._media?.kind).toBe('foto')
  })

  it('bleibt stabil, wenn die API fehlschlägt (gibt [] zurück)', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down')
    }) as any
    const species = await getRegionalSpecies({ lat: 51, lng: 10, ctx, diff: 2, delayMs: 0 })
    expect(species).toEqual([])
  })
})
