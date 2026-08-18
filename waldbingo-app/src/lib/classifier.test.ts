import { describe, expect, it } from 'vitest'
import { matchesObject, type ClassifyResult } from './classifier'

function result(className: string, probability: number, kategorie: string | null): ClassifyResult {
  return {
    className,
    probability,
    kategorie: kategorie as ClassifyResult['kategorie'],
    matchLabels: kategorie ? [kategorie] : [],
  }
}

describe('matchesObject', () => {
  it('matches when category aligns with top prediction', () => {
    const results = [
      result('mushroom', 0.85, 'Pilz'),
      result('agaric', 0.10, 'Pilz'),
    ]
    const match = matchesObject(results, 'Pilz')
    expect(match.matched).toBe(true)
    expect(match.confidence).toBe(0.85)
  })

  it('does not match when category differs', () => {
    const results = [
      result('robin', 0.70, 'Vogel'),
      result('jay', 0.15, 'Vogel'),
    ]
    const match = matchesObject(results, 'Pilz')
    expect(match.matched).toBe(false)
  })

  it('ignores predictions below minConfidence', () => {
    const results = [
      result('mushroom', 0.03, 'Pilz'),
    ]
    const match = matchesObject(results, 'Pilz')
    expect(match.matched).toBe(false)
  })

  it('matches even if category is not top-1 but above threshold', () => {
    const results = [
      result('unknown thing', 0.40, null),
      result('ladybug', 0.30, 'Insekt'),
    ]
    const match = matchesObject(results, 'Insekt')
    expect(match.matched).toBe(true)
    expect(match.confidence).toBe(0.30)
  })

  it('returns label of best relevant result when no match', () => {
    const results = [
      result('keyboard', 0.60, null),
      result('robin', 0.20, 'Vogel'),
    ]
    const match = matchesObject(results, 'Pilz')
    expect(match.matched).toBe(false)
    expect(match.label).toBe('robin')
  })
})
