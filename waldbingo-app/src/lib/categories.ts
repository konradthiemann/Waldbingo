import type { Kategorie } from '../data/types'

/** Kategorie-Farben (Modal-Pille, Medien-Rahmen) – aus dem Prototyp. */
export const CAT_COLOR: Record<Kategorie, string> = {
  Tier: '#c4702f',
  Vogel: '#3f7fb8',
  Insekt: '#e8913c',
  Pflanze: '#2f9e54',
  Baum: '#8a5a36',
  Pilz: '#d8564c',
  Spur: '#6e787d',
  Landschaft: '#2f9e8e',
}

export const catColor = (k: Kategorie): string => CAT_COLOR[k] ?? '#2f7d4f'
