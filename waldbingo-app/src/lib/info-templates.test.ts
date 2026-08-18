import { describe, expect, it } from 'vitest'
import { buildInfo, summaryToKurz } from './info-templates'

describe('buildInfo', () => {
  it('uses provided kurz text when available', () => {
    const info = buildInfo('Pilz', 'Ein roter Pilz.')
    expect(info.kurz).toBe('Ein roter Pilz.')
    expect(info.erkennen.length).toBeGreaterThan(0)
    expect(info.wusstest_du.length).toBeGreaterThan(0)
  })

  it('falls back to generic kurz when null', () => {
    const info = buildInfo('Vogel', null)
    expect(info.kurz).toContain('Vogel')
  })

  it('falls back to generic kurz when empty', () => {
    const info = buildInfo('Tier', '  ')
    expect(info.kurz).toContain('Tier')
  })
})

describe('summaryToKurz', () => {
  it('strips HTML tags', () => {
    const result = summaryToKurz('<p>Ein <b>roter</b> Pilz.</p>')
    expect(result).toContain('roter')
    expect(result).not.toContain('<')
  })

  it('returns null for null/undefined input', () => {
    expect(summaryToKurz(null)).toBeNull()
    expect(summaryToKurz(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(summaryToKurz('')).toBeNull()
    expect(summaryToKurz('   ')).toBeNull()
  })

  it('truncates very long summaries', () => {
    const long = 'A'.repeat(300) + '.'
    const result = summaryToKurz(long)!
    expect(result.length).toBeLessThanOrEqual(220)
    expect(result.endsWith('…')).toBe(true)
  })

  it('strips citation references like [1]', () => {
    const result = summaryToKurz('Ein Pilz[1] mit Hut[23].')
    expect(result).not.toContain('[')
  })
})
