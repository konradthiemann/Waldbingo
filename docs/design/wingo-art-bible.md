# Wingo-Spielwelt – Art Bible

Stand: 9. November 2026. Gestaltungsregeln für die Spielwelt der Waldbingo-App (`waldbingo-app/`).
Technische Details (Tokens, Komponenten, Szenen-Variablen) stehen zusätzlich in der `CLAUDE.md`
im Repo-Root unter „Designsystem“.

## 1. Vision

Waldbingo ist ein **gemütliches Wald-Abenteuerspiel** mit dem Waldmonster **Wingo** als Begleiter:
saftig und belohnend wie ein Casual-Game, aber ruhig, weich und beruhigend wie eine
Entspannungs-App – **„Cozy Woodland“**. Der Hintergrund ist eine lebendige Waldszene, die
**Wetter, Jahreszeit und Tageszeit** widerspiegelt. Zielgruppe: Familien mit Kindern von 4 bis
10 Jahren, Nutzung draußen am Handy.

## 2. Stil-Leitplanken

Referenzrahmen: zwischen Candy Crush (zu laut) und Rootd (sehr ruhig).

| Aspekt | Mehr davon | Weniger davon |
|---|---|---|
| Formen | sehr rund, weich, „knuffig“, dicke Konturen im dunkleren Eigenton (nie Schwarz) | harte Kanten, dünne Linien, Glas-/Neon-Look |
| Farbe | warme Naturtöne, saftiges Grün, Creme-Papier, Sonnengelb, Beeren-Rot als Akzent | grelle Sättigung überall, Bonbon-Optik |
| Tiefe | flache Formen + ein Schattenton + ein Glanzlicht, „Lippe“ unter Knöpfen | komplexe Verläufe, Glossy-3D, Bevel |
| Bewegung | sanft federnd, langsame Idle-Loops (3–8 s), kurze Belohnungen (höchstens 2,5 s) | Dauer-Geblinke, Bildschirmwackeln, Blitze, hektische Partikel |
| Belohnung | Blätter-Konfetti, Glitzer, Wingo jubelt, Holzschild „BINGO!“, sanfte Glöckchen | Münzregen, laute Fanfaren, Zeitdruck |
| Ton | freundlich, ermutigend, nie wertend; Du-Form; kurze Sätze | Ironie, Erwachsenen-Humor, Druck („Beeil dich!“) |

**Lesbarkeit geht vor Atmosphäre.** Inhalte stehen auf **Papier-Panels** (Creme `#fff8ec`), die bei
jedem Wetter und zu jeder Tageszeit gleich gut lesbar sind. Text direkt auf der Szene nur für große
Überschriften, dann mit `var(--sc-on-scene)` und weichem Textschatten (`.scene-title`).

## 3. Farben und Schrift

- **Moos** (Wingos Fell) `#5bb88a`, **Wald-Grün** für Text und Primär-Knöpfe, **Holz** für Schilder
  und das Spielbrett, **Creme** für Papier, **Sonne** als Akzent-Knopf, **Beere** als Signalfarbe,
  **Himmel** und **Nacht** für die Szene. Die genauen Werte stehen in `tailwind.config.ts`.
- **Fredoka** für Überschriften, Knöpfe, Zahlen und Sprechblasen; **Nunito** für Fließtext. Beide
  Schriften sind gebündelt und funktionieren offline.
- Weiße Schrift nur auf ausreichend dunklen Flächen (Kontrast mindestens 4,5 : 1), deshalb sind
  Holzschilder dunkles Holz und Primär-Knöpfe dunkles Wald-Grün.

## 4. Bausteine

Alle Screens nutzen dieselben Bausteine aus `src/components/ui`: Papier-Panel mit optionalem
Holzschild als Überschrift, dicke Spiel-Knöpfe mit Lippe und Druckeffekt, Modals auf Papier,
Sprechblasen, Plaketten und runde Symbol-Knöpfe. Neue Screens erfinden keine eigenen Varianten,
sondern erweitern bei Bedarf das Kit.

## 5. Figuren

### Wingo (Hauptmaskottchen)

Ein großes, flauschiges **Waldmonster**. Statur und Knuddeligkeit erinnern an einen großen
Fellmonster-Kumpel (Anmutung „Sulley“ aus Die Monster AG), Wingo ist aber deutlich niedlicher und
kindlicher (Chibi-Proportionen) und eine **eigene Figur**: keine Übernahme von Merkmalen wie
lila Flecken auf Türkis oder dessen Hörnerform.

- **Silhouette:** runder, leicht birnenförmiger Fell-Körper, Kopf und Körper verschmolzen.
  Kurze, stämmige Beinchen, kurze Ärmchen mit drei runden Fingerchen, kleiner Puschelschwanz.
  Der Fell-Rand ist mit runden Büscheln an Scheitel, Wangen und Ellbogen gezeichnet.
- **Fell:** Moos-Grün `#5bb88a`, Schattenton `#3f9a70`, Kontur `#2f6b55`, heller Bauchfleck
  `#d8f3dc`. **Markenzeichen:** dunkelgrüne Flecken in Form kleiner Blätter mit heller Mittelader.
- **Hörnchen:** zwei kleine, abgerundete Zweig-Hörnchen in Rindenbraun, aus einem sprießt ein
  Blättchen (Frühling Blüte, Sommer frisches Blatt, Herbst rotes Blatt, Winter Schneehäubchen).
- **Gesicht:** große runde Augen mit zwei Glanzpunkten, rosige Wangen, breites kleines Lächeln
  mit **einem** winzigen Zähnchen, kleine dunkle Knubbelnase.
- **Persönlichkeit:** neugierig, warmherzig, ein bisschen tollpatschig, schnüffelt und sammelt
  gern, freut sich riesig über jeden Fund. Nie gruselig.
- **Stimmungen:** ruhig (atmet, blinzelt), fröhlich, jubelnd (Arme hoch, Hüpfer), winkend,
  nachdenklich (Hand am Kinn, „?“), schlafend („Zzz“), überrascht, ein bisschen traurig
  (nie weinend).
- **Accessoires je Kontext:** Regen → gelber Südwester; Schnee oder Frost → roter Strickschal und
  Schneehäubchen auf den Hörnchen; Frühling → Gänseblümchen-Kranz; Herbst → rotes Blatt am
  Hörnchen und eine Eichel; wenn es dunkel wird → kleine Laterne mit warmem Glühen;
  Wind → die Fell-Büschel wehen zur Seite.
- **Ansichten:** ganze Figur, „Drüberschauen“ (Oberkörper, Händchen auf einer Kante, z. B. über
  dem Spielbrett) und Kopf-Ausschnitt (App-Icon, kleine Logos).

### Wingos Waldfreunde

Gleicher Zeichenstil, kleiner als Wingo.

| Name | Art | Rolle in der App | Merkmale |
|---|---|---|---|
| Olli | Eule | erklärt Funde („Wusstest du?“) im Info-Fenster | rund, beige-braun, große Brille, Federöhrchen |
| Flitz | Eichhörnchen | Schwierigkeit „Mittel“, hüpft die Fortschritts-Ranke entlang | orange, riesiger Puschelschwanz, hält eine Eichel |
| Stupsi | Igel | Tipps, Offline-Hinweis, nachts schläfrig | schüchtern, weich gerundete Stachelfrisur, Knubbelnase |
| Pilzi | Pilzwichtel | Schwierigkeit „Leicht“ | kleiner Kerl mit **Steinpilz**-Hut (kein Fliegenpilz) |
| Fine | Füchsin | Schwierigkeit „Experte“ | schlau, buschiger Schwanz mit weißer Spitze, Halstuch |

Die Freunde sind zugleich die Spieler-Avatare. Ab Spieler 6 beginnen sie von vorn und werden
über eine Ringfarbe unterschieden (bis 10 Spieler).

### Dialog-Stil

Höchstens 90 Zeichen, Du-Form, verständlich für 4- bis 10-Jährige, positiv und konkret, gern mit
Wald-Wissen. Wingo greift den Kontext auf: Wetter („Nach dem Regen kommen die Schnecken raus!“),
Jahreszeit, Tageszeit („Pssst, nachts schlafen viele Tiere“), den nächsten Schritt beim Planen und
das Ergebnis der Foto-Prüfung. Keine Emojis im Text, die Figur trägt die Emotion. Alle Sätze stehen
zentral in `src/lib/wingo-lines.ts`.

## 6. Szene

Vollflächig hinter der App. Ebenen von hinten nach vorn: Himmel → Sonne oder Mond mit Glühen →
Sterne → driftende Wolken → Regenbogen → ferne Hügel → ferne Baumreihe → mittlere Bäume
(Laubbäume je Jahreszeit: Blüten, sattgrün, orange-rot oder kahl, dazu Schnee) → Nebelbänder →
Vordergrund (rahmende Bäume links und rechts, Gräser, Büsche, Farne, Pilze im Herbst, Blumen im
Frühling und Sommer, Pfützen bei Nässe, Schneewehen, Raureif) → Wetter-Partikel (Regen schräg
je nach Wind, Schnee, Blätter, Blütenblätter, Glühwürmchen, Lichtpünktchen) → Dunst-Schleier.

- Alle Farben kommen aus der Szenen-Palette (Jahreszeit × Wetter × Tageszeit) und blenden bei
  einem Szenenwechsel weich über (ca. 1,2 s).
- Die Komposition ist für das Hochformat am Handy (390 × 844) optimiert: oben Himmel und ferne
  Bäume, unten der Vordergrund. Sonne und Mond sitzen dort, wo sie keine Inhalte verdecken; die
  Tageszeit liest sich zusätzlich über Himmelsfarbe und Horizont-Glühen.
- Baumpositionen sind fest, nicht zufällig – die Szene sieht bei jedem Öffnen gleich aus.

## 7. Performance, Barrierefreiheit, Offline

- Ein einziges Canvas für alle Partikel, ein Animations-Loop, Pause bei verstecktem Tab, höchstens
  doppelte Pixeldichte, Partikelzahl nach Bildschirmfläche. Die Bildebenen sind statisch und
  bewegen sich nur als Ganzes (Wind). Keine animierten Weichzeichner auf großen Flächen.
- Unter offenen Fenstern und Feiern steht die Szene still.
- Auf schwachen Geräten schaltet die Szene automatisch einen Sparmodus zu: erst blenden
  Szenenwechsel in wenigen Stufen über, bei dauerhaft niedriger Bildrate gibt es zusätzlich halb
  so viele Partikel, kein Wiegen der Bäume und kein Atmen von Wingo. Auf flotten Geräten bleibt
  alles unverändert.
- „Bewegung reduzieren“ des Systems → ruhiges Standbild ohne Idle-Animationen.
- Dekorative Grafiken sind für Screenreader ausgeblendet; Figuren mit Bedeutung haben einen
  Namen. Alle Knöpfe haben sichtbaren Text oder eine Beschriftung, der Fokus ist sichtbar,
  Tippziele sind mindestens 44 px groß.
- Keine externen Assets: Grafiken als Inline-SVG oder CSS, Schriften gebündelt, alles offline.
- Die Druckansicht zeigt nur die Bingokarten (optional mit Info-Begleitseite); Szene, Figuren und
  Overlays erscheinen nie im Druck.

## 8. Screens

- **Startbildschirm:** großes Logo, Wingo groß und winkend mit einer Begrüßung passend zu Wetter
  und Tageszeit, Knöpfe „Weiterspielen“ (wenn ein Spiel gespeichert ist), „Neues Abenteuer“ und
  „Einem Spiel beitreten“. Hier wirkt die Szene am stärksten.
- **Expedition planen:** Wingo begleitet oben und spricht den nächsten sinnvollen Schritt an.
  Panels mit Holzschild-Titeln: „Wo seid ihr?“ (Karte und Standort), „Wetter & Zeit“
  (illustriert), „Wie schwer?“ (Pilzi Leicht, Flitz Mittel, Fine Experte), Spielerzahl mit
  Avatar-Vorschau; Radius, Seed und manuelle Anpassung dezent und einklappbar. Der Knopf
  „Los geht’s!“ bleibt am Handy unten sichtbar. Die Szene wechselt live mit der Auswahl.
- **Spielbrett:** Kontext-Plaketten oben, Spieler-Avatare als Tabs, Wingo schaut über den oberen
  Rand des Holzbretts und reagiert in einer Sprechblase. 5 × 5 Creme-Kacheln mit Bild und Name;
  ein Fund kippt und stempelt die Kachel, dazu Blätter-Burst, Glöckchen und Vibration.
  Fertige Reihen leuchten golden; die Fortschritts-Ranke wächst mit Zähler. Bingo und volle Karte
  („Waldmeister“) feiern mit Overlay, die volle Karte deutlich größer.
- **Info-Fenster:** Olli präsentiert den Fund („Wusstest du?“). **Foto oder abhaken:** kleines
  Fenster mit Wingo; bei der Foto-Prüfung kommentiert Wingo das Ergebnis.
- **App-Rahmen:** schlanke Leiste mit kleinem Logo, Offline-Plakette, Vibrations-Schalter (nur auf
  Geräten mit Vibration) und Ton-Schalter; Fußzeile mit Impressum, Datenschutz und Credits.

## 9. Funktionsumfang, der bei Gestaltungsänderungen erhalten bleibt

Standort (GPS und Karte antippen), Karte mit Suchradius, Wetter, Region und Höhe laden,
Lebensraum-Vorschlag, manuelle Auswahl (Jahreszeit, Wetter, Tageszeit, Lebensraum),
Schwierigkeit 1–3, Spieler 1–10, Suchradius, Seed, Statusmeldungen beim Erstellen, regionale Arten
(iNaturalist), Vorladen der Bilder, gespeicherter Spielstand, Spieler-Tabs (ein Gerät) bzw. fester
Spieler (geteiltes Spiel), Abhaken und Abwählen, Foto-Prüfung und „Manuell abhaken“, Info-Fenster
mit Bild-Credits, Bingo-Erkennung, Fortschritt, Einladen (Code, Link, QR, Kopieren), Beitreten
(Code oder Link, Spielerwahl), Drucken (Karten und Info-Begleitseite), Neues Spiel,
Offline-Hinweis, Impressum und Datenschutz, Credits (OpenMoji CC BY-SA 4.0, iNaturalist,
OpenStreetMap, Open-Meteo), Fehlerseite.

## 10. Vorschau beim Gestalten

- `?fx=full`, `?fx=steps`, `?fx=lite` – Sparmodus-Stufe fest einstellen (zum Prüfen).
- `?scene=herbst,regen,abend` – beliebige Kombination aus Jahreszeit, Wetter und Tageszeit
  (Reihenfolge egal), z. B. `?scene=winter,schnee,nacht`.
- `?studio` – Werkbank mit Szenen-Vorschau, Palette und Flags; `?studio=figuren` zeigt Wingo und
  die Freunde in allen Stimmungen und Sprüchen; `?studio=spiel` zeigt das Spielbrett mit Knöpfen
  für „fast Bingo“, „Bingo“, „volle Karte“ und die Zustände der Foto-Prüfung, ohne den echten
  Spielstand zu verändern.
