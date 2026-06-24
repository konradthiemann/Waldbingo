import type { Habitat, Jahreszeit, Tageszeit, Wetter } from '../data/types'

export const SEASON_LABEL: Record<Jahreszeit, string> = {
  fruehling: 'Frühling',
  sommer: 'Sommer',
  herbst: 'Herbst',
  winter: 'Winter',
}

export const WEATHER_LABEL: Record<Wetter, string> = {
  klar: 'Klar',
  bewoelkt: 'Bewölkt',
  regen: 'Regen',
  nach_regen: 'Nach Regen',
  schnee: 'Schnee',
  frost: 'Frost',
  wind: 'Wind',
  nebel: 'Nebel',
}

export const TIME_LABEL: Record<Tageszeit, string> = {
  morgen: 'Morgen',
  tag: 'Tag',
  abend: 'Abend',
  daemmerung: 'Dämmerung',
  nacht: 'Nacht',
}

export const HABITAT_LABEL: Record<Habitat, string> = {
  laubwald: 'Laubwald',
  nadelwald: 'Nadelwald',
  mischwald: 'Mischwald',
  gewaesser: 'Am Wasser',
  lichtung: 'Lichtung',
  feldrand: 'Feldrand',
  park: 'Park',
  gebirge: 'Gebirge',
}

export const DIFF_LABEL: Record<number, string> = { 1: 'Leicht', 2: 'Mittel', 3: 'Experte' }

export const SEASONS: Jahreszeit[] = ['fruehling', 'sommer', 'herbst', 'winter']
export const WEATHERS: Wetter[] = [
  'klar',
  'bewoelkt',
  'regen',
  'nach_regen',
  'schnee',
  'frost',
  'wind',
  'nebel',
]
export const TIMES: Tageszeit[] = ['morgen', 'tag', 'abend', 'daemmerung', 'nacht']
export const HABITATS: Habitat[] = [
  'laubwald',
  'nadelwald',
  'mischwald',
  'gewaesser',
  'lichtung',
  'feldrand',
  'park',
  'gebirge',
]
