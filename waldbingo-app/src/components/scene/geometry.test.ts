import { describe, expect, it } from 'vitest'
import {
  BACK_TREES,
  FAR_TREES,
  FIR_TIERS,
  firSnowBand,
  firTier,
  FLOWERS,
  MEADOW_EDGE,
  MID_TREES,
  seeded,
  smoothArea,
  STARS,
  tierHalfWidth,
  VIEW_W,
  yAt,
} from './geometry'

describe('geometry – Determinismus', () => {
  it('seeded liefert reproduzierbare Folgen in [0,1)', () => {
    const a = seeded(42)
    const b = seeded(42)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('Platzierungen decken die ganze Breite ab und sind stabil', () => {
    expect(FAR_TREES.length).toBeGreaterThan(40)
    expect(BACK_TREES.length).toBeGreaterThan(30)
    expect(Math.min(...FAR_TREES.map((t) => t.x))).toBeLessThan(40)
    expect(Math.max(...FAR_TREES.map((t) => t.x))).toBeGreaterThan(VIEW_W - 40)
    expect(STARS.length).toBe(120)
    expect(FLOWERS.every((f) => f.y >= yAt(MEADOW_EDGE, f.x))).toBe(true)
  })

  it('Handy-Mitte (x 790–1210) zeigt Laub- und Nadelbäume', () => {
    const center = MID_TREES.filter((t) => t.x > 790 && t.x < 1210)
    expect(center.some((t) => t.kind === 'fir')).toBe(true)
    expect(center.some((t) => t.kind !== 'fir')).toBe(true)
  })
})

describe('geometry – Pfade', () => {
  it('erzeugt gültige, geschlossene Pfade ohne NaN', () => {
    for (const t of FIR_TIERS) {
      expect(firTier(t)).toMatch(/^M.*Z$/)
      expect(firTier(t)).not.toContain('NaN')
    }
    expect(firSnowBand(FIR_TIERS[1], FIR_TIERS[0][1])).toMatch(/^M.*Z$/)
    expect(smoothArea(MEADOW_EDGE)).toMatch(/^M.*Z$/)
  })

  it('Etagen-Breite wächst von der Spitze zur Unterkante', () => {
    const t = FIR_TIERS[2]
    expect(tierHalfWidth(t, t[0])).toBeLessThan(tierHalfWidth(t, t[1]))
    expect(tierHalfWidth(t, t[1])).toBeLessThanOrEqual(t[2])
  })

  it('yAt interpoliert innerhalb der Stützpunkte', () => {
    const [x1, y1] = MEADOW_EDGE[1]
    const [x2, y2] = MEADOW_EDGE[2]
    const y = yAt(MEADOW_EDGE, (x1 + x2) / 2)
    expect(y).toBeGreaterThanOrEqual(Math.min(y1, y2))
    expect(y).toBeLessThanOrEqual(Math.max(y1, y2))
  })
})
