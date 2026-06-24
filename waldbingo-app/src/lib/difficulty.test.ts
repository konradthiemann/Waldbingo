import { describe, expect, it } from 'vitest'
import { bandForMode, difficultyClassifier } from './difficulty'

describe('difficultyClassifier', () => {
  it('stuft häufige Arten als leicht (1), seltene als schwer (3) ein', () => {
    const counts = [1000, 800, 500, 200, 80, 40, 20, 8, 5]
    const classify = difficultyClassifier(counts)
    expect(classify(1000)).toBe(1) // sehr häufig
    expect(classify(5)).toBe(3) // selten
    expect(classify(80)).toBeGreaterThanOrEqual(1)
    expect(classify(80)).toBeLessThanOrEqual(3)
  })

  it('ist robust bei leerer Verteilung', () => {
    const classify = difficultyClassifier([])
    expect([1, 2, 3]).toContain(classify(100))
  })
})

describe('bandForMode', () => {
  it('mittel akzeptiert häufige/mittlere Arten (1,2)', () => {
    const b = bandForMode(2)
    expect(b.has(1)).toBe(true)
    expect(b.has(2)).toBe(true)
    expect(b.has(3)).toBe(false)
  })
  it('schwer akzeptiert alle Arten (reine Foto-Karte füllen)', () => {
    const b = bandForMode(3)
    expect(b.has(1)).toBe(true)
    expect(b.has(2)).toBe(true)
    expect(b.has(3)).toBe(true)
  })
  it('leicht akzeptiert keine Live-Arten', () => {
    expect(bandForMode(1).size).toBe(0)
  })
})
