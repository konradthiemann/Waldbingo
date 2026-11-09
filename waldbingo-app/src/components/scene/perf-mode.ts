// Sparmodus der Waldszene: misst, wie flüssig das Gerät tatsächlich zeichnet,
// und schaltet bei Bedarf – einmal pro Sitzung, nur nach oben – in eine
// leichtere Stufe. Auf flotten Geräten bleibt alles beim Vollbild.
//
// Messung (Gedrosselt mit Chrome-CDP, Handy 390×844): Im Ruhezustand hält die
// Szene 60 fps bis zur 10-fachen Drosselung. Teuer ist der Szenenwechsel: Die
// 1,2-s-Farbüberblendung über ~57 registrierte CSS-Variablen berechnet in jedem
// Bild die Styles aller ~1.400 SVG-Elemente neu (4×: ≈ 30 fps, 6×: ≈ 25 fps
// mit langen Tasks).
//
// Stufen:
//  'full'  – Normalfall: weiche Überblendung, alle Idle-Loops, volles Partikel-Budget.
//  'steps' – ein Szenenwechsel lief unter STEPS_BELOW_FPS: Überblendung künftig in
//            wenigen Stufen (scene.css) statt in jedem Bild – gleiche Dauer, ~5 statt
//            ~70 Neuberechnungen.
//  'lite'  – auch der Ruhezustand (Partikel-Loop, LITE_WINDOWS Fenster à 3 s) lag unter
//            LITE_BELOW_FPS (sehr schwaches Gerät, Stromsparmodus mit 30-Hz-Deckel):
//            zusätzlich halbes Partikel-Budget, Bäume/Gräser wiegen nicht mehr,
//            Wingos Atmen pausiert.
// QA/Messung: `?fx=full|steps|lite` fixiert die Stufe (keine Automatik).
import { useSyncExternalStore } from 'react'

export type FxLevel = 'full' | 'steps' | 'lite'

const RANK: Record<FxLevel, number> = { full: 0, steps: 1, lite: 2 }

/** Szenenwechsel langsamer als das → Überblendung in Stufen. */
export const STEPS_BELOW_FPS = 45
/** Ruhezustand langsamer als das (mehrere Fenster in Folge) → Sparmodus. */
export const LITE_BELOW_FPS = 40
/** So viele 3-s-Fenster in Folge müssen langsam sein. */
export const LITE_WINDOWS = 2
/** Partikel-Budget im Sparmodus. */
export const LITE_PARTICLES = 0.5
/** Nach dem Seitenstart erst so lange warten, bevor Messungen zählen (Start-Ruckler ignorieren). */
const WARMUP_MS = 4000

let level: FxLevel = 'full'
let pinned: FxLevel | null | undefined
const listeners = new Set<() => void>()
/** Bis wann eine Szenen-Überblendung läuft (Ruhe-Messung pausiert so lange). */
let busyUntil = 0

function readPin(): FxLevel | null {
  if (pinned !== undefined) return pinned
  pinned = null
  try {
    const v = new URLSearchParams(window.location.search).get('fx')
    if (v === 'full' || v === 'steps' || v === 'lite') pinned = v
  } catch {
    // kein window (Tests/SSR): Automatik
  }
  return pinned
}

/** Aktuelle Stufe. */
export function getFxLevel(): FxLevel {
  return readPin() ?? level
}

/** Stufe anheben (nie absenken). Ohne Wirkung, wenn per URL fixiert. */
export function raiseFxLevel(to: FxLevel): void {
  if (readPin() || RANK[to] <= RANK[level]) return
  level = to
  for (const l of listeners) l()
}

/** Nur für Tests: Automatik zurücksetzen. */
export function resetFxLevel(): void {
  level = 'full'
  pinned = undefined
  busyUntil = 0
  steady.reset()
  slowWindows = 0
  for (const l of listeners) l()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** React-Hook: aktuelle Stufe (rendert bei Wechsel neu). */
export function useFxLevel(): FxLevel {
  return useSyncExternalStore(subscribe, getFxLevel, () => 'full')
}

/**
 * Mittlere Bildrate über feste Zeitfenster. Ausreißer (Tab-Wechsel, Pausen)
 * zählen nicht. Rein, damit testbar.
 */
export class FrameMeter {
  private sum = 0
  private n = 0
  constructor(private readonly windowMs = 3000) {}

  /** Bildabstand in ms hinzufügen; am Ende eines Fensters dessen mittlere fps, sonst null. */
  push(dtMs: number): number | null {
    if (!(dtMs > 0) || dtMs > 400) return null
    this.sum += dtMs
    this.n++
    if (this.sum < this.windowMs) return null
    const fps = this.n / (this.sum / 1000)
    this.reset()
    return fps
  }

  reset(): void {
    this.sum = 0
    this.n = 0
  }
}

const steady = new FrameMeter(3000)
let slowWindows = 0

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Bildabstand aus dem laufenden Partikel-Loop (Ruhezustand). Während einer
 * Überblendung und kurz nach dem Start wird nicht gezählt.
 */
export function noteSteadyFrame(dtMs: number): void {
  if (getFxLevel() === 'lite') return
  const t = now()
  if (t < WARMUP_MS || t < busyUntil) {
    steady.reset()
    return
  }
  const fps = steady.push(dtMs)
  if (fps === null) return
  slowWindows = fps < LITE_BELOW_FPS ? slowWindows + 1 : 0
  if (slowWindows >= LITE_WINDOWS) raiseFxLevel('lite')
}

/**
 * Eine Szenen-Überblendung beginnt (ForestScene, Dauer ≈ 1,2 s). Solange die
 * Stufe noch 'full' ist, misst ein kurzer rAF-Zähler genau diese Überblendung
 * (kein Dauer-Loop). Gibt eine Abbruch-Funktion zurück.
 */
export function watchSceneChange(durationMs = 1300): () => void {
  busyUntil = now() + durationMs + 300
  if (getFxLevel() !== 'full' || typeof requestAnimationFrame !== 'function' || now() < WARMUP_MS) return () => {}
  let raf = 0
  let start = 0
  let last = 0
  let frames = 0
  let skipped = false
  const frame = (t: number) => {
    if (!start) {
      start = last = t
    } else {
      // Tab versteckt/angehalten: Messung verwerfen.
      if (t - last > 400) skipped = true
      frames++
      last = t
    }
    if (t - start < durationMs) {
      raf = requestAnimationFrame(frame)
      return
    }
    const fps = frames / ((t - start) / 1000)
    if (!skipped && frames > 3 && fps < STEPS_BELOW_FPS) raiseFxLevel('steps')
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
