// Kachel-Namen für Leseanfänger: Trennung nur an Wortfugen („Tannen-zapfen“,
// nie „Tannenzap-fen“). Dafür ein weiches Trennzeichen (U+00AD) an der Fuge –
// die Kachel nutzt `hyphens: manual`. Lange Wörter ohne Fuge werden kleiner gesetzt.

const SHY = '­'

/** Bekannte Wörter des kuratierten Pools mit ihrer Fuge (| = Trennstelle). */
const JOINTS: Record<string, string> = {
  eichhörnchen: 'Eich|hörnchen',
  vogelnest: 'Vogel|nest',
  ameisenhaufen: 'Ameisen|haufen',
  schmetterling: 'Schmetter|ling',
  marienkäfer: 'Marien|käfer',
  spinnennetz: 'Spinnen|netz',
  regenwurm: 'Regen|wurm',
  glühwürmchen: 'Glüh|würmchen',
  tannenzapfen: 'Tannen|zapfen',
  herbstblatt: 'Herbst|blatt',
  löwenzahn: 'Löwen|zahn',
  brennnessel: 'Brenn|nessel',
  baumrinde: 'Baum|rinde',
  baumstumpf: 'Baum|stumpf',
  tannenzweig: 'Tannen|zweig',
  fliegenpilz: 'Fliegen|pilz',
  baumpilz: 'Baum|pilz',
  tierspur: 'Tier|spur',
  angeknabberte: 'Ange|knabberte',
  schneckenhaus: 'Schnecken|haus',
  waldbank: 'Wald|bank',
  aussichtsturm: 'Aussichts|turm',
  wegweiser: 'Weg|weiser',
  eiszapfen: 'Eis|zapfen',
  pfotenabdruck: 'Pfoten|abdruck',
}

/**
 * Häufige Grundwörter am Wortende (für Live-Arten wie „Zitronenfalter“,
 * „Rotkehlchen“, „Waldameise“). Längere zuerst, damit „käfer“ vor „fer“ greift.
 */
const TAILS = [
  'schnecke', 'kehlchen', 'würmchen', 'schwamm', 'schwanz', 'spinne', 'fliege', 'falter', 'zapfen',
  'ameise', 'blume', 'beere', 'kraut', 'käfer', 'drossel', 'specht', 'taube', 'meise', 'fink',
  'eiche', 'buche', 'tanne', 'fichte', 'kiefer', 'linde', 'birke', 'weide', 'ahorn', 'nessel',
  'pilz', 'ling', 'wurm', 'vogel', 'gras', 'farn', 'moos', 'baum', 'blatt', 'holz', 'maus', 'ente',
].sort((a, b) => b.length - a.length)

/** Wort mit weichem Trennzeichen an der Fuge (oder unverändert). */
function joinWord(word: string): string {
  const lower = word.toLowerCase()
  const known = JOINTS[lower]
  if (known) {
    // Groß-/Kleinschreibung des Originals übernehmen.
    const parts = known.split('|')
    return word.slice(0, parts[0].length) + SHY + word.slice(parts[0].length)
  }
  if (word.length < 9) return word
  for (const tail of TAILS) {
    const head = lower.length - tail.length
    if (head >= 3 && lower.endsWith(tail)) return word.slice(0, head) + SHY + word.slice(head)
  }
  return word
}

/** Anzeige-Name: weiche Trennzeichen nur an Wortfugen. */
export function tileName(name: string): string {
  return name
    .split(/(\s+|-)/)
    .map((part) => (/^\s+$|^-$/.test(part) ? part : joinWord(part)))
    .join('')
}

/** Längste Silbe/Teilwort, das ohne Trennung in eine Zeile passen muss. */
function longestSegment(name: string): number {
  return Math.max(
    1,
    ...tileName(name)
      .split(/[\s­-]+/)
      .map((w) => w.length),
  )
}

export interface NameFit {
  /** Faktor für die Schriftgröße (1 = Standard). */
  scale: number
  /** Kleinste Schriftgröße in px. */
  min: number
  /** Erlaubte Zeilen (lange Namen aus mehreren Wörtern dürfen dreizeilig werden). */
  lines: 2 | 3
}

/**
 * Schriftgröße nach dem längsten Teilwort: Es soll ungetrennt in die Kachel
 * passen (Handy ≈ 54 px Textbreite → ca. 8 Zeichen bei 11,5 px). Untergrenze 10 px.
 */
export function nameFit(name: string): NameFit {
  const seg = longestSegment(name)
  let scale = seg <= 7 ? 1 : Math.max(0.78, 7.4 / seg)
  const lines: 2 | 3 = name.length > 16 && /\s/.test(name.trim()) ? 3 : 2
  if (lines === 3) scale = Math.min(scale, 0.86)
  return { scale, min: 10, lines }
}
