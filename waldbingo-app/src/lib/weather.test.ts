import { describe, expect, it } from 'vitest'
import { mapWeatherCode, weatherCodeLabel } from './weather'

describe('mapWeatherCode', () => {
  it('maps clear sky to klar', () => {
    expect(mapWeatherCode(0)).toBe('klar')
  })

  it('maps cloud codes to bewoelkt', () => {
    expect(mapWeatherCode(1)).toBe('bewoelkt')
    expect(mapWeatherCode(2)).toBe('bewoelkt')
    expect(mapWeatherCode(3)).toBe('bewoelkt')
  })

  it('maps fog codes to nebel', () => {
    expect(mapWeatherCode(45)).toBe('nebel')
    expect(mapWeatherCode(48)).toBe('nebel')
  })

  it('maps rain codes to regen', () => {
    expect(mapWeatherCode(61)).toBe('regen')
    expect(mapWeatherCode(63)).toBe('regen')
    expect(mapWeatherCode(95)).toBe('regen')
  })

  it('maps snow codes to schnee', () => {
    expect(mapWeatherCode(71)).toBe('schnee')
    expect(mapWeatherCode(75)).toBe('schnee')
    expect(mapWeatherCode(85)).toBe('schnee')
  })

  it('returns frost when temp <= 0 and no snow code', () => {
    expect(mapWeatherCode(0, -5)).toBe('frost')
    expect(mapWeatherCode(3, 0)).toBe('frost')
  })

  it('returns schnee for snow codes even with low temp', () => {
    expect(mapWeatherCode(71, -5)).toBe('schnee')
  })
})

describe('weatherCodeLabel', () => {
  it('returns human-readable labels', () => {
    expect(weatherCodeLabel(0)).toBe('Klar')
    expect(weatherCodeLabel(3)).toBe('Bewölkt')
    expect(weatherCodeLabel(61)).toBe('Regen')
    expect(weatherCodeLabel(71)).toBe('Schnee')
    expect(weatherCodeLabel(95)).toBe('Gewitter')
  })
})
