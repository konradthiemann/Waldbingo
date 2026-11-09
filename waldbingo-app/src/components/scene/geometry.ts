// Deterministische Geometrie der Waldszene: Pfad-Generatoren und feste
// Platzierungen. Keine Zufälligkeit zur Laufzeit – jede Szene sieht bei jedem
// Render gleich aus (Art Bible §7). Reine Funktionen, ohne DOM/React.

/**
 * Gemeinsames Koordinatensystem aller Landschaftsebenen (viewBox).
 * Die Ebenen werden mit `xMidYMax slice` eingepasst: Am Handy (390×844) ist
 * etwa x ∈ [783, 1217] sichtbar, am Desktop (1280×800) etwa x ∈ [250, 1750].
 * Wichtige Motive liegen deshalb in der Mitte, Beiwerk außen.
 */
export const VIEW_W = 2000
export const VIEW_H = 600

export type Pt = readonly [number, number]

/** Kleiner deterministischer Zufallsgenerator (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Rundet auf eine Nachkommastelle (kürzere Pfad-Strings). */
const r = (n: number) => Math.round(n * 10) / 10

/** Weiche Kurve (Catmull-Rom → kubische Bézier) durch alle Punkte. */
export function smoothLine(points: readonly Pt[]): string {
  if (points.length < 2) return ''
  let d = `M${r(points[0][0])} ${r(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(p2[0])} ${r(p2[1])}`
  }
  return d
}

/** Fläche unter einer weichen Kurve bis zur Grundlinie `bottom`. */
export function smoothArea(points: readonly Pt[], bottom: number = VIEW_H): string {
  const first = points[0]
  const last = points[points.length - 1]
  return `${smoothLine(points)}L${r(last[0])} ${bottom}L${r(first[0])} ${bottom}Z`
}

/** Höhe einer Kantenlinie an Stelle x (lineare Näherung zwischen Stützpunkten). */
export function yAt(points: readonly Pt[], x: number): number {
  if (x <= points[0][0]) return points[0][1]
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    if (x <= x2) {
      const t = (x - x1) / (x2 - x1)
      // Kosinus-Interpolation passt besser zur weichen Kurve als linear.
      const k = (1 - Math.cos(t * Math.PI)) / 2
      return y1 + (y2 - y1) * k
    }
  }
  return points[points.length - 1][1]
}

// ── Tanne (Nadelbaum) ────────────────────────────────────────────────────────
// Lokales Koordinatensystem: Stammfuß bei (0,0), der Baum wächst nach oben (−y).
// Eine Etage = weiches Dreieck mit leicht eingezogenen Flanken und gewellter
// Unterkante („knuffig“ statt spitz).

export type Tier = readonly [top: number, bottom: number, halfWidth: number]

/** Etagen der Standard-Tanne (Höhe 100). */
export const FIR_TIERS: readonly Tier[] = [
  [-100, -63, 17],
  [-81, -38, 25],
  [-60, -11, 34],
]

/** Etagen der großen Rahmen-Tanne (Höhe ≈ 100, mehr Etagen). */
export const BIG_FIR_TIERS: readonly Tier[] = [
  [-100, -76, 11],
  [-88, -60, 17],
  [-73, -42, 23],
  [-56, -22, 29],
  [-38, -3, 35],
]

export function firTier([top, bottom, hw]: Tier): string {
  const h = bottom - top
  const tip = hw * 0.16
  const cy = bottom - h * 0.08
  return [
    `M${r(-tip)} ${r(top + h * 0.12)}`,
    `Q0 ${r(top - h * 0.05)} ${r(tip)} ${r(top + h * 0.12)}`,
    `Q${r(hw * 0.55)} ${r(top + h * 0.55)} ${r(hw)} ${r(cy)}`,
    `Q${r(hw * 1.02)} ${r(bottom + h * 0.1)} ${r(hw * 0.64)} ${r(bottom)}`,
    `Q${r(hw * 0.32)} ${r(bottom + h * 0.17)} 0 ${r(bottom)}`,
    `Q${r(-hw * 0.32)} ${r(bottom + h * 0.17)} ${r(-hw * 0.64)} ${r(bottom)}`,
    `Q${r(-hw * 1.02)} ${r(bottom + h * 0.1)} ${r(-hw)} ${r(cy)}`,
    `Q${r(-hw * 0.55)} ${r(top + h * 0.55)} ${r(-tip)} ${r(top + h * 0.12)}Z`,
  ].join('')
}

/** Schattenseite (rechts) einer Etage – Licht kommt von links oben. */
export function firShade([top, bottom, hw]: Tier): string {
  const h = bottom - top
  const cy = bottom - h * 0.08
  return [
    `M${r(hw * 0.06)} ${r(top + h * 0.08)}`,
    `Q${r(hw * 0.55)} ${r(top + h * 0.55)} ${r(hw)} ${r(cy)}`,
    `Q${r(hw * 1.02)} ${r(bottom + h * 0.1)} ${r(hw * 0.64)} ${r(bottom)}`,
    `Q${r(hw * 0.4)} ${r(bottom + h * 0.15)} ${r(hw * 0.2)} ${r(bottom + h * 0.04)}`,
    `Q${r(hw * 0.32)} ${r(top + h * 0.5)} ${r(hw * 0.06)} ${r(top + h * 0.08)}Z`,
  ].join('')
}

/** Glanzlicht-Strich an der linken Flanke. */
export function firHighlight([top, bottom, hw]: Tier): string {
  const h = bottom - top
  return `M${r(-hw * 0.18)} ${r(top + h * 0.3)}Q${r(-hw * 0.42)} ${r(top + h * 0.62)} ${r(-hw * 0.7)} ${r(bottom - h * 0.16)}`
}

/** Schneehaube auf einer Etage (oberer Teil mit gewellter Unterkante). */
export function firSnowCap([top, bottom, hw]: Tier): string {
  const h = bottom - top
  const tip = hw * 0.16
  const y = top + h * 0.44
  const x = hw * 0.47
  return [
    `M${r(-tip)} ${r(top + h * 0.12)}`,
    `Q0 ${r(top - h * 0.05)} ${r(tip)} ${r(top + h * 0.12)}`,
    `Q${r(hw * 0.32)} ${r(top + h * 0.27)} ${r(x)} ${r(y)}`,
    `Q${r(x * 0.72)} ${r(y + h * 0.13)} ${r(x * 0.3)} ${r(y - h * 0.01)}`,
    `Q${r(0)} ${r(y + h * 0.15)} ${r(-x * 0.34)} ${r(y)}`,
    `Q${r(-x * 0.74)} ${r(y + h * 0.12)} ${r(-x)} ${r(y)}`,
    `Q${r(-hw * 0.32)} ${r(top + h * 0.27)} ${r(-tip)} ${r(top + h * 0.12)}Z`,
  ].join('')
}

/** Halbe Breite einer Etage auf Höhe y (lineare Näherung der Flanke). */
export function tierHalfWidth([top, bottom, hw]: Tier, y: number): number {
  const h = bottom - top
  const t = Math.max(0, Math.min(1, (y - (top + h * 0.12)) / (h * 0.8)))
  return hw * (0.16 + 0.84 * t)
}

/**
 * Schnee auf den sichtbaren „Schultern“ einer Etage: beginnt knapp über der
 * Unterkante der darüberliegenden Etage (`yTop`, wird von ihr verdeckt) und
 * endet mit gewellter Kante. Für die oberste Etage gilt `firSnowCap`.
 */
export function firSnowBand(tier: Tier, yTop: number): string {
  const [top, bottom] = tier
  const h = bottom - top
  const y0 = yTop - h * 0.12
  const y1 = Math.min(bottom - h * 0.2, yTop + h * 0.2)
  const w0 = tierHalfWidth(tier, y0) * 0.97
  const w1 = tierHalfWidth(tier, y1) * 0.97
  return [
    `M${r(-w0)} ${r(y0)}L${r(w0)} ${r(y0)}L${r(w1)} ${r(y1)}`,
    `Q${r(w1 * 0.8)} ${r(y1 + h * 0.1)} ${r(w1 * 0.5)} ${r(y1 - h * 0.01)}`,
    `Q${r(w1 * 0.18)} ${r(y1 + h * 0.12)} ${r(-w1 * 0.16)} ${r(y1)}`,
    `Q${r(-w1 * 0.52)} ${r(y1 + h * 0.11)} ${r(-w1 * 0.72)} ${r(y1 - h * 0.01)}`,
    `Q${r(-w1 * 0.9)} ${r(y1 + h * 0.06)} ${r(-w1)} ${r(y1)}Z`,
  ].join('')
}

/** Raureif-Kante: gewellte Unterkante einer Etage als Strich. */
export function firRime([top, bottom, hw]: Tier): string {
  const h = bottom - top
  const cy = bottom - h * 0.08
  return [
    `M${r(hw)} ${r(cy)}`,
    `Q${r(hw * 1.02)} ${r(bottom + h * 0.1)} ${r(hw * 0.64)} ${r(bottom)}`,
    `Q${r(hw * 0.32)} ${r(bottom + h * 0.17)} 0 ${r(bottom)}`,
    `Q${r(-hw * 0.32)} ${r(bottom + h * 0.17)} ${r(-hw * 0.64)} ${r(bottom)}`,
    `Q${r(-hw * 1.02)} ${r(bottom + h * 0.1)} ${r(-hw)} ${r(cy)}`,
  ].join('')
}

// ── Laubbäume ────────────────────────────────────────────────────────────────

export type Circle = readonly [cx: number, cy: number, r: number]

/** Runde Wolkenkrone (Eiche/Buche), Stamm bis y = −46. Spannweite ±51. */
export const OAK_CROWN: readonly Circle[] = [
  [0, -97, 25],
  [-24, -86, 21],
  [24, -88, 21],
  [-35, -64, 17],
  [35, -66, 17],
  [-14, -61, 23],
  [15, -59, 22],
  [0, -76, 27],
]

/** Schlanke, ovale Krone (Birke), Stamm bis y = −58. */
export const BIRCH_CROWN: readonly Circle[] = [
  [0, -113, 17],
  [-13, -99, 16],
  [13, -101, 16],
  [-18, -80, 16],
  [18, -82, 15],
  [0, -87, 20],
  [-9, -64, 14],
  [10, -63, 14],
]

/** Punkte innerhalb einer Krone (für Blüten, Laub-Flecken), deterministisch. */
export function pointsInCrown(crown: readonly Circle[], n: number, seed: number, inset = 0.78): Pt[] {
  const rnd = seeded(seed)
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const c = crown[Math.floor(rnd() * crown.length)]
    const a = rnd() * Math.PI * 2
    const d = Math.sqrt(rnd()) * c[2] * inset
    out.push([r(c[0] + Math.cos(a) * d), r(c[1] + Math.sin(a) * d)])
  }
  return out
}

export const OAK_BLOSSOMS = pointsInCrown(OAK_CROWN, 22, 11)
export const BIRCH_BLOSSOMS = pointsInCrown(BIRCH_CROWN, 14, 12)
export const OAK_PATCHES = pointsInCrown(OAK_CROWN, 9, 21, 0.7)
export const BIRCH_PATCHES = pointsInCrown(BIRCH_CROWN, 6, 22, 0.7)

/** Kahle Äste (Winter): Pfad + Strichstärke. Stammfuß bei (0,0). */
export const BARE_OAK: readonly { d: string; w: number }[] = [
  { d: 'M0 0C0 -18 -1 -34 -2 -50', w: 9 },
  { d: 'M-2 -48C-10 -60 -22 -66 -32 -84', w: 5.5 },
  { d: 'M-2 -50C6 -64 18 -70 30 -88', w: 5.5 },
  { d: 'M-2 -50C-2 -70 2 -86 0 -108', w: 5 },
  { d: 'M-20 -68C-30 -70 -38 -66 -44 -60', w: 3 },
  { d: 'M17 -70C28 -70 36 -64 42 -58', w: 3 },
  { d: 'M-1 -84C-10 -94 -14 -102 -18 -112', w: 3 },
  { d: 'M0 -90C8 -98 12 -104 16 -114', w: 3 },
  { d: 'M-27 -78C-24 -90 -26 -98 -30 -104', w: 2.5 },
  { d: 'M25 -80C24 -92 28 -100 32 -104', w: 2.5 },
]

export const BARE_BIRCH: readonly { d: string; w: number }[] = [
  { d: 'M0 0C0 -30 -1 -70 0 -122', w: 6.5 },
  { d: 'M0 -62C-8 -72 -14 -78 -22 -92', w: 3 },
  { d: 'M0 -70C8 -80 14 -86 20 -100', w: 3 },
  { d: 'M0 -90C-6 -98 -10 -104 -14 -114', w: 2.5 },
  { d: 'M0 -94C5 -102 9 -108 12 -118', w: 2.5 },
]

/** Schneeauflage auf kahlen Ästen (Ellipsen an den Astoberseiten). */
export const BARE_OAK_SNOW: readonly [number, number, number][] = [
  [-26, -76, 6],
  [24, -80, 6],
  [-1, -96, 5],
  [-38, -64, 4],
  [37, -63, 4],
  [-6, -52, 5],
]

// ── Landschafts-Kanten (Hügel, Wiese) ────────────────────────────────────────

export const HILLS_FAR: readonly Pt[] = [
  [-20, 190], [140, 150], [330, 178], [520, 128], [700, 166], [860, 132],
  [1010, 104], [1160, 138], [1320, 118], [1500, 160], [1680, 124], [1860, 158], [2020, 140],
]

/** Kamm, auf dem die ferne Baumreihe steht. */
export const RIDGE_FAR: readonly Pt[] = [
  [-20, 252], [180, 236], [380, 254], [600, 228], [820, 246], [1000, 226],
  [1200, 244], [1400, 224], [1620, 248], [1820, 232], [2020, 246],
]

export const HILLS_NEAR: readonly Pt[] = [
  [-20, 318], [200, 296], [420, 318], [640, 290], [860, 312], [1000, 296],
  [1150, 316], [1320, 292], [1540, 314], [1760, 294], [2020, 312],
]

/** Grundlinie, auf der die mittlere Baumreihe steht. */
export const MID_BASE: readonly Pt[] = [
  [-20, 424], [240, 414], [520, 428], [760, 412], [1000, 420],
  [1240, 410], [1480, 426], [1740, 414], [2020, 422],
]

/** Oberkante der Vordergrund-Wiese. */
export const MEADOW_EDGE: readonly Pt[] = [
  [-20, 470], [250, 456], [520, 474], [800, 458], [1000, 468],
  [1200, 454], [1450, 472], [1700, 458], [2020, 470],
]

/** Zweite, vordere Wiesenwelle (mehr Tiefe). */
export const MEADOW_FRONT: readonly Pt[] = [
  [-20, 540], [300, 528], [640, 546], [900, 532], [1100, 544],
  [1340, 528], [1640, 546], [2020, 534],
]

// ── Bäume ────────────────────────────────────────────────────────────────────

export type TreeKind = 'fir' | 'oak' | 'birch'

export interface PlacedTree {
  kind: TreeKind
  x: number
  /** Skalierung (1 = 100 Einheiten hoch). */
  s: number
}

/**
 * Mittlere Baumreihe – handplatziert. Kleinere zuerst (liegen weiter hinten).
 * Handy-Mitte (x ≈ 790–1210): Eiche 860, große Tanne 965, Birke 1060, Eiche 1140.
 */
export const MID_TREES: readonly PlacedTree[] = [
  { kind: 'fir', x: 40, s: 1.25 },
  { kind: 'fir', x: 400, s: 1.1 },
  { kind: 'fir', x: 770, s: 1.0 },
  { kind: 'fir', x: 1030, s: 1.15 },
  { kind: 'fir', x: 1430, s: 1.15 },
  { kind: 'fir', x: 1900, s: 1.2 },
  { kind: 'birch', x: 260, s: 1.15 },
  { kind: 'birch', x: 1060, s: 1.15 },
  { kind: 'birch', x: 1600, s: 1.2 },
  { kind: 'oak', x: 130, s: 1.4 },
  { kind: 'fir', x: 180, s: 1.55 },
  { kind: 'oak', x: 590, s: 1.45 },
  { kind: 'fir', x: 480, s: 1.6 },
  { kind: 'fir', x: 700, s: 1.35 },
  { kind: 'oak', x: 860, s: 1.45 },
  { kind: 'fir', x: 1215, s: 1.5 },
  { kind: 'oak', x: 1330, s: 1.5 },
  { kind: 'fir', x: 1510, s: 1.7 },
  { kind: 'oak', x: 1740, s: 1.4 },
  { kind: 'fir', x: 1830, s: 1.55 },
  { kind: 'fir', x: 965, s: 1.75 },
  { kind: 'oak', x: 1140, s: 1.4 },
]

/** Ferne Baumreihe (viele kleine Silhouetten), deterministisch erzeugt. */
export const FAR_TREES: readonly (PlacedTree & { y: number })[] = (() => {
  const rnd = seeded(7)
  const out: (PlacedTree & { y: number })[] = []
  let x = -10
  while (x < VIEW_W + 20) {
    const roll = rnd()
    const kind: TreeKind = roll < 0.68 ? 'fir' : 'oak'
    const s = kind === 'fir' ? 0.42 + rnd() * 0.34 : 0.34 + rnd() * 0.18
    out.push({ kind, x: r(x), y: r(yAt(RIDGE_FAR, x) + 4 + rnd() * 6), s: r(s * 100) / 100 })
    x += 15 + rnd() * 20
  }
  // Größere zuletzt zeichnen (vorne).
  return out.sort((a, b) => a.s - b.s)
})()

/** Hintere Waldreihe zwischen nahen Hügeln und mittlerer Reihe (macht den Wald dicht). */
export const BACK_TREES: readonly (PlacedTree & { y: number })[] = (() => {
  const rnd = seeded(17)
  const out: (PlacedTree & { y: number })[] = []
  let x = -20
  while (x < VIEW_W + 30) {
    const kind: TreeKind = rnd() < 0.62 ? 'fir' : 'oak'
    const s = kind === 'fir' ? 0.72 + rnd() * 0.36 : 0.62 + rnd() * 0.22
    out.push({ kind, x: r(x), y: r(yAt(HILLS_NEAR, x) + 58 + rnd() * 16), s: r(s * 100) / 100 })
    x += 30 + rnd() * 34
  }
  return out.sort((a, b) => a.y - b.y)
})()

/** Seitliche Laub-Klumpen am Rahmen-Laubbaum (Rahmen-Koordinaten 360×900). */
export const FRAME_SIDE_CLUMPS: readonly Circle[] = [
  [86, 640, 34],
  [58, 668, 26],
  [112, 664, 26],
  [286, 712, 30],
  [312, 736, 22],
  [262, 738, 22],
]

// ── Vordergrund-Deko ─────────────────────────────────────────────────────────

export interface Prop {
  x: number
  y: number
  s: number
  /** Spiegeln für Abwechslung. */
  flip?: boolean
}

export const BUSHES: readonly Prop[] = [
  { x: 330, y: 470, s: 1.15 },
  { x: 600, y: 478, s: 0.9, flip: true },
  { x: 818, y: 466, s: 1.05 },
  { x: 1188, y: 462, s: 1.2, flip: true },
  { x: 1440, y: 476, s: 1.0 },
  { x: 1690, y: 466, s: 1.1, flip: true },
]

export const FERNS: readonly Prop[] = [
  { x: 470, y: 484, s: 0.95 },
  { x: 712, y: 486, s: 1.0, flip: true },
  { x: 1068, y: 478, s: 0.95 },
  { x: 1290, y: 482, s: 1.05, flip: true },
  { x: 1570, y: 480, s: 1.0 },
]

export const ROCKS: readonly Prop[] = [
  { x: 650, y: 504, s: 1.15 },
  { x: 1004, y: 492, s: 0.95 },
  { x: 1262, y: 500, s: 0.75, flip: true },
  { x: 1600, y: 506, s: 1.05 },
]

export const MUSHROOMS: readonly Prop[] = [
  { x: 918, y: 528, s: 1.15 },
  { x: 946, y: 532, s: 0.75, flip: true },
  { x: 1232, y: 546, s: 0.95 },
  { x: 420, y: 532, s: 1.0 },
  { x: 1534, y: 530, s: 0.9, flip: true },
]

export const PUDDLES: readonly { x: number; y: number; rx: number; ry: number }[] = [
  { x: 560, y: 568, rx: 62, ry: 11 },
  { x: 880, y: 566, rx: 50, ry: 10 },
  { x: 1120, y: 552, rx: 40, ry: 8 },
  { x: 1480, y: 562, rx: 58, ry: 10 },
]

/** Schneewehen entlang der Wiesenkante. */
export const DRIFTS: readonly { x: number; w: number; h: number }[] = [
  { x: 250, w: 220, h: 18 },
  { x: 560, w: 170, h: 14 },
  { x: 860, w: 150, h: 16 },
  { x: 1130, w: 190, h: 20 },
  { x: 1420, w: 200, h: 15 },
  { x: 1720, w: 210, h: 18 },
]

/** Blumen auf der Wiese (Frühling/Sommer). */
export const FLOWERS: readonly Prop[] = (() => {
  const rnd = seeded(31)
  const out: Prop[] = []
  for (let i = 0; i < 46; i++) {
    const x = 120 + rnd() * 1760
    const top = yAt(MEADOW_EDGE, x) + 18
    out.push({ x: r(x), y: r(top + rnd() * (VIEW_H - 16 - top)), s: r((0.7 + rnd() * 0.5) * 100) / 100, flip: rnd() < 0.3 })
  }
  // Ein paar extra in der Handy-Mitte.
  for (const [x, y] of [
    [840, 520],
    [1015, 552],
    [1090, 518],
    [1170, 586],
    [900, 590],
    [960, 498],
  ] as const)
    out.push({ x, y, s: 1, flip: x % 2 === 0 })
  return out.sort((a, b) => a.y - b.y)
})()

/** Herabgefallenes Laub auf dem Boden (Herbst). */
export const GROUND_LEAVES: readonly (Prop & { rot: number; tone: 0 | 1 | 2 })[] = (() => {
  const rnd = seeded(41)
  const out: (Prop & { rot: number; tone: 0 | 1 | 2 })[] = []
  for (let i = 0; i < 60; i++) {
    const x = 80 + rnd() * 1840
    const top = yAt(MEADOW_EDGE, x) + 10
    out.push({
      x: r(x),
      y: r(top + rnd() * (VIEW_H - top)),
      s: r((0.7 + rnd() * 0.6) * 100) / 100,
      rot: Math.round(rnd() * 360),
      tone: Math.floor(rnd() * 3) as 0 | 1 | 2,
    })
  }
  return out
})()

/** Gras-Büschel entlang der Wiesenkante. */
export const TUFTS_EDGE: readonly Prop[] = (() => {
  const rnd = seeded(51)
  const out: Prop[] = []
  let x = 0
  while (x < VIEW_W) {
    out.push({ x: r(x), y: r(yAt(MEADOW_EDGE, x) + 5), s: r((0.7 + rnd() * 0.6) * 100) / 100, flip: rnd() < 0.5 })
    x += 26 + rnd() * 34
  }
  return out
})()

/** Hohe Gras-Büschel ganz vorne am unteren Rand. */
export const TUFTS_FRONT: readonly Prop[] = (() => {
  const rnd = seeded(61)
  const out: Prop[] = []
  let x = -10
  while (x < VIEW_W + 10) {
    out.push({ x: r(x), y: VIEW_H + 4, s: r((1.1 + rnd() * 0.9) * 100) / 100, flip: rnd() < 0.5 })
    x += 30 + rnd() * 45
  }
  return out
})()

/** Gras-Büschel: n weiche Halme, Fuß bei (0,0), Höhe ≈ 24. */
export function tuftPath(seed: number, blades = 5): string {
  const rnd = seeded(seed)
  let d = ''
  for (let i = 0; i < blades; i++) {
    const t = blades === 1 ? 0 : i / (blades - 1) - 0.5
    const h = 16 + rnd() * 10 - Math.abs(t) * 8
    const lean = t * 16 + (rnd() - 0.5) * 6
    const w = 2.6 + rnd() * 1.4
    const bx = t * 10
    d += `M${r(bx - w)} 0Q${r(bx - w * 0.4 + lean * 0.45)} ${r(-h * 0.55)} ${r(bx + lean)} ${r(-h)}Q${r(bx + w * 0.5 + lean * 0.4)} ${r(-h * 0.5)} ${r(bx + w)} 0Z`
  }
  return d
}

// ── Himmel ──────────────────────────────────────────────────────────────────

/** Sterne im Himmels-Koordinatensystem 1000×600 (drei Funkel-Gruppen). */
export const STARS: readonly { x: number; y: number; r: number; g: 0 | 1 | 2; big: boolean }[] = (() => {
  const rnd = seeded(91)
  const out: { x: number; y: number; r: number; g: 0 | 1 | 2; big: boolean }[] = []
  for (let i = 0; i < 120; i++) {
    const y = Math.pow(rnd(), 1.35) * 560
    out.push({
      x: r(rnd() * 1000),
      y: r(y),
      r: r(0.9 + rnd() * 1.5),
      g: (i % 3) as 0 | 1 | 2,
      big: rnd() < 0.09,
    })
  }
  return out
})()
