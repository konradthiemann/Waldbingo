# 🌲 Waldbingo-Generator

Ein Python-Skript, das druckfertige **Waldbingo-Karten** für Kinder als PDF erzeugt.  
Vier zufällig angeordnete 5×5-Bingokarten passen auf eine DIN-A4-Seite – perfekt zum Ausdrucken und Mitnehmen auf den nächsten Waldspaziergang!

[![CI](https://github.com/konradthiemann/Waldbingo/actions/workflows/ci.yml/badge.svg)](https://github.com/konradthiemann/Waldbingo/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white)
![reportlab](https://img.shields.io/badge/PDF-reportlab-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **25 Waldbegriffe** mit handgezeichneten Strichicons (rein vektoriell, keine externen Bilder)
- **4 Bingokarten** pro DIN-A4-Seite – jede mit einer anderen zufälligen Anordnung
- **Kindgerecht** – große Icons, lesbare Schrift, waldtypische Farben
- **Reproduzierbar** – optionaler Seed-Parameter für identische Ergebnisse
- **Keine externen Abhängigkeiten** außer `reportlab` – das Projekt ist komplett eigenständig

---

## 📋 Begriffsliste

Das Bingo enthält **25 Wald- und Naturbegriffe**, die Kinder auf einem Waldspaziergang suchen und abhaken können:

| Nr. | Begriff             | Nr. | Begriff             | Nr. | Begriff            |
|-----|---------------------|-----|---------------------|-----|--------------------|
| 1   | Spinnennetz         | 10  | Eichel              | 19  | Pilz               |
| 2   | Ameise              | 11  | Tannenzapfen        | 20  | Moos               |
| 3   | Farn                | 12  | Kastanie            | 21  | Brennnessel        |
| 4   | Schnecke            | 13  | Tierpfotenabdrücke  | 22  | Bank               |
| 5   | Blatt               | 14  | Feder               | 23  | Aussichtsturm      |
| 6   | Blume               | 15  | Eichhörnchen        | 24  | Klee               |
| 7   | Steine              | 16  | Käfer               | 25  | Biene              |
| 8   | Baumstumpf          | 17  | Vogel               |     |                    |
| 9   | Baumrinde           | 18  | Tannenzweig         |     |                    |

---

## 🔧 Voraussetzungen

- **Python 3.8** oder neuer
- **pip** (Python-Paketmanager)

---

## 🚀 Installation

```bash
# Repository klonen
git clone <repository-url>
cd Waldbingo

# Abhängigkeiten installieren
pip install -r requirements.txt
```

Die einzige Abhängigkeit ist [`reportlab`](https://docs.reportlab.com/) – eine leistungsfähige Python-Bibliothek zur PDF-Erzeugung.

---

## 📖 Verwendung

### Standard (4 Karten → `waldbingo.pdf`)

```bash
python waldbingo.py
```

### Eigenen Dateinamen wählen

```bash
python waldbingo.py -o mein_waldbingo.pdf
```

### Reproduzierbare Karten (mit Seed)

```bash
python waldbingo.py -s 42
```

Mit dem gleichen Seed werden immer dieselben Kartenanordnungen erzeugt – praktisch, wenn man z. B. ein bestimmtes Set erneut drucken möchte.

### Alle Optionen

```
usage: waldbingo.py [-h] [-o OUTPUT] [-s SEED]

Waldbingo-Generator – erstellt ein PDF mit 4 zufälligen Bingokarten.

optional arguments:
  -h, --help            Hilfe anzeigen
  -o, --output OUTPUT   Ausgabedatei (Standard: waldbingo.pdf)
  -s, --seed SEED       Zufallsseed für reproduzierbare Karten (optional)
```

---

## 🎯 Spielregeln

### Vorbereitung
1. PDF ausdrucken und die 4 Karten auseinanderschneiden
2. Jedes Kind bekommt **eine Karte** und einen **Stift**
3. Ab in den Wald! 🌳

### Spielablauf
1. Die Kinder gehen durch den Wald und halten Ausschau nach den Dingen auf ihrer Bingokarte
2. Sobald ein Kind etwas entdeckt, darf es das entsprechende Feld **ankreuzen** ✓
3. **Wichtig:** Das Kind muss den Fund den anderen Mitspielern zeigen oder beschreiben!

### Gewinnbedingungen (wählt vor dem Spiel eine aus)

| Variante | Beschreibung |
|----------|-------------|
| **Reihe** | 5 Felder in einer Reihe (horizontal, vertikal oder diagonal) |
| **Vollbild** | Alle 25 Felder sind angekreuzt |
| **4 Ecken** | Die vier Eckfelder sind angekreuzt |
| **T-Form** | Oberste Reihe + mittlere Spalte |
| **Ohne Wettbewerb** | Jeder spielt für sich – wer schafft die meisten Felder? |

### Tipps
- ⏱ **Zeitlimit** setzen (z. B. 45 Minuten), damit das Spiel ein Ende hat
- 👀 Genau hinschauen – manche Dinge verstecken sich gut!
- 📸 Funde fotografieren als Erinnerung
- 🤝 Jüngere Kinder können in Teams spielen

---

## 📁 Projektstruktur

```
Waldbingo/
├── waldbingo.py        # Hauptskript: Layout, Randomisierung, PDF-Erzeugung
├── icons.py            # 25 Strichicon-Zeichenfunktionen (reportlab Canvas)
├── requirements.txt    # Python-Abhängigkeiten (reportlab)
└── README.md           # Diese Dokumentation
```

### `waldbingo.py`
Das Hauptskript enthält die gesamte Logik:
- **Begriffsliste** mit allen 25 Waldbegriffen
- **Layout-Berechnung** für 4 Karten auf einer DIN-A4-Seite (2×2-Raster)
- **Zelllayout** – jede Zelle hat einen Icon-Bereich (oben, 62 %) und einen Textbereich (unten, 38 %)
- **Schriftgrößenanpassung** – lange Begriffe wie „Tierpfotenabdrücke" werden automatisch verkleinert
- **PDF-Erzeugung** über `reportlab.pdfgen.canvas`
- **CLI** mit `argparse` für Ausgabepfad und Seed

### `icons.py`
Enthält 25 Zeichenfunktionen, die jeweils ein minimalistisches Icon mit reportlab-Canvas-Primitiven zeichnen:
- Linien, Kreise, Ellipsen, Bézierkurven, Rechtecke, Pfade
- Waldtypische Farbpalette (Grün, Braun, Rot, Gelb, …)
- Alle Icons sind vektoriell – skalieren verlustfrei beim Drucken
- Über das Dictionary `ICON_FUNCTIONS` per Begriffsname aufrufbar

---

## 🎨 Anpassung

### Begriffe ändern
In `waldbingo.py` die Liste `BEGRIFFE` anpassen. Beachte:
- Es müssen **exakt 25 Begriffe** sein (für das 5×5-Raster)
- Für jeden Begriff muss in `icons.py` ein passender Eintrag im `ICON_FUNCTIONS`-Dictionary existieren
- Wenn kein Icon vorhanden ist, wird das Feld nur mit Text dargestellt

### Farben ändern
Die Farbkonstanten befinden sich am Anfang von `waldbingo.py` (Layout-Farben) und `icons.py` (Icon-Farben). Alle Farben sind als `HexColor` definiert und leicht austauschbar.

### Kartenzahl ändern
Das Layout ist aktuell auf **4 Karten pro Seite** (2×2) ausgelegt. Um die Anzahl zu ändern, müssten die Konstanten `CARDS_PER_ROW`, `CARDS_PER_COL` sowie die abhängigen Zellengrößen in `waldbingo.py` angepasst werden.

---

## 🖨 Drucktipps

- **Drucke auf DIN A4** (210 × 297 mm) im **Hochformat**
- **Keine Skalierung** – wähle im Druckdialog „Tatsächliche Größe" / 100 %
- **Dickeres Papier** (120 g/m² oder mehr) ist empfehlenswert, damit die Karten beim Waldspaziergang stabil bleiben
- Optional: Karten **laminieren** für Wiederverwendbarkeit (mit abwischbarem Stift abhaken)

---

## 📝 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](https://opensource.org/licenses/MIT).  
Frei verwendbar für Schulen, Kindergärten, Pfadfindergruppen und Familienausflüge.
