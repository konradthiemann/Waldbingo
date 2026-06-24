# PDF-Generator (Python)

Das ursprüngliche Waldbingo ist ein eigenständiges Python-Skript, das mit
[`reportlab`](https://docs.reportlab.com/) ein druckfertiges DIN-A4-PDF mit
**vier zufällig angeordneten 5×5-Bingokarten** erzeugt – perfekt zum Ausdrucken
und Mitnehmen auf den nächsten Waldspaziergang.

## Features

- **25 Waldbegriffe** mit handgezeichneten Strichicons (rein vektoriell, keine externen Bilder)
- **4 Bingokarten** pro DIN-A4-Seite – jede mit einer anderen zufälligen Anordnung
- **Kindgerecht** – große Icons, lesbare Schrift, waldtypische Farben
- **Reproduzierbar** – optionaler Seed-Parameter für identische Ergebnisse
- **Keine externen Abhängigkeiten** außer `reportlab`

## Voraussetzungen

- **Python 3.8** oder neuer
- **pip** (Python-Paketmanager)

## Installation

```bash
git clone https://github.com/konradthiemann/Waldbingo.git
cd Waldbingo
pip install -r requirements.txt
```

Die einzige Abhängigkeit ist `reportlab` – eine leistungsfähige Python-Bibliothek
zur PDF-Erzeugung.

## Verwendung

Standard (4 Karten → `waldbingo.pdf`):

```bash
python waldbingo.py
```

Eigenen Dateinamen wählen:

```bash
python waldbingo.py -o mein_waldbingo.pdf
```

Reproduzierbare Karten mit Seed (gleicher Seed → gleiche Anordnung):

```bash
python waldbingo.py -s 42
```

### Alle Optionen

```
usage: waldbingo.py [-h] [-o OUTPUT] [-s SEED]

Waldbingo-Generator – erstellt ein PDF mit 4 zufälligen Bingokarten.

optional arguments:
  -h, --help            Hilfe anzeigen
  -o, --output OUTPUT   Ausgabedatei (Standard: waldbingo.pdf)
  -s, --seed SEED       Zufallsseed für reproduzierbare Karten (optional)
```

## Spielregeln

1. PDF ausdrucken und die 4 Karten auseinanderschneiden.
2. Jedes Kind bekommt **eine Karte** und einen **Stift**.
3. Im Wald nach den Dingen auf der Karte suchen und gefundene Felder **ankreuzen**.
4. **Wichtig:** Den Fund den Mitspielern zeigen oder beschreiben.

Wählt vor dem Spiel eine Gewinnbedingung:

| Variante | Beschreibung |
|----------|-------------|
| **Reihe** | 5 Felder in einer Reihe (horizontal, vertikal oder diagonal) |
| **Vollbild** | Alle 25 Felder sind angekreuzt |
| **4 Ecken** | Die vier Eckfelder sind angekreuzt |
| **T-Form** | Oberste Reihe + mittlere Spalte |
| **Ohne Wettbewerb** | Jeder spielt für sich – wer schafft die meisten Felder? |

## Aufbau

| Datei | Inhalt |
|---|---|
| `waldbingo.py` | Hauptskript: Layout, Randomisierung, PDF-Erzeugung, CLI |
| `icons.py` | 25 Strichicon-Zeichenfunktionen (reportlab Canvas) |
| `requirements.txt` | Python-Abhängigkeiten (`reportlab`) |

Die Strichicons in `icons.py` sind über das Dictionary `ICON_FUNCTIONS` per
Begriffsname aufrufbar und vektoriell – sie skalieren beim Drucken verlustfrei.
Diese Icons sind zugleich die Quelle für die nach SVG portierten Piktogramme der
[Waldbingo-App](./app.md).

## Drucktipps

- Auf **DIN A4** (210 × 297 mm) im **Hochformat** drucken.
- **Keine Skalierung** – im Druckdialog „Tatsächliche Größe" / 100 % wählen.
- **Dickeres Papier** (ab 120 g/m²) hält beim Waldspaziergang besser.
- Optional **laminieren** und mit abwischbarem Stift abhaken.
