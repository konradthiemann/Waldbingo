import type { Jahreszeit, Tageszeit } from '../data/types'

/** Monat (1-12) → Jahreszeit. Portiert aus index.html seasonFromDate(). */
export function seasonFromDate(d: Date): Jahreszeit {
  const m = d.getMonth() + 1
  if (m >= 3 && m <= 5) return 'fruehling'
  if (m >= 6 && m <= 8) return 'sommer'
  if (m >= 9 && m <= 11) return 'herbst'
  return 'winter'
}

/** Stunde (0-23) → Tageszeit. Portiert aus index.html timeFromHour(). */
export function timeFromHour(h: number): Tageszeit {
  if (h >= 5 && h < 10) return 'morgen'
  if (h < 17) return 'tag'
  if (h < 20) return 'abend'
  if (h < 22) return 'daemmerung'
  return 'nacht'
}

/** Jahreszeit → Monatsliste für die iNaturalist-Abfrage (?month=9,10,11). */
export function seasonToMonths(season: Jahreszeit): number[] {
  switch (season) {
    case 'fruehling':
      return [3, 4, 5]
    case 'sommer':
      return [6, 7, 8]
    case 'herbst':
      return [9, 10, 11]
    case 'winter':
      return [12, 1, 2]
  }
}
