// Wingos Sprüche: kurz (≤ 90 Zeichen), kindgerecht (4–10 J.), Du-Form, Deutsch,
// positiv und konkret – gerne mit ein bisschen Wald-Wissen.
//
// Jede Situation liefert einen deterministischen Pool. Kontextzeilen (Tageszeit,
// Wetter, Jahreszeit) stehen VORNE, damit `variant = 0` immer die passendste
// Zeile ist; höhere Varianten wechseln reihum durch alle Alternativen.
// Reihenfolge der Kontexte: Nacht/Dämmerung → besonderes Wetter → Morgen/Abend
// → Jahreszeit → ruhiges Wetter (klar/bewölkt) → allgemeine Zeilen.
import type { WingoMood } from '../components/characters/Wingo'
import type { Jahreszeit, Kategorie, Tageszeit, Wetter } from '../data/types'

export type WingoSituation =
  | 'welcome' // Startbildschirm
  | 'welcomeBack' // Startbildschirm mit gespeichertem Spiel
  | 'setup' // Expedition vorbereiten
  | 'creating' // Karte wird erstellt
  | 'start' // Spiel beginnt
  | 'found' // Feld gefunden
  | 'unfound' // Feld wieder abgewählt
  | 'almost' // 4 von 5 in einer Reihe
  | 'bingo' // Bingo!
  | 'full' // alle 25 Felder
  | 'idle' // Tipp zwischendurch
  | 'switch' // Spielerwechsel (mit Spielername)
  | 'choose' // Foto machen oder einfach abhaken?
  | 'join' // Spiel beitreten
  | 'error' // Fehlerseite
  // Expedition planen – Wingo spricht über den nächsten sinnvollen Schritt (siehe setupSituation)
  | 'setupWhere' // noch kein Ort gewählt
  | 'setupLookup' // Standort/Wetter wird gesucht
  | 'setupWeather' // Ort klar, Wetter unbekannt
  | 'setupReady' // alles da – los geht’s
  // Foto-Prüfung (PhotoVerify) – siehe photoSituation
  | 'photoLoading' // Erkennungs-Modell lädt
  | 'photoChecking' // Foto wird analysiert
  | 'photoMatch' // Kategorie passt
  | 'photoUnsure' // nichts Passendes erkannt
  | 'photoOther' // eher eine andere Wald-Kategorie erkannt (mit `guess`)
  | 'photoError' // Erkennung fehlgeschlagen
  | 'photoOffline' // fehlgeschlagen, weil kein Netz

export interface LineContext {
  season?: Jahreszeit
  weather?: Wetter | null
  time?: Tageszeit
  /** Name des Fundes (bei found). */
  thing?: string
  /** Gefundene Anzahl. */
  count?: number
  /** Name der Spielerin/des Spielers (bei switch), z. B. „Flitz“. */
  player?: string
  /** Kategorie des gesuchten Feldes (Foto-Prüfung), z. B. „Pilz“. */
  kind?: Kategorie
  /** Was die Foto-Erkennung stattdessen eher sieht (bei photoOther). */
  guess?: Kategorie
  /** Kein Netz (Expedition planen). */
  offline?: boolean
}

/** Alle Situationen (für Tests, Studio, Vorschau). */
export const WINGO_SITUATIONS: WingoSituation[] = [
  'welcome',
  'welcomeBack',
  'setup',
  'creating',
  'start',
  'found',
  'unfound',
  'almost',
  'bingo',
  'full',
  'idle',
  'switch',
  'choose',
  'join',
  'error',
  'setupWhere',
  'setupLookup',
  'setupWeather',
  'setupReady',
  'photoLoading',
  'photoChecking',
  'photoMatch',
  'photoUnsure',
  'photoOther',
  'photoError',
  'photoOffline',
]

/** Maximale Länge einer Zeile (Sprechblase bleibt kompakt, auch auf dem Handy). */
export const MAX_LINE_LENGTH = 90

/**
 * Liefert einen passenden Spruch. `variant` wählt deterministisch zwischen
 * Alternativen (z. B. Zähler oder Index), damit Tests stabil bleiben.
 */
export function wingoLine(situation: WingoSituation, ctx: LineContext = {}, variant = 0): string {
  const pool = wingoLines(situation, ctx)
  const i = Math.floor(Math.abs(Number.isFinite(variant) ? variant : 0)) % pool.length
  return pool[i]
}

/** Kompletter Pool einer Situation (kontextbezogene Zeilen zuerst, nie leer). */
export function wingoLines(situation: WingoSituation, ctx: LineContext = {}): string[] {
  const raw = BUILD[situation](ctx)
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of raw) {
    const t = line.trim()
    if (t && t.length <= MAX_LINE_LENGTH && !seen.has(t)) {
      seen.add(t)
      out.push(t)
    }
  }
  return out.length ? out : [FALLBACK[situation]]
}

/** Empfohlene Stimmung für Wingo in einer Situation. */
export function wingoMood(situation: WingoSituation): WingoMood {
  return MOOD[situation]
}

const MOOD: Record<WingoSituation, WingoMood> = {
  welcome: 'wave',
  welcomeBack: 'happy',
  setup: 'happy',
  creating: 'think',
  start: 'cheer',
  found: 'happy',
  unfound: 'idle',
  almost: 'surprised',
  bingo: 'cheer',
  full: 'cheer',
  idle: 'idle',
  switch: 'wave',
  choose: 'think',
  join: 'wave',
  error: 'sad',
  setupWhere: 'happy',
  setupLookup: 'happy',
  setupWeather: 'happy',
  setupReady: 'happy',
  photoLoading: 'think',
  photoChecking: 'think',
  photoMatch: 'cheer',
  photoUnsure: 'think',
  photoOther: 'surprised',
  photoError: 'sad',
  photoOffline: 'think',
}

const FALLBACK: Record<WingoSituation, string> = {
  welcome: 'Hallo, ich bin Wingo! Kommst du mit in den Wald?',
  welcomeBack: 'Da bist du ja wieder! Wollen wir weitersuchen?',
  setup: 'Wo und wann sind wir unterwegs?',
  creating: 'Ich schnuppere mal, was es hier zu finden gibt …',
  start: 'Los geht’s! Augen auf im Wald!',
  found: 'Super gefunden!',
  unfound: 'Kein Problem – such einfach weiter!',
  almost: 'Nur noch eins bis zum Bingo!',
  bingo: 'BINGO! Du bist ein echter Waldforscher!',
  full: 'Alles gefunden! Du bist ein Waldmeister!',
  idle: 'Schau mal unter Blätter und hinter Baumstämme!',
  switch: 'Jetzt bist du dran! Was findest du?',
  choose: 'Hast du es entdeckt? Zeig es mir mit einem Foto – oder hak es einfach ab!',
  join: 'Schön, dass du mitspielst!',
  error: 'Hoppla, da ist etwas schiefgegangen.',
  setupWhere: 'Wo seid ihr? Tipp auf die Karte oder auf „Mein Standort“!',
  setupLookup: 'Moment, ich schaue, wo ihr seid …',
  setupWeather: 'Wie ist das Wetter bei euch? Tipp es unten an!',
  setupReady: 'Alles bereit? Dann tipp unten auf „Los geht’s!“',
  photoLoading: 'Ich hole schnell meine Lupe … einen Moment!',
  photoChecking: 'Ich schaue mir dein Foto ganz genau an …',
  photoMatch: 'Super Foto! Das passt – tipp auf „Gefunden!“',
  photoUnsure: 'Hmm, da bin ich nicht ganz sicher …',
  photoOther: 'Oh, das sieht für mich nach etwas anderem aus.',
  photoError: 'Hoppla, meine Lupe klemmt! Du kannst es trotzdem abhaken.',
  photoOffline: 'Ohne Internet bleibt meine Lupe zu Hause. Hak es einfach selbst ab!',
}

// ── Schritt-Auswahl ────────────────────────────────────────────────────────

/** Was „Expedition planen“ gerade weiß (nur Lesen, keine Logik). */
export interface SetupState {
  online: boolean
  /** Ort gewählt (Karte, „Mein Standort“ oder gespeichert)? */
  hasPlace: boolean
  /** Standort oder Wetter/Region werden gerade gesucht? */
  busy: boolean
  /** Wetter bekannt (live, gespeichert oder von Hand gewählt)? */
  weatherKnown: boolean
}

/**
 * Nächster sinnvoller Schritt beim Planen → Situation für Wingos Zeile.
 * Ohne Netz bringt der Ort nichts (Karte, Wetter und Arten brauchen Netz),
 * deshalb geht es dann gleich um das Wetter bzw. ums Losgehen.
 */
export function setupSituation(s: SetupState): WingoSituation {
  if (s.busy) return 'setupLookup'
  if (s.online && !s.hasPlace) return 'setupWhere'
  if (!s.weatherKnown) return 'setupWeather'
  return 'setupReady'
}

/** Zustand der Foto-Prüfung (Spiegel von PhotoVerify, nur Lesen). */
export interface PhotoState {
  phase: 'loading-model' | 'classifying' | 'result'
  /** Erkennung fehlgeschlagen (Modell nicht ladbar oder Analyse-Fehler). */
  error: boolean
  /** Browser meldet „offline“. */
  offline: boolean
  /** Kategorie des Fotos passt zum gesuchten Feld. */
  matched: boolean
  /** Andere Wald-Kategorie, die die Erkennung stattdessen sieht (oder null). */
  guess?: Kategorie | null
}

/** Ergebnis der Foto-Prüfung → Situation für Wingos Zeile. */
export function photoSituation(p: PhotoState): WingoSituation {
  if (p.phase === 'loading-model') return 'photoLoading'
  if (p.phase === 'classifying') return 'photoChecking'
  if (p.error) return p.offline ? 'photoOffline' : 'photoError'
  if (p.matched) return 'photoMatch'
  return p.guess ? 'photoOther' : 'photoUnsure'
}

/** Kategorie als kindgerechtes Wort mit Artikel (Nominativ / nach „nach“). */
const KIND: Record<Kategorie, { nom: string; dat: string }> = {
  Tier: { nom: 'ein Tier', dat: 'einem Tier' },
  Vogel: { nom: 'ein Vogel', dat: 'einem Vogel' },
  Insekt: { nom: 'ein Insekt', dat: 'einem Insekt' },
  Pflanze: { nom: 'eine Pflanze', dat: 'einer Pflanze' },
  Baum: { nom: 'ein Baum', dat: 'einem Baum' },
  Pilz: { nom: 'ein Pilz', dat: 'einem Pilz' },
  Spur: { nom: 'eine Tierspur', dat: 'einer Tierspur' },
  Landschaft: { nom: 'ein Stück Landschaft', dat: 'Landschaft' },
}

// ── Kontext-Bausteine ──────────────────────────────────────────────────────

type Table<K extends string> = Partial<Record<K, string[]>>

interface ContextTables {
  /** Nacht/Dämmerung (höchste Priorität). */
  dark?: Table<'nacht' | 'daemmerung'>
  /** Besonderes Wetter. */
  weather?: Table<Exclude<Wetter, 'klar' | 'bewoelkt'>>
  /** Morgen/Abend. */
  daytime?: Table<'morgen' | 'abend'>
  season?: Table<Jahreszeit>
  /** Klares Wetter – nur tagsüber (Sonne!). */
  sunny?: string[]
  cloudy?: string[]
}

/** Baut den Pool: Kontextzeilen in fester Priorität, dann die allgemeinen. */
function withContext(c: LineContext, t: ContextTables, general: string[]): string[] {
  const out: string[] = []
  const dark = c.time === 'nacht' || c.time === 'daemmerung'
  if (dark && c.time) out.push(...(t.dark?.[c.time as 'nacht' | 'daemmerung'] ?? []))
  const w = c.weather ?? null
  if (w && w !== 'klar' && w !== 'bewoelkt') out.push(...(t.weather?.[w] ?? []))
  if (c.time === 'morgen' || c.time === 'abend') out.push(...(t.daytime?.[c.time] ?? []))
  if (c.season) out.push(...(t.season?.[c.season] ?? []))
  if (w === 'klar' && !dark) out.push(...(t.sunny ?? []))
  if (w === 'bewoelkt') out.push(...(t.cloudy ?? []))
  return [...out, ...general]
}

// ── Texte ──────────────────────────────────────────────────────────────────

const BUILD: Record<WingoSituation, (c: LineContext) => string[]> = {
  welcome: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: [
            'Pssst … ich bin Wingo. Nachts sind Eulen und Igel unterwegs!',
            'Hallo, Nachtschwärmer! Mit Laterne finden wir sogar im Dunkeln etwas.',
          ],
          daemmerung: [
            'Hallo, ich bin Wingo! In der Dämmerung wachen die Fledermäuse auf.',
            'Hallo! Es wird dunkel – ich hab meine Laterne dabei.',
          ],
        },
        weather: {
          regen: [
            'Hallo, ich bin Wingo! Hörst du den Regen? Die Schnecken freuen sich!',
            'Regenwetter! Zieh Gummistiefel an – heute finden wir Pfützen und Schnecken.',
          ],
          nach_regen: [
            'Hallo, ich bin Wingo! Nach dem Regen riecht der Wald so gut!',
            'Der Regen ist vorbei! Jetzt kriechen Schnecken und Regenwürmer heraus.',
          ],
          schnee: [
            'Hallo, ich bin Wingo! Schnee! Im Schnee sieht man tolle Tierspuren.',
            'Alles weiß! Wollen wir zusammen Spuren im Schnee suchen?',
          ],
          frost: [
            'Brrr, Frost! Ich bin Wingo. Schau mal, wie die Blätter glitzern!',
            'Hallo! Heute ist alles mit Raureif bezuckert – wie Puderzucker!',
          ],
          wind: [
            'Huiii, ist das windig! Ich bin Wingo – halt deine Mütze fest!',
            'Hallo! Der Wind schüttelt die Bäume. Vielleicht fallen Zapfen herunter?',
          ],
          nebel: [
            'Hallo, ich bin Wingo! Im Nebel ist der Wald ganz geheimnisvoll.',
            'So viel Nebel! Bleib nah bei mir, dann gehen wir zusammen los.',
          ],
        },
        daytime: {
          morgen: ['Guten Morgen! Ich bin Wingo. Die Vögel singen schon ihr Morgenlied.'],
          abend: ['Guten Abend! Ich bin Wingo. Bald kommen die Rehe auf die Wiese.'],
        },
        season: {
          fruehling: ['Hallo, ich bin Wingo! Im Frühling blüht und summt der ganze Wald.'],
          sommer: ['Hallo, ich bin Wingo! Im Sommer ist der Wald schön schattig und grün.'],
          herbst: ['Hallo, ich bin Wingo! Im Herbst sammle ich Eicheln und bunte Blätter.'],
          winter: ['Hallo, ich bin Wingo! Im Winter ruhen viele Tiere. Wir sind ganz leise.'],
        },
        sunny: ['Hallo, ich bin Wingo! Die Sonne scheint – ab in den Wald!'],
        cloudy: ['Hallo, ich bin Wingo! Ein paar Wolken – perfektes Entdeckerwetter!'],
      },
      [
        'Hallo, ich bin Wingo! Kommst du mit in den Wald?',
        'Hallo! Ich bin Wingo, das Waldmonster. Wollen wir zusammen suchen?',
        'Hallo, ich bin Wingo! Ich liebe Schnüffeln, Sammeln und Entdecken.',
      ],
    ),

  welcomeBack: (c) => {
    const n = c.count ?? 0
    const progress =
      n === 1
        ? ['Da bist du ja! Einen Fund hast du schon – weiter geht’s!']
        : n > 1
          ? [`Da bist du ja! Schon ${n} Funde auf deiner Karte – weiter geht’s!`]
          : []
    return [
      ...progress,
      ...withContext(
        c,
        {
          dark: {
            nacht: ['Da bist du ja wieder! Leise, leise – die Nachttiere sind wach.'],
            daemmerung: ['Willkommen zurück! In der Dämmerung wird es spannend.'],
          },
          weather: {
            regen: ['Du bist wieder da! Bei Regen suchen wir einfach unter Blättern weiter.'],
            nach_regen: ['Willkommen zurück! Nach dem Regen gibt’s bestimmt neue Funde.'],
            schnee: ['Wieder da? Prima! Im Schnee gibt es jetzt neue Spuren.'],
            frost: ['Da bist du ja! Zieh dich warm an, dann suchen wir weiter.'],
            wind: ['Wieder da! Der Wind hat bestimmt neue Zapfen heruntergeweht.'],
            nebel: ['Willkommen zurück! Im Nebel schauen wir ganz genau hin.'],
          },
          daytime: {
            morgen: ['Guten Morgen! Wollen wir an deiner Karte weitersuchen?'],
            abend: ['Guten Abend! Ein paar Funde schaffen wir bestimmt noch.'],
          },
          season: {
            fruehling: ['Schön, dass du da bist! Im Frühling wächst jeden Tag etwas Neues.'],
            sommer: ['Da bist du ja! Der Sommerwald hat noch viele Überraschungen.'],
            herbst: ['Willkommen zurück! Ich habe extra Eicheln für dich gesammelt.'],
            winter: ['Da bist du ja! Komm, wir wärmen uns beim Suchen auf.'],
          },
          sunny: ['Da bist du ja! Bei Sonnenschein sucht es sich besonders schön.'],
        },
        [
          'Da bist du ja wieder! Wollen wir weitersuchen?',
          'Schön, dass du zurück bist! Deine Karte wartet schon auf dich.',
          'Willkommen zurück! Ich habe deine Funde gut aufbewahrt.',
        ],
      ),
    ]
  },

  setup: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: ['Eine Nachtwanderung? Wie aufregend! Nimm eine Taschenlampe mit.'],
          daemmerung: ['In der Dämmerung kommen Fledermäuse und Rehe heraus.'],
        },
        weather: {
          regen: ['Regen? Super! Dann suchen wir Schnecken, Pilze und Pfützen.'],
          nach_regen: ['Nach dem Regen ist der Waldboden voller Leben. Das wird toll!'],
          schnee: ['Schnee! Ich packe meinen Schal ein. Wo geht’s hin?'],
          frost: ['Frostig heute! Raureif-Funde kommen auf die Karte.'],
          wind: ['Bei Wind rascheln die Blätter. Wo wollen wir suchen?'],
          nebel: ['Nebel macht den Wald geheimnisvoll. Wo seid ihr gerade?'],
        },
        daytime: {
          morgen: ['Am Morgen ist der Wald frisch und voller Vogelgesang.'],
          abend: ['Am Abend wird es im Wald ganz ruhig und gemütlich.'],
        },
        season: {
          fruehling: ['Im Frühling gibt’s Blüten, Knospen und Vogelnester zu entdecken.'],
          sommer: ['Im Sommer summen Bienen und Käfer krabbeln überall.'],
          herbst: ['Im Herbst gibt’s Pilze, Kastanien und buntes Laub.'],
          winter: ['Im Winter suchen wir Spuren, Zapfen und Futterstellen.'],
        },
        sunny: ['Sonnenschein! Da flattern bestimmt viele Schmetterlinge.'],
        cloudy: ['Ein paar Wolken? Kein Problem, im Wald ist es immer schön.'],
      },
      [
        'Wo und wann sind wir unterwegs?',
        'Erzähl mir: Wo seid ihr und wie ist das Wetter?',
        'Wähl aus, wie schwer es sein soll – ich helfe dir!',
        'Wie viele Waldforscher kommen mit?',
      ],
    ),

  creating: (c) =>
    withContext(
      c,
      {
        dark: { nacht: ['Ich halte meine Laterne hoch und schaue, was hier wohnt …'] },
        weather: {
          regen: ['Ich schüttle noch schnell den Regen aus meinem Fell …'],
          schnee: ['Ich klopfe noch den Schnee von meinen Hörnchen …'],
          wind: ['Ich halte meine Karte gut fest, damit sie nicht wegfliegt …'],
        },
      },
      [
        'Ich schnuppere mal, was es hier zu finden gibt …',
        'Moment, ich packe deine Bingokarte …',
        'Schnupper, schnupper … ich rieche Moos und Pilze!',
        'Ich frage mal Olli, welche Tiere hier wohnen …',
        'Gleich fertig! Ich male noch die letzten Felder.',
      ],
    ),

  start: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: ['Los geht’s! Leuchte vorsichtig – und lausche auf die Eule.'],
          daemmerung: ['Los geht’s! Gleich flattern die ersten Fledermäuse.'],
        },
        weather: {
          regen: ['Los geht’s! Schau unter Blätter – da verstecken sich Tiere vor dem Regen.'],
          nach_regen: ['Los! Nach dem Regen glitzern Tropfen an Spinnennetzen.'],
          schnee: ['Los geht’s! Im Schnee findest du Spuren von Reh, Fuchs und Hase.'],
          frost: ['Los geht’s! Bei Frost glitzern die Gräser wie Zuckerstangen.'],
          wind: ['Los! Bei Wind schaukeln die Äste – schau auch mal nach oben!'],
          nebel: ['Los geht’s! Im Nebel schauen wir ganz genau – Schritt für Schritt.'],
        },
        daytime: {
          morgen: ['Los geht’s! Morgens sind die Tiere besonders munter.'],
          abend: ['Los geht’s! Am Abend kommen die Rehe aus dem Wald.'],
        },
        season: {
          fruehling: ['Los geht’s! Hörst du die Vögel? Sie bauen gerade Nester.'],
          sommer: ['Los geht’s! Im Sommer krabbelt und summt es überall.'],
          herbst: ['Los geht’s! Raschel mal durchs Laub – da steckt viel drin.'],
          winter: ['Los geht’s! Viele Tiere ruhen – wir suchen ihre Spuren.'],
        },
        sunny: ['Los geht’s! In der Sonne wärmen sich Käfer und Eidechsen.'],
      },
      [
        'Los geht’s! Augen auf im Wald!',
        'Deine Karte ist fertig! Was findest du zuerst?',
        'Auf geht’s, Waldforscher! Ich bin schon so gespannt!',
        'Tipp ein Feld an, wenn du etwas gefunden hast!',
      ],
    ),

  found: (c) => {
    const thing = c.thing?.trim()
    const n = c.count ?? 0
    if (!thing) {
      const milestone = n === 1 ? ['Dein erster Fund! Super!'] : n >= 5 && n % 5 === 0 ? [`Schon ${n} Funde! Du bist richtig gut!`] : []
      return [...milestone, 'Super gefunden!', 'Juhu, ein Treffer!', 'Toll gemacht!', 'Gut gesucht, weiter so!']
    }
    const milestone =
      n === 1
        ? [`Dein erster Fund: ${thing}! Super!`]
        : n >= 5 && n % 5 === 0
          ? [`${thing}! Schon ${n} Funde – du bist ein Profi!`]
          : []
    return [
      ...milestone,
      `Juhu, ${thing}! Gut gesucht!`,
      `${thing} gefunden! Du hast Adleraugen!`,
      `Toll! ${thing} kommt in unsere Sammlung.`,
      `Wow, ${thing}! Das hätte ich fast übersehen.`,
      `Treffer! ${thing} ist abgehakt.`,
      // Fallbacks für sehr lange Namen (werden oben ggf. herausgefiltert)
      'Super gefunden!',
    ]
  },

  unfound: () => [
    'Kein Problem – such einfach weiter!',
    'Huch, doch nicht? Macht nichts!',
    'Okay, ich habe das Häkchen wieder weggenommen.',
    'Alles gut – das findest du bestimmt noch!',
  ],

  almost: () => [
    'Nur noch eins bis zum Bingo!',
    'Psst … dir fehlt nur noch ein Feld!',
    'Ganz knapp! Noch ein Fund, dann ist Bingo!',
    'Mein Fell kribbelt – gleich ist Bingo!',
  ],

  bingo: () => [
    'BINGO! Du bist ein echter Waldforscher!',
    'BINGO! Ich mache einen Freudensprung!',
    'Juhuuu, BINGO! Das war super gesucht!',
    'BINGO! Der ganze Wald jubelt mit dir!',
  ],

  full: () => [
    'Alles gefunden! Du bist ein Waldmeister!',
    'Volle Karte! So gut hat noch niemand den Wald erforscht!',
    'Wow, alle 25 Felder! Du kennst den Wald richtig gut!',
    'Alles voll! Zeit für ein Picknick zur Feier!',
  ],

  idle: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: ['Pssst, nachts schlafen viele Tiere. Wir sind ganz leise.', 'Hörst du die Eule? Huhu, huhu!'],
          daemmerung: ['In der Dämmerung kommen Rehe aus dem Wald. Ganz leise sein!'],
        },
        weather: {
          regen: ['Bei Regen kriechen Schnecken und Regenwürmer heraus!', 'Unter dicken Blättern bleiben Käfer schön trocken.'],
          nach_regen: ['Nach dem Regen kommen die Schnecken raus!', 'Schau mal in die Pfützen – spiegelt sich da ein Baum?'],
          schnee: ['Siehst du Spuren im Schnee? Wer war hier unterwegs?', 'Im Schnee kann man Tierspuren besonders gut lesen.'],
          frost: ['Schau mal: Raureif macht aus Spinnennetzen Glitzerketten!'],
          wind: ['Hörst du, wie der Wind in den Blättern rauscht?', 'Bei Wind fallen Zapfen und Nüsse auf den Boden.'],
          nebel: ['Im Nebel hört man besonders gut. Lausch mal!'],
        },
        daytime: {
          morgen: ['Morgens glitzert der Tau auf den Gräsern.'],
          abend: ['Am Abend tanzen kleine Mücken im Sonnenlicht.'],
        },
        season: {
          fruehling: ['Im Frühling bauen Vögel Nester. Hörst du sie zwitschern?'],
          sommer: ['Im Sommer summt es überall. Schau mal auf die Blüten!'],
          herbst: ['Im Herbst verstecken Eichhörnchen Nüsse. Flitz auch!'],
          winter: ['Im Winter halten Igel und Siebenschläfer Winterschlaf.'],
        },
        sunny: ['In der Sonne wärmen sich Käfer auf Steinen und Baumstämmen.'],
        cloudy: ['Wolken sind prima: Dann sind viele Tiere entspannt unterwegs.'],
      },
      [
        'Schau mal unter Blätter und hinter Baumstämme!',
        'Hör mal genau hin: Raschelt da etwas?',
        'Bleib mal still stehen. Dann kommen die Tiere näher.',
        'Schau auch nach oben in die Baumkronen!',
        'Riech mal am Waldboden – so duftet Moos!',
        'Pilze nur anschauen, nicht anfassen!',
        'Tiere beobachten wir leise und mit Abstand.',
      ],
    ),

  switch: (c) => {
    const p = c.player?.trim()
    const named = p
      ? [`Jetzt bist du dran, ${p}! Was findest du?`, `Hallo ${p}! Deine Karte wartet schon.`, `${p} ist dran – Augen auf im Wald!`]
      : []
    return [
      ...named,
      'Jetzt bist du dran! Was findest du?',
      'Spielerwechsel! Zeig mal, was du entdeckst.',
      'Neue Karte, neue Funde – los geht’s!',
    ]
  },

  choose: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: ['Hast du es im Dunkeln entdeckt? Foto mit Licht – oder einfach abhaken!'],
          daemmerung: ['Gefunden, obwohl es dämmert? Toll! Foto machen oder abhaken?'],
        },
        weather: {
          regen: ['Gefunden? Schnell ein Foto – oder einfach abhaken, bevor alles nass wird!'],
          schnee: ['Im Schnee entdeckt? Zeig es mir mit einem Foto – oder hak es ab!'],
          nebel: ['Im Nebel gefunden? Super Augen! Foto machen oder abhaken?'],
        },
      },
      [
        'Hast du es entdeckt? Zeig es mir mit einem Foto – oder hak es einfach ab!',
        'Gefunden? Mach ein Foto für mich – oder hak es einfach ab!',
        'Oh, zeig mal! Foto machen oder direkt abhaken?',
      ],
    ),

  join: () => [
    'Schön, dass du mitspielst!',
    'Hallo! Such dir aus, wer du auf der Karte bist.',
    'Super, zusammen suchen macht doppelt Spaß!',
    'Gib den Code ein – dann geht’s los!',
  ],

  error: () => [
    'Hoppla, da ist etwas schiefgegangen.',
    'Oh nein, ich bin über eine Wurzel gestolpert!',
    'Hmm, das hat nicht geklappt. Versuch es gleich nochmal.',
    'Da hat sich etwas im Gestrüpp verheddert.',
  ],

  // ── Expedition planen: Wingo begleitet den nächsten Schritt ──────────────
  // Zeilen ohne Wetter-Kontext, damit nachgeladene Werte die Zeile nicht ändern.
  setupWhere: () => [
    'Wo seid ihr? Tipp auf die Karte oder auf „Mein Standort“!',
    'Zeig mir auf der Karte, in welchem Wald ihr seid!',
    'Wo geht’s hin? Dann weiß ich, welche Tiere dort wohnen.',
    'Erst mal: Wo seid ihr? Dann schnuppere ich nach dem Wetter.',
  ],

  setupLookup: (c) => [
    ...(c.offline ? [] : ['Ich schnuppere mal, wie das Wetter bei euch ist …']),
    'Moment, ich schaue, wo ihr seid …',
    'Schnupper, schnupper … gleich weiß ich mehr über euren Wald!',
    'Ich schaue auf meine Waldkarte … einen Moment!',
  ],

  setupWeather: (c) => [
    ...(c.offline ? ['Kein Netz? Macht nichts! Wie ist das Wetter bei euch?'] : []),
    'Wie ist das Wetter bei euch? Tipp es unten an!',
    'Regnet es, schneit es oder ist es trocken? Sag es mir unten!',
    'Ich kann das Wetter gerade nicht sehen. Wie ist es bei euch?',
  ],

  setupReady: (c) => [
    ...(c.offline ? ['Kein Netz? Macht nichts – meine Waldkarte klappt auch so!'] : []),
    ...withContext(
      c,
      {
        dark: {
          nacht: ['Eine Nachtwanderung! Nimm eine Taschenlampe mit – dann los!'],
          daemmerung: ['In der Dämmerung kommen Rehe heraus. Alles bereit?'],
        },
        weather: {
          regen: ['Regen? Super! Schnecken und Pilze warten schon. Los geht’s!'],
          nach_regen: ['Nach dem Regen ist der Waldboden voller Leben. Alles bereit?'],
          schnee: ['Schnee! Ich packe meinen Schal ein – und dann los!'],
          frost: ['Frostig heute! Zieh dich warm an, dann geht’s los.'],
          wind: ['Bei Wind rascheln die Blätter. Alles bereit? Los geht’s!'],
          nebel: ['Nebel macht den Wald geheimnisvoll. Bleibt nah beieinander!'],
        },
        daytime: {
          morgen: ['Am Morgen singen die Vögel am lautesten. Alles bereit?'],
          abend: ['Am Abend wird der Wald ganz ruhig. Los geht’s!'],
        },
        season: {
          fruehling: ['Im Frühling gibt’s Blüten und Vogelnester. Alles bereit?'],
          sommer: ['Im Sommer summt und krabbelt es überall. Los geht’s!'],
          herbst: ['Im Herbst gibt’s Pilze, Kastanien und buntes Laub. Alles bereit?'],
          winter: ['Im Winter suchen wir Spuren und Zapfen. Alles bereit?'],
        },
        sunny: ['Sonnenschein! Da flattern bestimmt Schmetterlinge. Los geht’s!'],
        cloudy: ['Ein paar Wolken? Perfektes Entdeckerwetter! Alles bereit?'],
      },
      [
        'Alles bereit? Dann tipp unten auf „Los geht’s!“',
        'Wie schwer soll es sein? Pilzi, Flitz und Fine helfen dir.',
        'Wie viele Waldforscher kommen mit? Stell es unten ein!',
        'Mein Rucksack ist gepackt. Los geht’s!',
      ],
    ),
  ],

  // ── Foto-Prüfung: Wingo kommentiert die Erkennung ──────────────────────
  photoLoading: (c) =>
    withContext(
      c,
      {
        dark: {
          nacht: ['Ich hole meine Lupe und halte die Laterne hoch …'],
          daemmerung: ['Ich hole meine Lupe und halte die Laterne hoch …'],
        },
      },
      [
        'Ich hole schnell meine Lupe … einen Moment!',
        'Moment, ich putze noch meine Lupe blitzblank …',
        'Ich krame meine Lupe aus dem Rucksack …',
      ],
    ),

  photoChecking: (c) => {
    const t = c.thing?.trim()
    return [
      ...(t ? [`${t}? Ich schaue ganz genau hin …`] : []),
      'Ich schaue mir dein Foto ganz genau an …',
      'Hmm, lass mich mal schnuppern … äh, gucken!',
      'Ich zähle Beinchen, Blätter und Farben …',
    ]
  },

  photoMatch: (c) => {
    const t = c.thing?.trim()
    const k = c.kind ? KIND[c.kind] : null
    // „Pilz“ als Pilz → nicht doppelt sagen („… nach einem Pilz aus – Pilz gefunden!“).
    const same = !!t && !!k && k.nom.toLowerCase().endsWith(t.toLowerCase())
    return [
      ...(t && k && !same ? [`Juhu! Das sieht nach ${k.dat} aus – ${t} gefunden!`] : []),
      ...(k ? [`Meine Lupe sagt: Das ist ${k.nom}! Super Foto!`] : []),
      ...(t ? [`${t}? Ja, das passt! Tipp auf „Gefunden!“`] : []),
      'Super Foto! Das passt – tipp auf „Gefunden!“',
      'Treffer! Meine Lupe ist ganz begeistert.',
      'Juhu, das erkenne ich! Du hast Adleraugen.',
    ]
  },

  photoUnsure: (c) => {
    const t = c.thing?.trim()
    return withContext(
      c,
      {
        dark: {
          nacht: ['Im Dunkeln sehe ich nicht so gut. Mehr Licht – oder einfach abhaken!'],
          daemmerung: ['Es ist schon so dämmrig. Mehr Licht – oder einfach abhaken!'],
        },
        weather: {
          nebel: ['Im Nebel ist alles verschwommen. Geh noch ein Stück näher ran!'],
          regen: ['Tropfen auf der Linse? Wisch sie ab und probier es nochmal!'],
        },
      },
      [
        ...(t ? [`${t}? Da bin ich nicht sicher. Hast du es gesehen? Dann hak es ab!`] : []),
        'Geh ganz nah ran und mach noch ein Foto – dann sehe ich es besser!',
        'Meine Lupe ist heute etwas müde. Du hast es gesehen? Dann hak es ab!',
        'Hmm, da bin ich nicht ganz sicher …',
      ],
    )
  },

  photoOther: (c) => {
    const t = c.thing?.trim()
    const g = c.guess && c.guess !== c.kind ? KIND[c.guess] : null
    return [
      ...(g ? [`Oh! Für mich sieht das eher nach ${g.dat} aus. Was meinst du?`] : []),
      ...(g && t ? [`Ich glaube, das ist eher ${g.nom}. ${t} gesehen? Dann hak es ab!`] : []),
      ...(g ? [`Hmm, eher ${g.nom}? Geh näher ran und probier es nochmal!`] : []),
      'Oh, das sieht für mich nach etwas anderem aus. Was meinst du?',
      'Hmm, ich sehe da etwas anderes. Geh näher ran und probier es nochmal!',
      'Ich bin mir nicht sicher. Du hast es gesehen? Dann hak es trotzdem ab!',
    ]
  },

  photoError: (c) => {
    const t = c.thing?.trim()
    return [
      ...(t ? [`Hoppla, meine Lupe klemmt! ${t} gesehen? Dann hak es selbst ab.`] : []),
      'Hoppla, meine Lupe klemmt! Du kannst es trotzdem abhaken.',
      'Oh, ich bin über eine Wurzel gestolpert! Hak es einfach selbst ab.',
      'Das Prüfen hat nicht geklappt. Du hast es gesehen? Dann hak es ab!',
    ]
  },

  photoOffline: (c) => {
    const t = c.thing?.trim()
    return [
      'Ohne Internet bleibt meine Lupe zu Hause. Hak es einfach selbst ab!',
      ...(t ? [`Kein Netz, keine Lupe. ${t} gesehen? Dann hak es selbst ab!`] : []),
      'Kein Netz im Wald? Macht nichts – ich glaube deinen Adleraugen!',
      'Hier gibt’s kein Internet. Du hast es gesehen? Dann hak es selbst ab!',
    ]
  },
}
