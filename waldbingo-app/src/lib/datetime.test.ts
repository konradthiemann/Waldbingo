import { describe, expect, it } from 'vitest'
import { seasonFromDate, seasonToMonths, timeFromHour } from './datetime'

describe('seasonFromDate', () => {
  it.each([
    [new Date(2024, 2, 15), 'fruehling'],
    [new Date(2024, 4, 31), 'fruehling'],
    [new Date(2024, 5, 1), 'sommer'],
    [new Date(2024, 7, 15), 'sommer'],
    [new Date(2024, 8, 1), 'herbst'],
    [new Date(2024, 10, 30), 'herbst'],
    [new Date(2024, 11, 1), 'winter'],
    [new Date(2024, 0, 15), 'winter'],
    [new Date(2024, 1, 28), 'winter'],
  ])('maps %s to %s', (date, expected) => {
    expect(seasonFromDate(date)).toBe(expected)
  })
})

describe('timeFromHour', () => {
  it.each([
    [5, 'morgen'],
    [9, 'morgen'],
    [10, 'tag'],
    [16, 'tag'],
    [17, 'abend'],
    [19, 'abend'],
    [20, 'daemmerung'],
    [21, 'daemmerung'],
    [22, 'nacht'],
    [3, 'tag'],
  ])('maps hour %d to %s', (hour, expected) => {
    expect(timeFromHour(hour)).toBe(expected)
  })
})

describe('seasonToMonths', () => {
  it('returns correct months for each season', () => {
    expect(seasonToMonths('fruehling')).toEqual([3, 4, 5])
    expect(seasonToMonths('sommer')).toEqual([6, 7, 8])
    expect(seasonToMonths('herbst')).toEqual([9, 10, 11])
    expect(seasonToMonths('winter')).toEqual([12, 1, 2])
  })
})
