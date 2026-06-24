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

## Zusammen spielen (mehrere Geräte)

Mehrere Leute können auf **mehreren Handys** dasselbe Bingo spielen – jeder mit
**denselben Arten, aber eigener Kartenreihenfolge**. Es gibt **keinen Live-Sync**:
Jeder hakt offline auf seinem Gerät ab (passt zum Wald ohne Empfang).

**Ablauf:**
1. Host erstellt ein Bingo (Spieleranzahl auf die Gruppengröße stellen).
2. Im Spiel **„Mitspieler einladen"** öffnen. Es gibt zwei Wege:
   - **Kurzer Code** (z. B. `K7P2QF`) – braucht den Server (siehe unten).
   - **Link / QR-Code** – enthält das ganze Spiel selbst, funktioniert ohne Server.
3. Gast tippt unter **„Einem Spiel beitreten"** den Code ein **oder** öffnet Link/scannt QR.
4. Gast wählt **„Welcher Spieler bist du?"** → spielt als Spieler 2/3/… offline weiter.

Die Kartenreihenfolge wird erst **beim Beitreten** aus Pool + Seed + Spielernummer
berechnet (`cardsForGame` in `src/lib/generator.ts`) – deterministisch, daher auf
jedem Gerät identisch.

### Einladungs-Server

`server/index.js` ist ein kleiner Express-Dienst, der **dieselbe App** (`dist/`) **und**
eine Mini-API ausliefert (`POST /api/games` → Code, `GET /api/games/:code` → Spiel).
Gespeichert wird dateibasiert (JSON, TTL 14 Tage) – keine native Abhängigkeit.

```bash
npm run build      # erzeugt dist/
npm run start      # = node server/index.js (liefert dist/ + /api)
# Dev: in einem Terminal `npm run server`, im anderen `npm run dev` (Proxy /api ist gesetzt)
```

Env-Variablen: `PORT` (Standard 8787), `DATA_DIR` (Speicherort der Spiele).

> **Railway:** Für dauerhafte Codes über Redeploys/Neustarts ein **Volume** mounten und
> `DATA_DIR` auf den Mount-Pfad setzen. Ohne Volume gehen gespeicherte Codes bei einem
> Neustart verloren – der **Link/QR-Weg ist davon nicht betroffen** (kein Server-Speicher).

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

Nutzerkonten, Freundesliste und **Live-Spielstand** (gegenseitiger Fortschritt in Echtzeit,
„wer hat zuerst Bingo") – das ist Phase 3/4 und braucht ein dauerhaftes Backend.
Das geräteübergreifende **Beitreten** (gleiche Karten, eigene Reihenfolge, ohne Live-Sync)
ist seit der Mehrgeräte-Funktion umgesetzt (siehe „Zusammen spielen").
