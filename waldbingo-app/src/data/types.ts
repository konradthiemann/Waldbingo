// Typen abgeleitet aus SCHEMA.md (kontrollierte Vokabulare).

export type Kategorie =
  | 'Tier'
  | 'Vogel'
  | 'Insekt'
  | 'Pflanze'
  | 'Baum'
  | 'Pilz'
  | 'Spur'
  | 'Landschaft'

export type Jahreszeit = 'fruehling' | 'sommer' | 'herbst' | 'winter'

export type Wetter =
  | 'klar'
  | 'bewoelkt'
  | 'regen'
  | 'nach_regen'
  | 'schnee'
  | 'frost'
  | 'wind'
  | 'nebel'

export type Tageszeit = 'morgen' | 'tag' | 'abend' | 'daemmerung' | 'nacht'

export type Habitat =
  | 'laubwald'
  | 'nadelwald'
  | 'mischwald'
  | 'gewaesser'
  | 'lichtung'
  | 'feldrand'
  | 'park'
  | 'gebirge'

export type Region = 'DE-weit' | 'nord' | 'sued' | 'gebirge' | 'kueste'

export type Schwierigkeit = 1 | 2 | 3

export interface ObjektInfo {
  kurz: string
  erkennen: string
  wusstest_du: string
}

/** Darstellungsstufe (visueller Schwierigkeits-Gradient). */
export type MediaKind = 'piktogramm' | 'illustration' | 'foto'

export interface ObjektMedia {
  kind: MediaKind
  /** Bild-URL (Illustration/Foto). Bei Piktogramm leer (iconId wird genutzt). */
  url?: string
  attribution?: string
  license?: string
  /** Herkunft, z. B. "iNaturalist", "Wikimedia Commons", "PhyloPic". */
  source?: string
  /** true = Foto wird per CSS-Filter "gemalt" dargestellt (Illustrations-Fallback). */
  painted?: boolean
}

export interface WaldObjekt {
  id: string
  name: string
  kategorie: Kategorie
  emoji: string
  iconId: string
  jahreszeiten: Jahreszeit[]
  wetter: Wetter[]
  tageszeit: Tageszeit[]
  habitat: Habitat[]
  regionen: Region[]
  schwierigkeit: Schwierigkeit
  gewicht?: number
  info: ObjektInfo

  // ── Zusatzfelder für live geholte iNaturalist-Arten (optional) ──
  /** true, wenn live aus iNaturalist normalisiert (kein kuratiertes Objekt). */
  _live?: boolean
  /** iNaturalist-Taxon-ID (für Medien-/Info-Auflösung). */
  _taxonId?: number
  /** Beobachtungs-Anzahl der Art im Kontext (Häufigkeit). */
  _count?: number
  /** Aufgelöste Darstellung je Stufe. */
  _media?: ObjektMedia
}

/** Generator-internes Objekt mit Score. */
export type ScoredObjekt = WaldObjekt & { _w: number }

/** Spielkontext, der Pool + Gewichtung bestimmt. */
export interface SpielKontext {
  season: Jahreszeit
  weather: Wetter | null
  time: Tageszeit
  habitat: Habitat
}
