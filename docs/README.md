# Waldbingo

Waldbingo erzeugt druckfertige **Wald-Bingo-Karten** für Kinder – einmal als
eigenständiger **PDF-Generator** (Python) und einmal als offline-fähige,
kontextadaptive **Progressive Web App** (Vite + React + TypeScript).

Diese Dokumentation spiegelt die Markdown-Dateien aus `docs/` im Repository.
Die Quelldateien sind bewusst frontmatter-frei und damit sowohl direkt auf
GitHub als auch von KI-Werkzeugen lesbar.

## Überblick

- **PDF-Generator** – das klassische Python-Skript erzeugt vier zufällig
  angeordnete 5×5-Bingokarten auf einer DIN-A4-Seite mit handgezeichneten,
  rein vektoriellen Strichicons.
- **Waldbingo-App (PWA)** – generiert dynamische Karten, deren Felder zu
  Jahreszeit, Wetter, Tageszeit und Habitat passen; mit Abhaken, „Mehr-Infos"
  und Druckansicht für bis zu 10 Spieler. Funktioniert vollständig offline.

## Dokumentation

- [PDF-Generator](./generator.md) – Installation, CLI-Nutzung und Spielregeln des Python-Skripts.
- [Waldbingo-App (PWA)](./app.md) – Schnellstart, Funktionsumfang und Aufbau des App-Prototyps.
- [Konzept & Architektur](./konzept.md) – Vision, Plattform-Entscheidung und Architekturdiagramm.
- [Datenmodell & Tag-Schema](./datenmodell.md) – Aufbau der kuratierten Objekt-Datenbank.
- [Roadmap & Arbeitspakete](./roadmap.md) – Migrationsplan und geplante Ausbaustufen.
