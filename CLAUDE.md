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
  index.html                    # App-Shell, Favicon (wingo-face.svg + PNG-Rückfall), Platzhalter-Himmel
  src/
    main.tsx                    # React-Einstiegspunkt, Webfonts (Fredoka, Nunito), ErrorBoundary
    App.tsx                     # App-Rahmen: Bildschirme Start/Planen/Beitreten/Spiel, Rechtliches,
                                #   Studio-Route (?studio), Szenen-Steuerung, Druck, Einladen-Modal
    styles/index.css            # Tailwind-Basis, globale Animationen (anim-*), Drucklayout
    data/
      types.ts                  # Zentrale Typen (WaldObjekt, SpielKontext, Kategorie etc.)
      objects.ts                # Kuratierter Objekt-Pool (re-exportiert objects.data.js)
      openmoji-codes.ts         # Set aller gebuendelten OpenMoji-Hex-Codes
    lib/
      generator.ts              # Bingo-Generator: seeded RNG, Filter, Gewichtung, Ziehung, checkBingo
      game-state.ts             # GameState-Typ, Konvertierung stored/shared
      share.ts                  # Kompakte Kodierung fuer Link/QR, URL-Parsing
      api.ts                    # Client fuer den Einladungs-Code-Server
      db.ts                     # IndexedDB-Persistenz (Dexie): Spiel, Einstellungen (inkl. soundOn, hapticsOn), Caches
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
      classifier.ts             # Foto-Erkennung im Browser (TensorFlow.js MobileNet)
      scene.ts                  # Szenen-Engine: deriveScene() -> Palette + Flags, sceneCssVars(),
                                #   parseSceneOverride() fuer ?scene=jahreszeit,wetter,tageszeit
      wingo-lines.ts            # Wingos Sprueche je Situation und Kontext (<= 90 Zeichen),
                                #   Schritt-Wahl setupSituation() (Planen) und photoSituation() (Foto-Pruefung)
      bingo-lines.ts            # Bingo-Linien, 4-von-5-Linien, Klick-Ereignis (found/almost/bingo/full)
      sfx.ts                    # Klaenge per WebAudio (synthetisiert) + Vibration, Ton und Vibration getrennt schaltbar
    hooks/
      useGeolocation.ts         # Browser Geolocation API
      useOnline.ts              # Online/Offline-Status
      useScrolled.ts            # Seite gescrollt? (HUD wird Milchglas)
      useSound.ts               # Ton-Schalter, gespeichert in den Einstellungen
      useHaptics.ts             # Vibrations-Schalter (nur Touch-Geraete mit Vibration), gespeichert
    icons/
      pictograms.ts             # Inline-SVG-Piktogramme
    components/
      Svg.tsx                   # SVG-Glyph-Komponente
      ErrorBoundary.tsx         # Fehlerseite mit traurigem Wingo (nur Inline-Styles)
      ui/                       # UI-Kit: Panel, WoodSign, GameButton, Modal, SpeechBubble, Badge, IconButton
      scene/                    # Hintergrund-Szene: ForestScene (Inline-SVG-Ebenen) + ParticleCanvas,
                                #   Szenen-Context (scene-context.ts), Sparmodus (perf-mode.ts)
      characters/               # Wingo, Waldfreunde (Friend, PlayerAvatar), WingoSays (Sprechblase)
      fx/                       # Effekte: Celebration (Feier-Overlay), LeafBurst, Portal, useReducedMotion
      home/                     # Startbildschirm (TitleScreen, GameLogo), HUD, Fusszeile, Shell-Icons
      dashboard/                # „Expedition planen“: Ort/Karte, Wetter & Zeit, Schwierigkeit, Spieler
      game/                     # Spielbrett: Kacheln, Spieler-Tabs, Ranke, Info-/Wahl-Modal, Kamera
      join/                     # Beitritts-Ansicht (Code-Eingabe, Spielerwahl)
      legal/                    # Impressum + Datenschutz
      print/                    # Druck-Layout (Bingokarten + Info-Begleitseite)
      share/                    # Einladungs-Modal (Code, Link, QR)
      studio/                   # Werkbank unter ?studio: Szene, Figuren (=figuren), Spielbrett (=spiel),
                                #   Foto-Pruefung mit festem Ergebnis: ?studio=spiel&photo=passt|unsicher|anderes|fehler|offline|laedt|prueft
  public/emoji/                 # OpenMoji-SVGs (CC BY-SA 4.0)
  public/wingo-face.svg         # App-Icon: Wingos Gesicht (aus der Wingo-Komponente gerendert)
  public/icon-*.png             # PWA-Icons aus wingo-face.svg: any (192/512), maskable (192/512),
                                #   apple-touch-icon.png (180)
  objects.data.js               # Generierter Objekt-Pool (von build_data.py)
  objects.json                  # Gleicher Pool als JSON
  pictograms.js                 # Inline-SVG-Daten
  sw.js                         # Legacy-SW (wird durch vite-plugin-pwa/Workbox ersetzt)
  vite.config.ts                # Vite + React + PWA + Test-Konfiguration
  tailwind.config.ts            # Wald-Designsystem (Farben, Radii, Shadows, Fonts, Easing)
waldbingo.py                    # Python PDF-Generator
icons.py                        # 25 reportlab-Canvas-Zeichenfunktionen
docs/                           # Doku-Quellen (Markdown)
docs-site/                      # Astro Starlight -> GitHub Pages
```

Eigene CSS-Dateien (Keyframes, Spezialeffekte) liegen im jeweiligen Komponenten-Ordner und
werden dort importiert: `scene/scene.css`, `characters/characters.css`, `fx/fx.css`,
`game/game.css`, `home/shell.css`, `dashboard/dashboard.css`.

## Designsystem

Leitbild „Cozy Woodland“: gemuetliches Wald-Abenteuerspiel mit dem Waldmonster Wingo. Runde,
weiche Formen, dicke Konturen im dunkleren Eigenton (nie Schwarz), flach + ein Schattenton +
ein Glanzlicht. Sanfte, federnde Bewegung, kurze Belohnungs-Effekte (hoechstens 2,5 s).
Lesbarkeit geht vor Atmosphaere: Inhalte stehen auf Papier-Panels.
Ausfuehrliche Gestaltungsregeln (Stil, Figuren-Bibel, Dialog-Stil, Szene, Screens):
`docs/design/wingo-art-bible.md`.

### Farben/Tokens (tailwind.config.ts)
- **forest**: 950 `#0f2617` bis 100 `#dcefe1` (u. a. 900 `#14331f`, 700 `#1f5b38`, 600 `#2f7d4f`, 500 `#3f9d63`)
- **moss** (Wingos Fell): `#5bb88a`, dark `#3f9a70`, deep `#2f7d63`, light `#d8f3dc`
- **bark** (Rinde): `#a06d44`, dark `#7a4f2e`, light `#d9b48f`
- **wood** (Holzschilder, Spielbrett): `#b98352`, dark `#8a5a33`, light `#e2bb8c`, lip `#6e4426`
- **cream** (Papier-Panels): `#fff8ec`, 2 `#fbefd9`, 3 `#f3e2c4`, line `#ead8b8`
- **sun**: `#f3c44d`, light `#ffe08a`, dark `#d9a21f`; **amber**: `#e8913c` (600: `#c4702f`)
- **berry** (Akzent): `#e85d75`, dark `#c2405a`, light `#ffc2cd`
- **sky**: `#7cc6f2`, dark `#3f8fc4`, light `#d4eefc`; **night**: `#1b2447`, deep `#0e1430`, light `#3a4a86`
- **ink** `#1d2a22` (Text), **muted** `#62716a`, **line** `#e3eae2` / 2 `#eef3ec`, **wbg** `#eaf1e8`, **card** `#ffffff`
- **ok**: `#2f9e54` (bg `#dcf3e2`, line `#8fd6a5`)
- **kat-***: Kategorie-Farben (tier, vogel, insekt, pflanze, baum, pilz, spur, landschaft)

### Typografie
- **Fredoka** (`font-display`): Ueberschriften, Knoepfe, Zahlen, Sprechblasen; h1–h4 automatisch
- **Nunito** (`font-sans`, Standard): Fliesstext
- Beide als variable Webfonts ueber `@fontsource-variable/*` gebuendelt (offline im Precache, kein CDN)

### Spacing, Radii, Schatten, Easing
- Spacing: Tailwind-Standard
- Border-Radius: sm 10px, DEFAULT 14px, lg 20px, xl 26px, 2xl 32px
- Schatten: `wb1`/`wb2`/`wb3` (subtil bis stark), `panel` (schwebendes Papier-Panel),
  `tile` (Kachel mit Innenglanz und Lippe), `glow` (goldenes Leuchten)
- Easing: `ease-spring` (federnd), `ease-soft`

### Szenen-Variablen (Laufzeit)
`App.tsx` leitet aus Jahreszeit, Wetter und Tageszeit per `deriveScene()` eine `SceneState` ab und
setzt deren Farben ueber `sceneCssVars()` als CSS-Variablen am `<html>`:
`--sc-sky-top`, `--sc-sky-bottom`, `--sc-glow`, `--sc-cloud`, `--sc-hill-far`, `--sc-hill-near`,
`--sc-tree-far`, `--sc-tree-mid`, `--sc-tree-near`, `--sc-foliage`, `--sc-foliage-accent`,
`--sc-trunk`, `--sc-ground`, `--sc-ground-shade`, `--sc-flower`, `--sc-snow`, `--sc-haze`,
`--sc-on-scene` (Textfarbe direkt auf der Szene), `--sc-theme-color` (Browser-Leiste),
`--sc-daylight` und `--sc-wind` (0–1). Dazu `--wb-title-shadow` fuer Ueberschriften auf der Szene
(Klasse `.scene-title`). `scene/scene.css` registriert die Farbvariablen per `@property`, dadurch
blenden Szenenwechsel weich ueber (ca. 1,2 s).

Welche Szene gilt: Vorschau per URL `?scene=winter,schnee,nacht` hat Vorrang, im Spiel der
Spielkontext, beim Planen die aktuelle Auswahl, beim Beitreten der Kontext des geladenen Spiels,
auf dem Startbildschirm Uhrzeit plus zuletzt geladenes Wetter (juenger als 12 Stunden).

### Szene (`components/scene`)
- `ForestScene` (`{ scene, calm?, contained? }`): fixiert hinter der App, `aria-hidden`, im Druck
  unsichtbar. Ebenen: Himmel, Sonne/Mond, Sterne, Wolken, Regenbogen, Huegel, Baumreihen,
  Nebel, Vordergrund, rahmende Baeume, Dunst.
- Sonne/Mond: Hochformat fest rechts oben, Breitformat unter 1024 px je Tageszeit (`BODY_POS`),
  Desktop ab 1024 px als Tagesbogen ueber die freien Raender und die Mitte ganz oben
  (`BODY_POS_DESKTOP`: morgens links, mittags oben Mitte, abends rechts) – per Container-Query
  in `scene.css`.
- `SceneProvider`/`useCurrentScene()` (`scene/scene-context.ts`): App.tsx stellt die sichtbare
  `SceneState` als Context bereit; Figuren lesen daraus z. B. das Tageslicht (Wingos Laterne).
- Ein `<canvas>` fuer Partikel (Regen, Schnee, Blaetter, Bluetenblaetter, Gluehwuermchen),
  ein rAF-Loop, Pause bei verstecktem Tab, DPR hoechstens 2, Partikelzahl nach Flaeche.
- `calm` friert die Partikel als Standbild ein und haelt Idle-Animationen an (gesetzt bei offenen
  Modals, Feiern und beim Erstellen einer Karte).
- Sparmodus (`scene/perf-mode.ts`, nur auf gemessen langsamen Geraeten, steigt pro Sitzung nur
  auf): Lief ein Szenenwechsel unter 45 fps, blendet die Szene kuenftig in 5 Stufen statt in jedem
  Bild ueber (`data-fx="steps"`); liegt auch der Ruhezustand ueber zwei 3-s-Fenster unter 40 fps,
  zusaetzlich halbes Partikel-Budget, Baeume/Graeser wiegen nicht, Wingo atmet nicht
  (`data-fx="lite"`). Fuer QA fest einstellbar per `?fx=full|steps|lite`.
- `prefers-reduced-motion`: ruhiges Standbild.

### UI-Kit (`components/ui`, Import aus `'../ui'`)
- `Panel` (`variant: 'paper' | 'glass' | 'wood'`, optional `sign` = Holzschild-Ueberschrift), `WoodSign`
- `GameButton` (`variant: 'primary' | 'accent' | 'secondary' | 'berry' | 'ghost'`, `size: 'sm'`–`'xl'`,
  `icon`, `block`) mit „Lippe“ unter dem Knopf
- `Modal`: abgedunkelter Hintergrund + Papier-Panel, Escape, Fokus, `size`, `label`, `z`. Wird per
  Portal in `<body>` gerendert und ist im Druck ausgeblendet.
- `SpeechBubble` (`tail: 'left' | 'right' | 'bottom' | 'top' | 'none'`)
- `Badge` (Plakette, `tone: 'cream' | 'glass' | 'forest' | 'sun'`), `IconButton` (rund, Pflicht-`label`)

### Figuren (`components/characters`)
- **Wingo** – Hauptmaskottchen, flauschiges moosgruenes Waldmonster mit Zweig-Hoernchen und
  Blatt-Flecken. Props: `mood` (`idle`, `happy`, `cheer`, `wave`, `think`, `sleep`, `surprised`,
  `sad`), `variant` (`full`, `peek` = ueber eine Kante schauen, `face` = Kopf-Ausschnitt),
  `size`, `season`/`weather`/`night` (Accessoires: Regenhut, Schal, Bluetenkranz, Herbstblatt,
  Laterne), `lantern` (Laterne explizit; ohne Angabe bei `night` oder wenn die Szene aus dem
  `SceneProvider` dunkel genug ist: Daemmerung, Nacht, Abende unter Wolken/Nebel/Schnee/Regen und
  Winterabende, `sceneNeedsLantern`), `talking`, `animated`, `title`.
- **Waldfreunde** (`Friend`, `FRIENDS`): Olli (Eule, erklaert im Info-Modal), Flitz (Eichhoernchen,
  „Mittel“), Stupsi (Igel), Pilzi (Steinpilz-Wichtel, „Leicht“), Fine (Fuechsin, „Experte“).
- **Spieler-Avatare**: `PlayerAvatar` + `playerName` – Freunde reihum, ab Spieler 6 mit Ringfarbe
  und Rundennummer (bis 10 Spieler).
- **WingoSays**: Wingo mit Sprechblase; Texte aus `wingoLine(situation, kontext, variante)`.
- Dialog-Stil: hoechstens 90 Zeichen, Du-Form, fuer 4–10 Jahre, positiv, gern mit Wald-Wissen.

### Layout-Muster
- Schlanke HUD-Leiste (Logo-Pille, Offline-Plakette, Vibrations- und Ton-Schalter), beim Scrollen Milchglas
- Inhalt `w-full max-w-[920px]` zentriert (Beitreten 620px), Fusszeile als Milchglas-Pille
- Ueberschriften direkt auf der Szene mit `.scene-title`, alle anderen Inhalte auf Papier-Panels
- Spielbrett: Holzbrett mit 5×5 Creme-Kacheln, Wingo schaut ueber den oberen Rand;
  ab Desktop-Breite Aktionen in einer Seitenleiste

### Animationen
- Global (`styles/index.css`): `anim-pop`, `anim-fade`, `anim-rise`, `anim-bob`, `anim-wiggle`,
  `anim-pop-in`. Sie setzen die Kurzform `animation:` und ersetzen damit jede andere Animation am
  selben Element – Dauer-Animationen deshalb auf ein eigenes Element legen.
- Bildschirmwechsel (`home/shell.css`) bewusst ohne `animation-fill-mode: both`, damit nach dem
  Uebergang kein `transform` am Wrapper haengen bleibt.
- Overlays (Modals, Feier, Kamera) werden per Portal in `<body>` gerendert.
- `prefers-reduced-motion: reduce` schaltet global alle Animationen und Uebergaenge ab.

### Druck
`@media print` zeigt nur `.print-only` (PrintSheet: Bingokarten, optional Info-Begleitseite).
`.app-screen`, `.no-print`, Szene, Figuren und Overlays sind im Druck ausgeblendet.

### Komponenten-Patterns
- Knoepfe: `GameButton` (rund, Fredoka, Lippe), Fokus ueber `focus-ring`, Tippziele mindestens 44px
- Plaketten/Chips: rounded-full, Fredoka, Creme oder Milchglas
- Modals: UI-Kit-`Modal` (Papier-Panel, federt herein)
- Dekorative SVGs `aria-hidden`; Figuren mit Bedeutung `role="img"` + `aria-label`
- Keine externen Assets: Grafiken als Inline-SVG/CSS, alles gebuendelt (offline-first)

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
