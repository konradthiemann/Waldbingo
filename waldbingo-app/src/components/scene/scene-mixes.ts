// Vorberechnete Mischfarben der Waldszene.
//
// Früher standen die Abstufungen (Konturen, Schattentöne, Luftperspektive) als
// `color-mix(in srgb, …)` direkt in den Inline-Styles. Ältere Browser
// (Safari < 16.2, Chrome < 111 – z. B. ältere Kinder-iPhones mit iOS 15) kennen
// color-mix() nicht: Die Füllung fiel dann auf Schwarz bzw. den geerbten Wert
// zurück. Ein einfacher Rückfall davor hilft nicht, weil Werte mit var() erst
// zur Laufzeit ungültig werden („invalid at computed-value time“ → unset).
//
// Deshalb rechnen wir die Mischungen hier in JS aus der bekannten Palette vor
// und setzen sie als eigene CSS-Variablen `--scm-*` auf die Szene. scene.css
// registriert sie per @property, damit sie beim Szenenwechsel genauso weich
// überblenden wie die Grundfarben.
import { mix, type ScenePalette } from '../../lib/scene'

/** Dunkler Eigenton für Konturen und Schatten (nie Schwarz). */
export const SCENE_INK = '#0d1530'

/** Wie CSS `color-mix(in srgb, a k%, b)`. */
function cm(a: string, k: number, b: string): string {
  return mix(b, a, k / 100)
}

/** Hex-Farbe mit Deckkraft als rgba(). */
function alpha(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Alle Mischfarben der Szene aus der Palette (rein, deterministisch). */
export function sceneMixes(p: ScenePalette) {
  const bush = cm(p.treeNear, 72, p.foliage)
  const rock = cm(p.hillFar, 50, p.groundShade)
  const mushCap = cm(p.trunk, 72, '#d0843a')
  const mushStem = cm(p.snow, 74, p.trunk)
  const crown = cm(p.foliage, 90, p.treeNear)
  return {
    // Bausteine (SceneDefs)
    trunkDark: cm(p.trunk, 78, SCENE_INK),
    birchBark: cm(p.snow, 78, p.trunk),
    // Himmel (SceneSky)
    cloudShade: cm(p.cloud, 80, p.skyTop),
    bankLow: cm(p.cloud, 62, p.skyTop),
    bankHigh: cm(p.cloud, 82, p.skyTop),
    glowSun: alpha(p.glow, 0.85),
    glowDiffuse: alpha(p.glow, 0.7),
    glowMoon: alpha(p.glow, 0.55),
    glowSoft: alpha(p.glow, 0.26),
    // Ferne und mittlere Ebenen (SceneLand)
    farOak: cm(p.foliage, 50, p.treeFar),
    farOakBare: cm(p.trunk, 45, p.treeFar),
    backFir: cm(p.treeMid, 55, p.treeFar),
    backOak: cm(p.foliage, 62, p.treeFar),
    backOakBare: cm(p.trunk, 55, p.treeFar),
    midLeaf: cm(p.foliage, 86, p.skyBottom),
    midBase: cm(p.groundShade, 55, p.hillNear),
    // Vordergrund
    meadowFront: cm(p.ground, 84, p.groundShade),
    bush,
    bushHi: cm(bush, 72, '#ffffff'),
    bushLine: cm(p.treeNear, 62, SCENE_INK),
    fern: cm(p.foliage, 55, p.treeNear),
    rock,
    rockLine: cm(rock, 60, SCENE_INK),
    rockMoss: cm(p.ground, 55, p.treeNear),
    puddle: cm(p.skyBottom, 62, p.skyTop),
    daisy: cm(p.snow, 88, p.flower),
    mushCap,
    mushCapLine: cm(mushCap, 55, SCENE_INK),
    mushStem,
    mushStemLine: cm(mushStem, 55, SCENE_INK),
    // Gräser
    grassEdge: cm(p.ground, 60, p.treeNear),
    grassEdgeFrost: cm(cm(p.ground, 62, p.treeNear), 58, p.snow),
    grassEdgeDry: cm('#c9ae78', 62, p.groundShade),
    grassFront: cm(p.groundShade, 52, p.treeNear),
    grassFrontFrost: cm(cm(p.groundShade, 55, p.treeNear), 62, p.snow),
    grassFrontDry: cm('#b79a66', 55, p.groundShade),
    // Rahmen-Bäume
    crown,
    crownLine: cm(crown, 56, SCENE_INK),
    trunkLine: cm(p.trunk, 55, SCENE_INK),
    firLine: cm(p.treeNear, 55, SCENE_INK),
  }
}

export type SceneMix = keyof ReturnType<typeof sceneMixes>

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

/** CSS-Variablenname einer Mischfarbe, z. B. `--scm-bush-line`. */
export function mixVarName(name: SceneMix): string {
  return `--scm-${kebab(name)}`
}

/** `var(--scm-…)` zum Einsetzen in fill/stroke/color. */
export function mv(name: SceneMix): string {
  return `var(${mixVarName(name)})`
}

/** Alle Mischfarben als CSS-Custom-Properties (für das Szenen-Wurzelelement). */
export function sceneMixVars(p: ScenePalette): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(sceneMixes(p))) out[mixVarName(k as SceneMix)] = v
  return out
}
