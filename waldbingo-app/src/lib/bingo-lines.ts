// Bingo-Linien für die Spielbrett-Darstellung: welche Reihen/Spalten/Diagonalen
// sind komplett (golden markieren), welche haben 4 von 5 („fast Bingo“) und
// welches Feld fehlt dort noch. Reine Funktionen ohne DOM-/React-Bezug.
//
// Die Spiel-Logik selbst (generator.checkBingo) bleibt unverändert; diese Datei
// liefert nur die feineren Informationen, die das Brett für Effekte braucht.

/** Kantenlänge der Bingo-Karte (5 × 5). */
export const GRID = 5

export type LineKind = 'row' | 'col' | 'diag'

export interface BingoLine {
  /** Stabiler Schlüssel, z. B. „row-2“, „col-0“, „diag-0“ (↘) / „diag-1“ (↗). */
  id: string
  kind: LineKind
  /** Reihen-/Spaltennummer bzw. 0 = Hauptdiagonale ↘, 1 = Gegendiagonale ↗. */
  index: number
  /** Die fünf Feld-Indizes (0 … 24) in Lese-Reihenfolge. */
  cells: readonly number[]
}

export interface AlmostLine {
  line: BingoLine
  /** Das eine noch fehlende Feld. */
  missing: number
}

export interface LineStatus {
  /** Komplette Linien (Bingo). */
  complete: BingoLine[]
  /** Linien mit genau 4 von 5 gefundenen Feldern. */
  almost: AlmostLine[]
  /** Alle Felder, die in mindestens einer kompletten Linie liegen. */
  goldenCells: Set<number>
  /** Felder, die eine „fast fertige“ Linie vervollständigen würden. */
  hotCells: Set<number>
}

function buildLines(): BingoLine[] {
  const out: BingoLine[] = []
  for (let r = 0; r < GRID; r++) {
    out.push({ id: `row-${r}`, kind: 'row', index: r, cells: range(GRID).map((c) => r * GRID + c) })
  }
  for (let c = 0; c < GRID; c++) {
    out.push({ id: `col-${c}`, kind: 'col', index: c, cells: range(GRID).map((r) => r * GRID + c) })
  }
  out.push({ id: 'diag-0', kind: 'diag', index: 0, cells: range(GRID).map((i) => i * GRID + i) })
  out.push({ id: 'diag-1', kind: 'diag', index: 1, cells: range(GRID).map((i) => i * GRID + (GRID - 1 - i)) })
  return out
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

/** Alle 12 möglichen Bingo-Linien (5 Reihen, 5 Spalten, 2 Diagonalen). */
export const BINGO_LINES: readonly BingoLine[] = Object.freeze(buildLines())

/** Komplette Linien in fester Reihenfolge (Reihen, Spalten, Diagonalen). */
export function completeLines(found: ReadonlySet<number>): BingoLine[] {
  return BINGO_LINES.filter((l) => l.cells.every((i) => found.has(i)))
}

/** Linien mit genau 4 von 5 Feldern samt dem fehlenden Feld. */
export function almostLines(found: ReadonlySet<number>): AlmostLine[] {
  const out: AlmostLine[] = []
  for (const line of BINGO_LINES) {
    const open = line.cells.filter((i) => !found.has(i))
    if (open.length === 1) out.push({ line, missing: open[0] })
  }
  return out
}

/** Gesamtstatus fürs Brett (komplette + fast fertige Linien, markierte Felder). */
export function lineStatus(found: ReadonlySet<number>): LineStatus {
  const complete = completeLines(found)
  const almost = almostLines(found)
  const goldenCells = new Set<number>()
  for (const l of complete) for (const i of l.cells) goldenCells.add(i)
  const hotCells = new Set(almost.map((a) => a.missing))
  return { complete, almost, goldenCells, hotCells }
}

/** Ist die Karte voll (alle 25 Felder gefunden)? */
export function isFullCard(found: ReadonlySet<number>): boolean {
  for (let i = 0; i < GRID * GRID; i++) if (!found.has(i)) return false
  return true
}

/** Was hat sich durch einen Klick verändert? Grundlage für Reaktionen & Feiern. */
export type LineEvent = 'full' | 'bingo' | 'almost' | 'found' | 'unfound' | 'none'

/**
 * Vergleicht den Zustand vor und nach einer Änderung und liefert das
 * wichtigste Ereignis (volle Karte > neue Bingo-Linie > neue 4/5-Linie > Fund).
 */
export function lineEvent(before: ReadonlySet<number>, after: ReadonlySet<number>): LineEvent {
  if (after.size < before.size) return 'unfound'
  if (after.size === before.size) return 'none'
  if (isFullCard(after) && !isFullCard(before)) return 'full'
  if (newIds(completeLines(before), completeLines(after)) > 0) return 'bingo'
  const almostBefore = new Set(almostLines(before).map((a) => a.line.id))
  if (almostLines(after).some((a) => !almostBefore.has(a.line.id))) return 'almost'
  return 'found'
}

function newIds(before: BingoLine[], after: BingoLine[]): number {
  const seen = new Set(before.map((l) => l.id))
  return after.filter((l) => !seen.has(l.id)).length
}
