# Waldbingo-App (PWA)

Die Waldbingo-App ist ein lauffähiger Prototyp der neuen, offline-fähigen
Progressive Web App (Vite + React + TypeScript). Sie erzeugt **dynamische
Bingokarten**, die sich an **Jahreszeit, Wetter, Tageszeit und Habitat**
anpassen – mit Abhaken, „Mehr-Infos" und Druckansicht für **bis zu 10 Spieler**.
Sie funktioniert **vollständig offline**.

## Schnellstart

Die App liegt im Verzeichnis `waldbingo-app/` und nutzt den im
[Konzept](./konzept.md) gewählten Stack.

```bash
cd waldbingo-app
npm install
npm run dev      # Entwicklungs-Server (Vite)
npm run build    # Produktions-Build (installierbare PWA)
npm run preview  # Build lokal vorschauen
```

Wetter, Geolocation, Installierbarkeit und der Offline-Cache benötigen einen
`http(s)`-Kontext – also den Dev- oder Preview-Server, nicht das direkte Öffnen
der `index.html` per Doppelklick.

## Was schon funktioniert

- **Kontext wählen** mit sinnvollen Auto-Vorgaben (Jahreszeit & Tageszeit aus Datum/Uhrzeit).
- **„📍 Automatisch"** holt per Standort das aktuelle Wetter von Open-Meteo (online)
  und setzt die Wetterlage; offline einfach manuell wählen.
- **Dynamische Generierung** aus kuratierten Objekten: gefiltert nach Kontext,
  gewichtet (z. B. nach Regen mehr Schnecken/Pilze), ausgewogene Kategorien,
  reproduzierbar per Seed.
- **Spielen:** Felder antippen = abhaken, ❓ = Info-Karte mit „Was ist das? /
  Woran erkenne ich es? / Wusstest du?" (offline aus der Datenbank).
  Bingo-Erkennung (Reihe/Spalte/Diagonale).
- **Mehrspieler-Karten:** 1–10 Spieler, alle aus demselben Pool, je eigene Anordnung.
- **Drucken/PDF:** „Drucken" erzeugt alle Spielerkarten druckfertig; eine
  „Info-Begleitseite" druckt die Funde mit Kurzinfos (Offline-Infos auf Papier).
- **Piktogramme:** Einheitliche Vektor-Icons (SVG) in App **und** Druck; das Emoji
  dient nur noch als Fallback.

## Aufbau

| Datei / Ordner | Inhalt |
|---|---|
| `src/` | App-Quellcode (React-Komponenten, Generator-Logik, Daten-Layer) |
| `objects.json` | Kuratierte Objekt-Datenbank – die Datenquelle (siehe [Datenmodell](./datenmodell.md)) |
| `objects.data.js` | Dieselben Daten als Embed für die App (offline) |
| `build_data.py` | Generiert beide Dateien aus der gepflegten Liste **und** validiert die Tags |
| `pictograms.js` | Vektor-Piktogramme (SVG) für alle Objekte + UI-Glyphen |
| `sw.js`, `manifest.webmanifest` | PWA-Scaffolding (Offline-Cache, installierbar) |

## Datenbank erweitern

Neue Objekte in `build_data.py` ergänzen und `python3 build_data.py` ausführen –
das Skript validiert alle Tags gegen das [Schema](./datenmodell.md) und schreibt
`objects.json` + `objects.data.js` neu. So bleibt die Datenquelle konsistent.

## Noch nicht im Prototyp

Nutzerkonten, Freundesliste und „zusammen spielen" (Live-Spielstand) gehören zu
Phase 3/4 und benötigen das Supabase-Backend – siehe
[Roadmap & Arbeitspakete](./roadmap.md).
