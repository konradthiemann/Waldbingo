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
