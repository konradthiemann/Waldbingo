# Waldbingo – Tag-Schema der Objekt-Datenbank

Jedes Bingo-Objekt in `objects.json` beschreibt einen Fund, den Kinder im Wald suchen
können. Über die Tags filtert und gewichtet der Generator, welche Objekte zur aktuellen
Situation (Ort, Jahreszeit, Wetter, Tageszeit) passen.

## Feldstruktur

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `id` | string (kebab-case) | ✅ | Eindeutiger Schlüssel, z. B. `eichhoernchen` |
| `name` | string | ✅ | Anzeigename auf der Karte |
| `kategorie` | enum | ✅ | Grobe Gruppe (für ausgewogene Mischung) |
| `emoji` | string | ✅ | Piktogramm-Platzhalter im Prototyp |
| `iconId` | string | ✅ | Verweis auf das spätere Vektor-SVG (gleicher Name wie `id`) |
| `jahreszeiten` | enum[] | ✅ | In welchen Jahreszeiten findbar |
| `wetter` | enum[] | ✅ | Bei welchen Wetterlagen findbar/wahrscheinlich |
| `tageszeit` | enum[] | ✅ | Zu welcher Tageszeit aktiv/sichtbar |
| `habitat` | enum[] | ✅ | In welchen Biotop-Typen vorkommend |
| `regionen` | enum[] | ✅ | Geografische Verbreitung |
| `schwierigkeit` | 1–3 | ✅ | 1 = leicht/häufig, 2 = mittel, 3 = Experte/selten |
| `gewicht` | number | ⬜ | Grundgewicht (Standard 1.0); höher = häufiger gezogen |
| `info.kurz` | string | ✅ | Ein-Satz-Beschreibung, kindgerecht |
| `info.erkennen` | string | ✅ | „Woran erkenne ich es?" |
| `info.wusstest_du` | string | ✅ | Ein überraschender Fakt |

## Kontrollierte Vokabulare

**`kategorie`**
`Tier` · `Vogel` · `Insekt` · `Pflanze` · `Baum` · `Pilz` · `Spur` · `Landschaft`

**`jahreszeiten`**
`fruehling` · `sommer` · `herbst` · `winter`

**`wetter`**
`klar` · `bewoelkt` · `regen` · `nach_regen` · `schnee` · `frost` · `wind` · `nebel`

> `nach_regen` ist eine bewusst eigene Lage: Schnecken, Pilze, Pfützen und Regenwürmer
> werden danach hochgewichtet.

**`tageszeit`**
`morgen` · `tag` · `abend` · `daemmerung` · `nacht`

**`habitat`**
`laubwald` · `nadelwald` · `mischwald` · `gewaesser` · `lichtung` · `feldrand` · `park` · `gebirge`

**`regionen`**
`DE-weit` · `nord` · `sued` · `gebirge` · `kueste`

> Im Prototyp ist fast alles `DE-weit`; das Feld ist für spätere regionale Feinjustierung
> (z. B. Alpen vs. Küste) vorbereitet.

**`schwierigkeit`**
`1` leicht (sehr häufig, für Kleine) · `2` mittel · `3` Experte (selten, für Größere)

## Wie der Generator filtert (Kurzfassung)

1. **Filtern:** Behalte Objekte, deren `jahreszeiten` die aktuelle Jahreszeit enthält
   UND deren `habitat` zum gewählten Habitat passt UND deren `tageszeit` passt.
   Wetter filtert weich (siehe Gewichtung), damit der Pool nie zu klein wird.
2. **Gewichten:** Score = `gewicht` × Wetter-Bonus × Schwierigkeits-Faktor (abhängig vom
   gewählten Alters-/Schwierigkeitsmodus). Passende Wetter-Tags geben Bonus
   (z. B. `nach_regen` → Schnecke/Pilz × 2.5).
3. **Mischen:** Ziehe 24–25 Objekte mit gewichteter Zufallsauswahl, aber begrenze pro
   Kategorie, damit keine Gruppe dominiert.
4. **Anordnen:** Verteile die gezogenen Objekte ins 5×5-Raster (Seed = reproduzierbar).
   Mehrere Spieler bekommen denselben Pool in unterschiedlicher Anordnung.

## Live-Arten (zur Laufzeit, ab v2)

Bei mittlerem/schwerem Schwierigkeitsgrad mischt die App zusätzlich **regional und
saisonal tatsächlich vorkommende Arten** aus der iNaturalist-API in den Pool
(`species_counts` nach `lat,lng,radius` + `month` + `iconic_taxa`). Diese Arten werden
**zur Laufzeit** ins selbe Objekt-Schema normalisiert (sie stehen *nicht* in
`objects.json`) und tragen zusätzlich folgende optionale Felder:

| Feld | Bedeutung |
|---|---|
| `_live` | `true` für live geholte Arten (sonst undefiniert) |
| `_taxonId` | iNaturalist-Taxon-ID (für Medien-/Info-Auflösung) |
| `_count` | Beobachtungs-Anzahl im Kontext → bestimmt `schwierigkeit` (Perzentil je Gruppe) |
| `_media` | Darstellung: `{ kind, url?, attribution?, license?, source?, painted? }` |

`id` folgt der Konvention `inat-<taxonId>`; `name` ist der **deutsche Trivialname**
(`preferred_common_name`, `locale=de`) — Arten ohne deutschen Namen, mit `count < 5` oder
mit Schutzstatus werden verworfen. `info.kurz` stammt aus der Wikipedia-Zusammenfassung,
`info.erkennen`/`info.wusstest_du` aus generischen **Kategorie-Vorlagen**
(`src/lib/info-templates.ts`) – alles **ohne KI**.

### Visueller Schwierigkeits-Gradient (`_media.kind`)

| Stufe | Darstellung | Quelle |
|---|---|---|
| `1` leicht | **Piktogramm** | kuratierte SVGs (`pictograms.js`) |
| `2` mittel | **Illustration** ("gemalt") | Wikimedia-Commons (gemeinfrei) → sonst stilisiertes iNaturalist-Foto (`painted`) |
| `3` schwer | **Foto** | iNaturalist `default_photo` (mit Attribution) |

> **Eine Quelle der Wahrheit bleibt `objects.json`.** Live-Arten sind eine additive
> Online-Veredelung; offline/ohne Standort fällt die App vollständig auf die kuratierte
> Datenbank zurück (immer spielbar, immer 25 Felder).
