# 🌲 Waldbingo – PWA-Prototyp

Lauffähiger Prototyp der neuen Waldbingo-App: dynamische Bingokarten, die sich an
**Jahreszeit, Wetter, Tageszeit und Habitat** anpassen – mit Abhaken, „Mehr-Infos"
und Druckansicht für **bis zu 10 Spieler**. Funktioniert **vollständig offline**.

## Schnellstart

**Einfach:** `index.html` doppelklicken → läuft sofort im Browser (Kartenerstellung,
Abhaken, Infos, Druck). Wetter/Standort und die Installierbarkeit als App brauchen einen
lokalen Server (siehe unten), weil Browser dafür `http(s)` verlangen.

**Voller PWA-Modus (Wetter, Geolocation, Installierbar, Offline-Cache):**
```bash
cd waldbingo-app
python3 -m http.server 8000
# dann im Browser öffnen: http://localhost:8000
```

## Was schon funktioniert

- **Kontext wählen** mit sinnvollen Auto-Vorgaben (Jahreszeit & Tageszeit aus Datum/Uhrzeit).
- **„📍 Automatisch"** holt per Standort das aktuelle Wetter von Open-Meteo (online) und
  setzt die Wetterlage; offline einfach manuell wählen.
- **Dynamische Generierung** aus 55 kuratierten Objekten: gefiltert nach Kontext,
  gewichtet (z. B. nach Regen mehr Schnecken/Pilze), ausgewogene Kategorien, reproduzierbar
  per Seed.
- **Spielen:** Felder antippen = abhaken, ❓ = Info-Karte mit „Was ist das? / Woran erkenne
  ich es? / Wusstest du?" (offline aus der Datenbank). Bingo-Erkennung (Reihe/Spalte/Diagonale).
- **Mehrspieler-Karten:** 1–10 Spieler, alle aus demselben Pool, je eigene Anordnung.
- **Drucken/PDF:** „Drucken" erzeugt alle Spielerkarten druckfertig (Browser-Druckdialog →
  „Als PDF speichern"); „Info-Begleitseite" druckt die Funde mit Kurzinfos (Offline-Infos auf Papier).
- **Piktogramme:** Alle 55 Objekte haben ein einheitliches Vektor-Icon (SVG, `pictograms.js`) –
  in App **und** Druck; das Emoji dient nur noch als Fallback, falls ein Icon fehlt.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Die komplette App (UI + Logik), eigenständig |
| `pictograms.js` | Vektor-Piktogramme (SVG) für alle 55 Objekte + UI-Glyphen (App & Druck) |
| `objects.json` | Kuratierte Objekt-Datenbank (55 Einträge) – die Datenquelle |
| `objects.data.js` | Dieselben Daten als Embed für die App (offline) |
| `build_data.py` | Generiert beide Dateien aus der gepflegten Liste + validiert die Tags |
| `SCHEMA.md` | Dokumentation des Tag-Schemas |
| `sw.js`, `manifest.webmanifest` | PWA-Scaffolding (Offline-Cache, installierbar) |

## Datenbank erweitern

Neue Objekte in `build_data.py` ergänzen und `python3 build_data.py` ausführen – das
Skript validiert alle Tags gegen das Schema und schreibt `objects.json` + `objects.data.js`
neu. So bleibt die App-Datenquelle immer konsistent.

## Noch nicht im Prototyp (laut Konzept-Roadmap)

Nutzerkonten, Freundesliste und „zusammen spielen" (Live-Spielstand) – das ist Phase 3/4
und braucht das Supabase-Backend.
