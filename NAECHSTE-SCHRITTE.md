# 🌲 Waldbingo – Nächste Schritte & Übergabe für den Code-Modus

Dieses Dokument ist zweigeteilt: **Teil A** ist der Plan (was, in welcher Reihenfolge,
mit welchem Ziel). **Teil B** ist ein fertiger **Copy-&-Paste-Prompt** für den Code-Modus,
der den gesamten Kontext enthält.

---

## Teil A · Plan

### Ausgangslage (was bereits existiert)

- `KONZEPT.md` – Gesamtkonzept & Architektur (PWA, offline-first, kuratierte DB, Multiplayer via Supabase).
- `waldbingo-app/` – lauffähiger **Vanilla-Prototyp**:
  - `index.html` – Kontextauswahl → dynamische 5×5-Karte → Abhaken → Info-Modal → Druck (bis 10 Spieler).
  - `objects.json` / `objects.data.js` – **55 kuratierte Objekte** mit Tags + Infotexten.
  - `build_data.py` – generiert & **validiert** die Datenbank gegen das Schema.
  - `SCHEMA.md` – Tag-Schema. `sw.js` + `manifest.webmanifest` – PWA-Scaffolding.
- `waldbingo.py` / `icons.py` – das alte reportlab-Skript mit **25 Vektor-Icons** (Quelle für die SVG-Portierung).

Die **Generator-Logik** (Filter → Gewichtung → Kategorie-Caps → Seed) ist erprobt und soll
1:1 übernommen werden. Die **Daten** (`objects.json`) und das **Schema** bleiben die Quelle der Wahrheit.

### Architektur-Entscheidung für den Code-Modus

Empfehlung: Vom Einzeldatei-Prototyp auf den im Konzept gewählten Stack migrieren, weil
Konten/Multiplayer (Phase 3/4) sonst nicht sauber umsetzbar sind:

- **Vite + React + TypeScript**, PWA via **vite-plugin-pwa** (Workbox).
- **Tailwind CSS** für UI, **Dexie.js** (IndexedDB) für Offline-Daten/Spielstände.
- **Supabase** (Auth + Postgres + Realtime) – erst ab AP 5, optional gekapselt.
- PDF clientseitig mit **jsPDF** (passt zur koordinatenbasierten Alt-Logik).

Die bewährte Generator-Funktion und `objects.json` werden direkt übernommen; der Prototyp
dient als funktionale Referenz. *(Falls du bewusst bei Vanilla-JS bleiben willst: Die
Arbeitspakete gelten genauso, nur ohne den Migrationsschritt in AP 1.)*

### Arbeitspakete (geordnet)

**AP 1 – Projektgerüst & Migration**
Vite+React+TS+Tailwind+PWA-Plugin aufsetzen. Generator-Logik aus `index.html` nach
`src/lib/generator.ts` portieren (mit Typen aus `SCHEMA.md`), `objects.json` als
typisierte Datenquelle einbinden. Ziel: Prototyp-Funktionen laufen im neuen Stack.
*Akzeptanz:* App startet via `npm run dev`, Karte wird generiert, Build erzeugt installierbare PWA.

**AP 2 – Offline-Datenhaltung**
`objects.json` beim ersten Start in IndexedDB (Dexie) laden; Spielstände
(aktive Karten, Abhak-Status) lokal persistieren, damit ein Spiel einen App-Neustart übersteht.
Service Worker cached App-Shell + Icons (cache-first), Wetter network-first.
*Akzeptanz:* Spiel im Flugmodus erstellen/fortsetzen funktioniert; Reload verliert keinen Stand.

**AP 3 – SVG-Piktogramme**
Die 25 reportlab-Icons aus `icons.py` nach SVG portieren (gleiche Formen/Farben), für die
~30 neuen Objekte im selben Stil ergänzen. `iconId` in den Daten auf die SVG-Datei mappen,
Emoji-Fallback behalten. Icons sind in App **und** PDF nutzbar.
*Akzeptanz:* Jedes Objekt zeigt sein SVG-Piktogramm; PDF nutzt dieselben Icons.

**AP 4 – Standort, Wetter & Ortpicker verfeinern**
Open-Meteo-Anbindung robuster (Caching des letzten Wetters, Fehlerzustände), Tageszeit-
Logik, Habitat-Vorschlag aus grober Position (optional via OSM/Overpass) mit manuellem
Offline-Ortpicker als verlässlicher Fallback.
*Akzeptanz:* Online wird Wetter automatisch gesetzt; offline ist alles manuell wählbar.

**AP 5 – Konten & Freunde (Supabase)**
Supabase-Projekt, Auth (E-Mail/Magic-Link). Tabellen `profiles`, `friendships` mit
**Row-Level-Security**. UI: Registrierung/Login, Profil, Freund per Code/Name hinzufügen,
Freundesliste. Konto bleibt **optional** (Einzelspiel/Druck ohne Login möglich).
*Akzeptanz:* Zwei Test-Accounts können sich befreunden; ohne Login bleibt die App nutzbar.

**AP 6 – Zusammen spielen (Realtime)**
Tabellen `games`, `game_players`, `game_cells`. Spiel erstellen (Kontext+Pool festlegen),
Freunde einladen / Code teilen, beitreten. Live-Spielstand via Supabase Realtime,
Gewinnregeln (Reihe/Vollbild/4 Ecken/T/koop), Background-Sync fürs Offline-Abhaken.
*Akzeptanz:* Zwei Geräte sehen Funde live; Offline-Abhaken synchronisiert beim Reconnect.

**AP 7 – Feinschliff**
Alters-/Schwierigkeitsmodi, Tageszeit-/Nachtmodus, optionale Wikipedia-„mehr lesen"-Links,
Sammelalbum gefundener Objekte, GBIF-Anreicherung (optional).

### Querschnitt / Leitplanken

- **Datenschutz (Kinder/DSGVO):** Standort nur grob nutzen und **nicht** dauerhaft speichern;
  Konten nur für Erwachsene; Datensparsamkeit; klare Einwilligungen. Vor AP 5/6 prüfen.
- **Secrets:** Supabase-Keys via `.env` (nicht committen). Nur der `anon`-Key im Client,
  Schutz über Row-Level-Security.
- **Eine Quelle der Wahrheit:** Inhalte nur in `objects.json` pflegen (`build_data.py` validiert);
  App und PDF teilen Daten **und** Icons.
- **Tests:** Generator als Unit-Test (immer 25 Felder, keine Duplikate, Kategorie-Caps,
  Seed reproduzierbar). Über mehrere Kontexte prüfen.

### Empfohlene Reihenfolge

AP 1 → 2 → 3 zuerst (solides, schönes Offline-Einzelspiel als App). Dann 4. Multiplayer
(5 → 6) als zweiter Block, wenn das Fundament steht. 7 laufend.

---

## Teil B · Prompt für den Code-Modus

> Kopiere den folgenden Block in den Code-Modus.

```
Kontext: Ich entwickle „Waldbingo", eine offline-fähige PWA für ein Wald-Suchspiel für
Kinder. Im Repo liegen bereits:
- KONZEPT.md (Gesamtkonzept/Architektur), NAECHSTE-SCHRITTE.md (dieser Plan).
- waldbingo-app/: ein lauffähiger Vanilla-Prototyp (index.html) mit erprobter
  Generator-Logik, dazu objects.json (55 kuratierte Objekte mit Tags+Infotexten),
  build_data.py (erzeugt+validiert die DB), SCHEMA.md (Tag-Schema), sw.js, manifest.
- waldbingo.py + icons.py: altes reportlab-Skript mit 25 Vektor-Icons (Quelle für SVG).

Ziel jetzt: Migration auf den Zielstack und ein solides Offline-Einzelspiel als App.
Stack: Vite + React + TypeScript + Tailwind + vite-plugin-pwa, Dexie.js für IndexedDB,
jsPDF für Druck. (Supabase erst später für Multiplayer.)

Bitte arbeite Arbeitspaket 1–3 aus NAECHSTE-SCHRITTE.md ab:
1) Projektgerüst aufsetzen; Generator-Logik aus waldbingo-app/index.html nach
   src/lib/generator.ts portieren (Typen aus SCHEMA.md ableiten), objects.json als
   typisierte Datenquelle einbinden. Prototyp-Funktionen (Kontextwahl, dynamische 5×5-Karte,
   Abhaken, Info-Modal, Druck bis 10 Spieler) im neuen Stack nachbauen.
2) Offline: objects.json beim ersten Start in IndexedDB (Dexie) laden; Spielstände lokal
   persistieren (übersteht Reload/Neustart); Service Worker cached App-Shell+Icons cache-first,
   Open-Meteo network-first.
3) Die 25 Icons aus icons.py nach SVG portieren (gleiche Formen/Farben) und für die neuen
   Objekte im selben Stil ergänzen; iconId in den Daten auf die SVGs mappen, Emoji-Fallback.

Wichtig:
- objects.json bleibt die einzige Inhaltsquelle; build_data.py validiert weiter gegen das Schema.
- Generator als Unit-Test absichern: immer 25 Felder, keine Duplikate, Kategorie-Obergrenzen,
  Seed reproduzierbar – über mehrere Kontexte testen.
- Datenschutz: Standort nur grob, nicht persistent; App ohne Konto voll nutzbar.

Bevor du startest: lies KONZEPT.md, NAECHSTE-SCHRITTE.md, SCHEMA.md, waldbingo-app/index.html
und icons.py. Schlag mir kurz die Projektstruktur (Ordner/Dateien) vor und beginne dann mit AP 1.
```
