# Roadmap & Arbeitspakete

Der Weg vom Einzeldatei-Prototyp zur vollwertigen, offline-fähigen PWA mit
optionalem Multiplayer. Die erprobte Generator-Logik (Filter → Gewichtung →
Kategorie-Caps → Seed) und die kuratierten Daten (`objects.json`, siehe
[Datenmodell](./datenmodell.md)) bleiben dabei die Quelle der Wahrheit.

## Architektur-Entscheidung

Migration vom Einzeldatei-Prototyp auf den im [Konzept](./konzept.md) gewählten
Stack, weil Konten/Multiplayer sonst nicht sauber umsetzbar sind:

- **Vite + React + TypeScript**, PWA via **vite-plugin-pwa** (Workbox).
- **Tailwind CSS** für UI, **Dexie.js** (IndexedDB) für Offline-Daten/Spielstände.
- **Supabase** (Auth + Postgres + Realtime) – erst ab AP 5, optional gekapselt.
- PDF clientseitig mit **jsPDF** (passt zur koordinatenbasierten Alt-Logik).

## Arbeitspakete

**AP 1 – Projektgerüst & Migration.** Vite+React+TS+Tailwind+PWA-Plugin aufsetzen,
Generator-Logik nach `src/lib/generator.ts` portieren, `objects.json` als
typisierte Datenquelle einbinden.
*Akzeptanz:* App startet via `npm run dev`, Karte wird generiert, Build erzeugt
installierbare PWA.

**AP 2 – Offline-Datenhaltung.** `objects.json` beim ersten Start in IndexedDB
(Dexie) laden, Spielstände lokal persistieren; Service Worker cached App-Shell +
Icons (cache-first), Wetter network-first.
*Akzeptanz:* Spiel im Flugmodus erstellen/fortsetzen funktioniert; Reload verliert
keinen Stand.

**AP 3 – SVG-Piktogramme.** Die 25 reportlab-Icons aus `icons.py` nach SVG
portieren, neue Objekte im selben Stil ergänzen, `iconId` auf die SVG mappen,
Emoji-Fallback behalten.
*Akzeptanz:* Jedes Objekt zeigt sein SVG-Piktogramm; PDF nutzt dieselben Icons.

**AP 4 – Standort, Wetter & Ortpicker.** Open-Meteo-Anbindung robuster (Caching,
Fehlerzustände), Tageszeit-Logik, Habitat-Vorschlag aus grober Position mit
manuellem Offline-Ortpicker als Fallback.
*Akzeptanz:* Online wird Wetter automatisch gesetzt; offline ist alles manuell wählbar.

**AP 5 – Konten & Freunde (Supabase).** Auth (E-Mail/Magic-Link), Tabellen
`profiles`, `friendships` mit Row-Level-Security, UI für Registrierung/Login/Profil
und Freunde hinzufügen. Konto bleibt **optional**.
*Akzeptanz:* Zwei Test-Accounts können sich befreunden; ohne Login bleibt die App nutzbar.

**AP 6 – Zusammen spielen (Realtime).** Tabellen `games`, `game_players`,
`game_cells`. Spiel erstellen/beitreten per Code/Link, Live-Spielstand via Realtime,
Gewinnregeln (Reihe/Vollbild/4 Ecken/T/koop), Background-Sync fürs Offline-Abhaken.
*Akzeptanz:* Zwei Geräte sehen Funde live; Offline-Abhaken synchronisiert beim Reconnect.

**AP 7 – Feinschliff.** Alters-/Schwierigkeitsmodi, Tageszeit-/Nachtmodus,
optionale Wikipedia-„mehr lesen"-Links, Sammelalbum gefundener Objekte,
GBIF-Anreicherung.

## Querschnitt / Leitplanken

- **Datenschutz (Kinder/DSGVO):** Standort nur grob nutzen und **nicht** dauerhaft
  speichern; Konten nur für Erwachsene; Datensparsamkeit; vor AP 5/6 prüfen.
- **Secrets:** Supabase-Keys via `.env` (nicht committen). Nur der `anon`-Key im
  Client, Schutz über Row-Level-Security.
- **Eine Quelle der Wahrheit:** Inhalte nur in `objects.json` pflegen
  (`build_data.py` validiert); App und PDF teilen Daten **und** Icons.
- **Tests:** Generator als Unit-Test (immer 25 Felder, keine Duplikate,
  Kategorie-Caps, Seed reproduzierbar) über mehrere Kontexte prüfen.

## Empfohlene Reihenfolge

AP 1 → 2 → 3 zuerst (solides Offline-Einzelspiel als App), dann AP 4. Multiplayer
(AP 5 → 6) als zweiter Block, wenn das Fundament steht. AP 7 läuft begleitend.
