import { describe, expect, it } from 'vitest'
import { nameFit, tileName } from './tile-name'

const SHY = '­'

describe('tileName', () => {
  it('trennt nur an Wortfugen', () => {
    expect(tileName('Tannenzapfen')).toBe(`Tannen${SHY}zapfen`)
    expect(tileName('Wegweiser')).toBe(`Weg${SHY}weiser`)
    expect(tileName('Leeres Schneckenhaus')).toBe(`Leeres Schnecken${SHY}haus`)
  })

  it('lässt kurze Wörter und Wörter ohne bekannte Fuge unverändert', () => {
    expect(tileName('Moos')).toBe('Moos')
    expect(tileName('Kastanie')).toBe('Kastanie')
  })

  it('erkennt Grundwörter bei Live-Arten', () => {
    expect(tileName('Zitronenfalter')).toBe(`Zitronen${SHY}falter`)
    expect(tileName('Rotkehlchen')).toBe(`Rot${SHY}kehlchen`)
  })
})

describe('nameFit', () => {
  it('verkleinert lange Teilwörter, aber nicht unter 10 px', () => {
    expect(nameFit('Moos').scale).toBe(1)
    expect(nameFit('Schmetterling').scale).toBeLessThan(1)
    expect(nameFit('Schmetterling').min).toBe(10)
  })

  it('erlaubt drei Zeilen nur für lange Namen aus mehreren Wörtern', () => {
    expect(nameFit('Leeres Schneckenhaus').lines).toBe(3)
    expect(nameFit('Eichhörnchen').lines).toBe(2)
  })
})
