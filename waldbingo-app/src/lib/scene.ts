// Szenen-Engine: leitet aus Jahreszeit × Wetter × Tageszeit die komplette
// Bildwelt des Hintergrunds ab (Farben, Himmelskörper, Niederschlag, Nebel,
// Wind, Laub, Glühwürmchen …). Reine Funktionen – keine DOM-/React-Abhängigkeit,
// damit sie in Tests und in jeder Komponente gleich nutzbar sind.
//
// 4 Jahreszeiten × 8 Wetterlagen (+ unbekannt) × 5 Tageszeiten = 180 Kombinationen.
// Deshalb wird nichts pro Kombination „handgemalt“, sondern in Schichten
// berechnet: Tageszeit → Himmelslicht, Jahreszeit → Laubfarben,
// Wetter → Abdunklung/Entsättigung + Effekte.
import type { Jahreszeit, Tageszeit, Wetter } from '../data/types'

export interface SceneInput {
  season: Jahreszeit
  weather: Wetter | null
  time: Tageszeit
}

/** Laubzustand der Laubbäume (Nadelbäume bleiben immer grün). */
export type Foliage = 'bluete' | 'satt' | 'herbstlaub' | 'kahl'
export type Precipitation = 'none' | 'rain' | 'snow'
export type Celestial = 'sun' | 'moon' | 'none'

export interface ScenePalette {
  /** Himmelsverlauf oben → unten. */
  skyTop: string
  skyBottom: string
  /** Lichtfarbe von Sonne/Mond bzw. Horizont-Glühen. */
  glow: string
  /** Wolken. */
  cloud: string
  /** Hügel/Bergkette in der Ferne. */
  hillFar: string
  hillNear: string
  /** Baumreihen von hinten nach vorn (Nadelbäume). */
  treeFar: string
  treeMid: string
  treeNear: string
  /** Laubbaum-Kronen (jahreszeitabhängig) – Grund- und Akzentfarbe. */
  foliage: string
  foliageAccent: string
  /** Stämme. */
  trunk: string
  /** Boden/Wiese vorne. */
  ground: string
  groundShade: string
  /** Blüten/Beeren/Blumen-Akzent im Vordergrund. */
  flower: string
  /** Schnee-/Raureif-Auflage (nur relevant bei snowCover/frost). */
  snow: string
  /** Farbiger Schleier über allem (Nebel, Regenstimmung). rgba-String. */
  haze: string
  /** Textfarbe für Text, der DIREKT auf der Szene steht (nicht auf Panels). */
  onScene: string
  /** Browser-UI-Farbe (meta theme-color). */
  themeColor: string
}

export interface SceneState extends SceneInput {
  /** Helligkeit des Tages 0 (Nacht) … 1 (Mittag). */
  daylight: number
  isNight: boolean
  celestial: Celestial
  stars: boolean
  /** Bewölkung 0 … 1. */
  clouds: number
  precipitation: Precipitation
  /** Niederschlagsstärke 0 … 1. */
  precipIntensity: number
  /** Nebeldichte 0 … 1. */
  fog: number
  /** Windstärke 0 … 1 (Bäume wiegen, Blätter fliegen). */
  wind: number
  /** Raureif/Eiskristalle. */
  frost: boolean
  /** Nasse Oberflächen, Pfützen, Tropfen. */
  wet: boolean
  /** Schneedecke auf Boden und Bäumen. */
  snowCover: boolean
  foliage: Foliage
  /** Fallende Blätter (Herbst oder Wind). */
  fallingLeaves: boolean
  /** Schwebende Blütenblätter (Frühling). */
  petals: boolean
  /** Glühwürmchen (Sommerabend/-nacht ohne Regen). */
  fireflies: boolean
  /** Schwebende Lichtpünktchen/Pollen (Frühling/Sommer am Tag). */
  motes: boolean
  /** Regenbogen (nach Regen bei Tageslicht). */
  rainbow: boolean
  palette: ScenePalette
}

// ── Farb-Hilfen ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Lineare Mischung zweier Hex-Farben (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

/** Entsättigen Richtung Grau gleicher Helligkeit. */
export function desaturate(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex)
  const l = 0.299 * r + 0.587 * g + 0.114 * b
  return rgbToHex(r + (l - r) * t, g + (l - g) * t, b + (l - b) * t)
}

/** Relative Helligkeit 0 … 1 (für Kontrast-Entscheidungen). */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// ── Basistabellen ────────────────────────────────────────────────────────────

/** Himmelslicht je Tageszeit (bei klarem Wetter). */
const SKY: Record<Tageszeit, { top: string; bottom: string; glow: string; daylight: number }> = {
  morgen: { top: '#8fc9ef', bottom: '#ffd9b8', glow: '#ffc78a', daylight: 0.75 },
  tag: { top: '#5fb4ea', bottom: '#cdeefc', glow: '#fff3c4', daylight: 1 },
  abend: { top: '#6f8fd0', bottom: '#ffb36b', glow: '#ff9a4d', daylight: 0.6 },
  daemmerung: { top: '#2c2f6b', bottom: '#b26a8e', glow: '#e88aa0', daylight: 0.3 },
  nacht: { top: '#0b1030', bottom: '#27306a', glow: '#cfd8ff', daylight: 0.05 },
}

/** Laubfarben je Jahreszeit. */
const SEASON: Record<
  Jahreszeit,
  { foliage: string; accent: string; conifer: string; ground: string; flower: string; state: Foliage }
> = {
  fruehling: { foliage: '#8fd16a', accent: '#ffb7cf', conifer: '#3f8f5a', ground: '#9fd67a', flower: '#ffe066', state: 'bluete' },
  sommer: { foliage: '#3f9d50', accent: '#6cc46a', conifer: '#2f7a4a', ground: '#6dbb5a', flower: '#ff8fa3', state: 'satt' },
  herbst: { foliage: '#e8892f', accent: '#c9482f', conifer: '#2f6b45', ground: '#b9a050', flower: '#f2c14e', state: 'herbstlaub' },
  winter: { foliage: '#8a7a6a', accent: '#a89a8a', conifer: '#2c5a46', ground: '#a7b8a8', flower: '#d94b4b', state: 'kahl' },
}

/** Wetter-Modifikatoren: Bewölkung, Abdunklung, Entsättigung, Effekte. */
const WEATHER: Record<
  Wetter | 'unbekannt',
  { clouds: number; dim: number; desat: number; fog: number; wind: number; precip: Precipitation; intensity: number }
> = {
  klar: { clouds: 0.1, dim: 0, desat: 0, fog: 0, wind: 0.15, precip: 'none', intensity: 0 },
  bewoelkt: { clouds: 0.7, dim: 0.12, desat: 0.3, fog: 0, wind: 0.25, precip: 'none', intensity: 0 },
  regen: { clouds: 0.95, dim: 0.28, desat: 0.45, fog: 0.15, wind: 0.35, precip: 'rain', intensity: 0.7 },
  nach_regen: { clouds: 0.45, dim: 0.06, desat: 0.12, fog: 0.1, wind: 0.15, precip: 'none', intensity: 0 },
  schnee: { clouds: 0.85, dim: 0.1, desat: 0.5, fog: 0.15, wind: 0.2, precip: 'snow', intensity: 0.6 },
  frost: { clouds: 0.15, dim: 0, desat: 0.25, fog: 0.05, wind: 0.1, precip: 'none', intensity: 0 },
  wind: { clouds: 0.5, dim: 0.05, desat: 0.1, fog: 0, wind: 0.9, precip: 'none', intensity: 0 },
  nebel: { clouds: 0.6, dim: 0.08, desat: 0.55, fog: 0.85, wind: 0.05, precip: 'none', intensity: 0 },
  unbekannt: { clouds: 0.3, dim: 0, desat: 0.05, fog: 0, wind: 0.2, precip: 'none', intensity: 0 },
}

const NIGHT_INK = '#0e1430'
const SNOW = '#f4f8ff'
const FOG = '#dfe6e8'

// ── Ableitung ────────────────────────────────────────────────────────────────

/** Berechnet den kompletten Szenenzustand. Deterministisch, ohne Seiteneffekte. */
export function deriveScene(input: SceneInput): SceneState {
  const { season, time } = input
  const w = WEATHER[input.weather ?? 'unbekannt']
  const sky = SKY[time]
  const s = SEASON[season]
  const daylight = Math.max(0.03, sky.daylight - w.dim * 0.5)
  const isNight = time === 'nacht' || time === 'daemmerung'

  const snowCover = input.weather === 'schnee' || (season === 'winter' && input.weather === 'frost')
  const frost = input.weather === 'frost'
  const wet = input.weather === 'regen' || input.weather === 'nach_regen'

  // Himmel: Wetter graut ein und dunkelt ab; Nebel macht milchig.
  const grey = isNight ? '#3b4258' : '#a9b4bd'
  let skyTop = mix(desaturate(sky.top, w.desat), grey, w.clouds * 0.45)
  let skyBottom = mix(desaturate(sky.bottom, w.desat), grey, w.clouds * 0.35)
  if (w.fog > 0.3) {
    const f = isNight ? '#4a5268' : FOG
    skyTop = mix(skyTop, f, w.fog * 0.6)
    skyBottom = mix(skyBottom, f, w.fog * 0.75)
  }
  if (frost && !isNight) skyTop = mix(skyTop, '#9fd3f5', 0.25)

  // Abend unter Wolken/Regen: sonst kaum von „Tag · Regen“ zu unterscheiden.
  // Alles ≈ 12 % dunkler, unten am Himmel bleibt ein warmer Abendrot-Schimmer
  // (dazu der schmale Glüh-Streifen in SceneSky).
  const dusk = time === 'abend' && w.clouds >= 0.6 ? 0.12 : 0
  if (dusk) {
    skyTop = mix(skyTop, NIGHT_INK, dusk * 1.9)
    skyBottom = mix(mix(skyBottom, sky.glow, 0.16), NIGHT_INK, dusk)
  }

  // Landschaft: je dunkler der Tag, desto stärker Richtung Nacht-Tinte.
  const darken = (hex: string, extra = 0) =>
    mix(
      desaturate(hex, w.desat * 0.6),
      NIGHT_INK,
      Math.max(0, Math.min(0.85, (1 - daylight) * 0.75 + w.dim * 0.5 + dusk + extra)),
    )
  // Luftperspektive: Ferne Ebenen nehmen Himmelsfarbe an.
  const aerial = (hex: string, t: number) => mix(darken(hex), skyBottom, t + w.fog * 0.35)

  // Jahreszeit-Farben (Laub, Blüten) bleiben auch bei Schmuddelwetter
  // erkennbar: weniger entsättigt und etwas weniger abgedunkelt.
  const vivid = (hex: string) =>
    mix(
      desaturate(hex, w.desat * 0.2),
      NIGHT_INK,
      Math.max(0, Math.min(0.78, (1 - daylight) * 0.56 + w.dim * 0.22 + dusk * 0.8)),
    )
  let foliage = vivid(s.foliage)
  let foliageAccent = vivid(s.accent)
  let ground = darken(s.ground)
  if (snowCover) {
    // Schnee leuchtet auch nachts (Mondlicht) – bläulich statt grau.
    ground = isNight ? mix(darken(SNOW, -0.3), '#8fa6e0', 0.18) : darken(SNOW, -0.15)
    foliage = mix(foliage, SNOW, 0.35)
  } else if (frost) {
    ground = mix(ground, '#dceefa', 0.45)
  }

  const conifer = s.conifer
  const palette: ScenePalette = {
    skyTop,
    skyBottom,
    glow: sky.glow,
    cloud: isNight
      ? mix('#5a6390', skyTop, 0.3)
      : mix(mix('#ffffff', grey, w.dim * 1.6), '#4a4560', dusk * 1.4),
    hillFar: aerial(mix(conifer, '#7fa6b8', 0.45), 0.55),
    hillNear: aerial(mix(conifer, '#6c9a86', 0.3), 0.35),
    treeFar: aerial(conifer, 0.4),
    treeMid: aerial(conifer, 0.18),
    treeNear: darken(mix(conifer, '#1e4a32', 0.35)),
    foliage,
    foliageAccent,
    trunk: darken('#7a4f2e'),
    ground,
    groundShade: mix(ground, NIGHT_INK, 0.25),
    flower: vivid(s.flower),
    snow: darken(SNOW, -0.2),
    haze: hazeFor(w.fog, isNight, input.weather),
    onScene: '#ffffff',
    themeColor: '#1f5b38',
  }
  if (snowCover || (frost && season === 'winter')) {
    // Verschneite/bereifte Hügel in der Ferne: deutlich heller.
    const cover = snowCover ? 1 : 0.6
    const snowTone = isNight ? mix(darken(SNOW, -0.3), '#8fa6e0', 0.2) : darken(SNOW, -0.2)
    palette.hillFar = mix(palette.hillFar, snowTone, 0.55 * cover)
    palette.hillNear = mix(palette.hillNear, snowTone, 0.45 * cover)
    palette.snow = isNight ? mix(darken(SNOW, -0.35), '#a9bcef', 0.15) : palette.snow
  }
  // Text direkt auf der Szene: hell auf dunklem Himmel, sonst Wald-Tinte.
  palette.onScene = luminance(mix(skyTop, skyBottom, 0.5)) > 0.45 ? '#14331f' : '#ffffff'
  palette.themeColor = mix(skyTop, '#14331f', 0.35)

  const clearish = w.clouds < 0.8 && w.fog < 0.5
  const celestial: Celestial = !clearish ? 'none' : isNight ? 'moon' : 'sun'

  return {
    ...input,
    daylight,
    isNight,
    celestial,
    stars: isNight && w.clouds < 0.75 && w.fog < 0.5,
    clouds: w.clouds,
    precipitation: w.precip,
    precipIntensity: w.intensity,
    fog: w.fog,
    wind: w.wind,
    frost,
    wet,
    snowCover,
    foliage: s.state,
    fallingLeaves: season === 'herbst' || (w.wind > 0.6 && season !== 'winter'),
    petals: season === 'fruehling' && w.precip === 'none' && !isNight,
    fireflies:
      season === 'sommer' && (time === 'abend' || isNight) && w.precip === 'none' && w.fog < 0.5,
    motes: (season === 'fruehling' || season === 'sommer') && !isNight && w.precip === 'none' && w.fog < 0.5,
    rainbow: input.weather === 'nach_regen' && !isNight,
    palette,
  }
}

function hazeFor(fog: number, night: boolean, weather: Wetter | null): string {
  if (weather === 'regen') return night ? 'rgba(20,28,48,0.28)' : 'rgba(90,110,130,0.18)'
  if (fog <= 0) return 'rgba(0,0,0,0)'
  // Nebel trägt v. a. die Nebelbänder der Szene; der Schleier bleibt dezent.
  const a = Math.min(0.45, fog * 0.42).toFixed(2)
  return night ? `rgba(70,80,105,${a})` : `rgba(232,238,240,${a})`
}

/**
 * CSS-Custom-Properties für die Szene (auf ein Wurzelelement setzen).
 * Namensschema: --sc-<feld> (kebab-case), z. B. --sc-sky-top.
 */
export function sceneCssVars(scene: SceneState): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(scene.palette)) {
    out[`--sc-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`] = v
  }
  out['--sc-daylight'] = scene.daylight.toFixed(2)
  out['--sc-wind'] = scene.wind.toFixed(2)
  return out
}

/** Stabiler Schlüssel (z. B. für Übergänge/Caching). */
export function sceneKey(i: SceneInput): string {
  return `${i.season}-${i.weather ?? 'unbekannt'}-${i.time}`
}

// ── Vorschau-Override per URL (?scene=herbst,regen,abend) ───────────────────

const SEASONS: Jahreszeit[] = ['fruehling', 'sommer', 'herbst', 'winter']
const WEATHERS: Wetter[] = ['klar', 'bewoelkt', 'regen', 'nach_regen', 'schnee', 'frost', 'wind', 'nebel']
const TIMES: Tageszeit[] = ['morgen', 'tag', 'abend', 'daemmerung', 'nacht']

/**
 * Liest eine Szenen-Vorschau aus der URL, z. B. `?scene=winter,schnee,nacht`.
 * Reihenfolge egal, fehlende Teile werden mit `fallback` aufgefüllt.
 * Gibt null zurück, wenn kein (gültiger) Parameter vorhanden ist.
 */
export function parseSceneOverride(search: string, fallback: SceneInput): SceneInput | null {
  const raw = new URLSearchParams(search).get('scene')
  if (!raw) return null
  const parts = raw.toLowerCase().split(/[,\s]+/).filter(Boolean)
  let hit = false
  const out: SceneInput = { ...fallback }
  for (const p of parts) {
    if ((SEASONS as string[]).includes(p)) {
      out.season = p as Jahreszeit
      hit = true
    } else if ((WEATHERS as string[]).includes(p)) {
      out.weather = p as Wetter
      hit = true
    } else if ((TIMES as string[]).includes(p)) {
      out.time = p as Tageszeit
      hit = true
    }
  }
  return hit ? out : null
}

export const SCENE_SEASONS = SEASONS
export const SCENE_WEATHERS = WEATHERS
export const SCENE_TIMES = TIMES
