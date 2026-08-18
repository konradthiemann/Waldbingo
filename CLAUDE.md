# Waldbingo

## Projektbeschreibung

Waldbingo ist ein kontextadaptives Wald-Bingo-Suchspiel als offline-first PWA. Es generiert dynamische 5x5-Bingokarten, die sich an Jahreszeit, Wetter, Tageszeit und Habitat anpassen. Zusatzlich werden per iNaturalist-API regional vorkommende Arten live geholt. Mehrspieler ueber mehrere Geraete (kein Live-Sync, bewusste Entscheidung) per Einladungscode oder selbst-enthaltenem Link/QR. Dazu gibt es einen Python-PDF-Generator fuer druckbare Bingokarten.

## Tech-Stack

- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind CSS 3
- **Server**: Express 4 (statische PWA-Auslieferung + Einladungs-API)
- **Offline**: Workbox (via vite-plugin-pwa) + IndexedDB (Dexie)
- **Karte**: Leaflet + OpenStreetMap-Kacheln
- **APIs**: Open-Meteo (Wetter), iNaturalist (Arten), Nominatim (Geocoding)
- **Tests**: Vitest + jsdom
- **PDF-Generator**: Python 3.8+ + reportlab

## Projektstruktur

```
waldbingo-app/                  # Haupt-App (PWA + Server)
  server/index.js               # Express-Server: statisches dist/ + Einladungs-API (/api/games)
  src/
    main.tsx                    # React-Einstiegspunkt
    App.tsx                     # Root-Komponente: Routing (Dashboard/Game/Join/Legal)
    styles/index.css            # Tailwind-Basis + Animationen + Drucklayout
    data/
      types.ts                  # Zentrale Typen (WaldObjekt, SpielKontext, Kategorie etc.)
      objects.ts                # Kuratierter Objekt-Pool (re-exportiert objects.data.js)
      openmoji-codes.ts         # Set aller gebuendelten OpenMoji-Hex-Codes
    lib/
      generator.ts              # Bingo-Generator: seeded RNG, Filter, Gewichtung, Ziehung
      game-state.ts             # GameState-Typ, Konvertierung stored/shared
      share.ts                  # Kompakte Kodierung fuer Link/QR, URL-Parsing
      api.ts                    # Client fuer den Einladungs-Code-Server
      db.ts                     # IndexedDB-Persistenz (Dexie): Spiel, Arten-/Medien-Cache
      species.ts                # iNaturalist-Pipeline: regionale Arten holen + normalisieren
      difficulty.ts             # Haeufigkeit -> Schwierigkeit (Perzentil-basiert)
      weather.ts                # Open-Meteo-Anbindung, WMO-Code-Mapping
      geocode.ts                # Nominatim Reverse-Geocoding + Hoehendaten
      datetime.ts               # Jahreszeit/Tageszeit aus Datum/Uhrzeit
      labels.ts                 # Deutsche Labels fuer Enums (Jahreszeit, Wetter etc.)
      categories.ts             # Kategorie-Farben
      emoji.ts                  # Emoji -> OpenMoji-SVG-Pfad
      media.ts                  # Medien-Aufloesung (Foto vs. Piktogramm)
      info-templates.ts         # Generische Info-Vorlagen je Kategorie
    hooks/
      useGeolocation.ts         # Browser Geolocation API
      useOnline.ts              # Online/Offline-Status
    icons/
      pictograms.ts             # Inline-SVG-Piktogramme
    components/
      Svg.tsx                   # SVG-Glyph-Komponente
      dashboard/                # Start-Dashboard (Standort, Karte, Wetter, Optionen)
      game/                     # Spielansicht (Grid, Zellen, Info-Modal, Medien)
      join/                     # Beitritts-Ansicht (Code-Eingabe)
      legal/                    # Impressum + Datenschutz
      print/                    # Druck-Layout
      share/                    # Einladungs-Modal (QR, Link, Code)
  public/emoji/                 # OpenMoji-SVGs (CC BY-SA 4.0)
  public/fonts/                 # Self-hosted Webfonts (falls vorhanden)
  objects.data.js               # Generierter Objekt-Pool (von build_data.py)
  objects.json                  # Gleicher Pool als JSON
  pictograms.js                 # Inline-SVG-Daten
  sw.js                         # Legacy-SW (wird durch vite-plugin-pwa/Workbox ersetzt)
  vite.config.ts                # Vite + React + PWA + Test-Konfiguration
  tailwind.config.ts            # Wald-Designsystem (Farben, Radii, Shadows)
waldbingo.py                    # Python PDF-Generator
icons.py                        # 25 reportlab-Canvas-Zeichenfunktionen
docs/                           # Doku-Quellen (Markdown)
docs-site/                      # Astro Starlight -> GitHub Pages
```

## Designsystem

### Farben/Tokens (tailwind.config.ts)
- **forest**: 900 `#14331f` / 800 `#1a4429` / 700 `#1f5b38` / 600 `#2f7d4f` / 500 `#3f9d63` / 300 `#8ed3a0` / 100 `#dcefe1`
- **bark**: `#a06d44`
- **amber**: `#e8913c` (600: `#c4702f`)
- **sun**: `#f3c44d`
- **ink**: `#1d2a22` (Textfarbe)
- **muted**: `#62716a` (sekundaerer Text)
- **line**: `#e3eae2` (Trennlinien), line-2: `#eef3ec`
- **wbg**: `#eaf1e8` (Hintergrund)
- **card**: `#ffffff`
- **ok**: `#2f9e54` (Erfolg)
- **kat-***: Kategorie-Farben (tier, vogel, insekt, pflanze, baum, pilz, spur, landschaft)

### Typografie
- Font: system-ui Stack (kein externer Font)
- Groessen: 11-24px, per Tailwind-Klassen (text-[Xpx])

### Spacing & Radii
- Spacing: Tailwind-Standard (px-3, py-2, gap-2 etc.)
- Border-Radius: sm=10px, DEFAULT=14px, lg=20px, xl=26px

### Shadows
- wb1: subtil (Karten), wb2: mittel (Modals), wb3: stark (Overlays)

### Layout-Muster
- max-w-[920px] zentriert, px-3/4, pb-12
- Sticky Header mit Gradient (forest-700 -> forest-900)
- Karten: weisse Karte mit border-line, rounded, shadow-wb1
- Animationen: anim-pop, anim-fade, anim-rise (mit prefers-reduced-motion)

### Komponenten-Patterns
- Buttons: rounded-full, font-bold, shadow-wb1, focus-ring
- Chips/Badges: rounded-full, text-[12px], font-semibold
- Modals: fixed overlay, anim-fade, rounded-lg, shadow-wb3
- Tiles: bg-white, border-line, rounded, shadow-wb1

## Code-Konventionen

- TypeScript strict, kein `any` (Ausnahme: Test-Mocks)
- React Functional Components mit `<script>`-freiem TSX
- Composition: Hooks fuer Seiteneffekte (useGeolocation, useOnline)
- State: React useState/useEffect, kein externer State-Manager
- Persistenz: Dexie (IndexedDB), kein localStorage fuer Spieldaten
- Styling: Tailwind utility classes, keine CSS-Module
- Dateien: kebab-case fuer Dateien, PascalCase fuer Komponenten
- Kommentare: Deutsch (Zielgruppe), Code-Identifier auf Englisch

## Git-Konventionen

Commit-Format:
```
<type>(<scope>): <kurze Beschreibung>

[optionaler Body]

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Types: feat, fix, chore, docs, refactor, test, perf
Scopes: app, server, pwa, security, docs, ci

## Do-Not-Modify

- `objects.data.js` / `objects.json` — generiert von `build_data.py`, CI-geprueft
- `pictograms.js` — generierte SVG-Daten
- `public/emoji/*.svg` — OpenMoji-Assets (CC BY-SA 4.0)
- `waldbingo.py` / `icons.py` — Python-PDF-Generator (separater Projektteil)
- `docs-site/` — generiertes Astro-Build-Artefakt

## Test-Strategie

- Framework: Vitest mit jsdom-Environment
- Dateien: `src/**/*.test.ts` neben den Quelldateien
- Mocking: Dexie/IndexedDB wird in Tests gemockt (vi.mock('./db'))
- Abdeckung: Generator-Invarianten, Difficulty-Klassifizierung, Share-Roundtrip, Species-Pipeline
- Kein E2E-Test (bewusste Entscheidung fuer ein privates Projekt)

## Ungewoehnliche Patterns

1. **Kein Live-Sync im Mehrspieler**: Bewusste Entscheidung. Jedes Geraet spielt offline auf eigener Karte. Pool + Seed + Spielernummer reichen fuer deterministische Kartenableitung.
2. **Seeded RNG (mulberry32)**: Reproduzierbare Karten ueber Geraete hinweg aus einem String-Seed.
3. **Progressiver Filter-Trichter**: Falls nicht genug Objekte den vollen Kontext matchen, werden schrittweise Filter gelockert (erst Tageszeit, dann Habitat, dann Jahreszeit).
4. **Zwei Transportwege fuer Einladungen**: (a) Server-Code (voller Pool als JSON), (b) Link/QR (kompakt: kuratierte Arten als ID-Referenz). Gleicher SharedGame-Typ.
5. **Legacy sw.js + vite-plugin-pwa**: Die alte sw.js existiert noch, wird aber durch Workbox (vite-plugin-pwa) ersetzt. Nicht loeschen, da sie alte Installationen migriert.
6. **OpenStreetMap-Kacheln bewusst NICHT gecacht** (Nutzungsrichtlinie).

## Build & Deploy

```bash
cd waldbingo-app

# Entwicklung
npm run dev          # Vite Dev-Server (HTTPS, selbst-signiert)
npm run server       # Express-Server (Port 8787)

# Build
npm run build        # tsc -b && vite build -> dist/

# Tests
npm test             # vitest run
npm run test:watch   # vitest (watch mode)
npm run typecheck    # tsc -b --noEmit

# Produktion
npm start            # node server/index.js (serviert dist/)
```

Deployment: Railway (Europe West), Express-Server serviert statisches dist/ + Einladungs-API. Volume fuer DATA_DIR (persistente Spieldaten ueber Neustarts).
