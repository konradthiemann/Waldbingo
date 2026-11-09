// Klang & Haptik der Spielwelt – komplett synthetisiert mit WebAudio
// (keine Audiodateien, voll offline). Klangbild „Cozy Woodland“: weiche
// Holz-Klötzchen, Marimba und kleine Glöckchen, leise und nie schrill.
//
// Vertrag (stabil): playSfx / haptic / setSoundEnabled / isSoundEnabled /
// SfxName / HapticName. Alle Aufrufe sind gefahrlos: ohne WebAudio, vor der
// ersten Nutzerinteraktion oder bei Fehlern passiert einfach nichts.

export type SfxName =
  | 'tap' // Knopfdruck
  | 'open' // Modal auf
  | 'close' // Modal zu
  | 'found' // Feld gefunden
  | 'unfound' // Feld abgewählt
  | 'almost' // 4 von 5
  | 'bingo' // Bingo!
  | 'full' // alle 25
  | 'whoosh' // Bildschirmwechsel

export type HapticName = 'light' | 'success' | 'celebrate'

let enabled = true

export function setSoundEnabled(on: boolean): void {
  enabled = on
  // Ausgeschaltet: Audio-Hardware schlafen legen (Akku schonen).
  if (!on && ctx && ctx.state === 'running') void ctx.suspend().catch(() => undefined)
}

export function isSoundEnabled(): boolean {
  return enabled
}

// ── AudioContext (lazy, erst nach Nutzerinteraktion) ──────────────────────────

type AudioCtor = typeof AudioContext

let ctx: AudioContext | null = null
let out: GainNode | null = null
let noise: AudioBuffer | null = null
const lastPlayed: Partial<Record<SfxName, number>> = {}

/** Gesamtlautstärke – bewusst leise (Familien im Wald, nicht Spielhalle). */
const MASTER_GAIN = 0.2

function hasUserActivation(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  // Ältere Browser kennen userActivation nicht – dann vertrauen wir darauf,
  // dass Klänge ohnehin nur aus Klick-Handlern kommen.
  return ua ? ua.hasBeenActive : true
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const w = window as Window & { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
    const Ctor: AudioCtor | undefined = w.AudioContext ?? w.webkitAudioContext
    if (!Ctor || !hasUserActivation()) return null
    try {
      ctx = new Ctor()
      // Sanfter Limiter, damit sich überlagernde Klänge nie hart clippen.
      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -14
      limiter.knee.value = 12
      limiter.ratio.value = 6
      limiter.attack.value = 0.003
      limiter.release.value = 0.2
      out = ctx.createGain()
      out.gain.value = MASTER_GAIN
      out.connect(limiter)
      limiter.connect(ctx.destination)
    } catch {
      ctx = null
      out = null
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  return ctx
}

function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === ac.sampleRate) return noise
  const len = Math.floor(ac.sampleRate * 0.6)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  // Deterministisches „Rauschen“ (kein Math.random nötig, klingt identisch).
  let s = 22222
  for (let i = 0; i < len; i++) {
    s = (s * 16807) % 2147483647
    data[i] = (s / 2147483647) * 2 - 1
  }
  noise = buf
  return buf
}

// ── Klang-Bausteine ───────────────────────────────────────────────────────────

interface Voice {
  freq: number
  /** Startzeit relativ zu jetzt (s). */
  at?: number
  gain?: number
  /** Ausklingzeit (s). */
  dur?: number
}

/** Hüllkurve: weicher Anschlag, exponentielles Ausklingen. */
function envelope(ac: AudioContext, t: number, peak: number, attack: number, dur: number): GainNode {
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur)
  return g
}

function partial(
  ac: AudioContext,
  dest: AudioNode,
  type: OscillatorType,
  freq: number,
  t: number,
  peak: number,
  dur: number,
  attack = 0.004,
): void {
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  const g = envelope(ac, t, peak, attack, dur)
  o.connect(g)
  g.connect(dest)
  o.start(t)
  o.stop(t + attack + dur + 0.05)
}

/** Glöckchen / Glockenspiel: Sinus + unharmonische Obertöne, langer Nachklang. */
function bell(ac: AudioContext, dest: AudioNode, { freq, at = 0, gain = 0.3, dur = 0.9 }: Voice): void {
  const t = ac.currentTime + at
  partial(ac, dest, 'sine', freq, t, gain, dur, 0.003)
  partial(ac, dest, 'sine', freq * 2.76, t, gain * 0.28, dur * 0.45, 0.002)
  partial(ac, dest, 'sine', freq * 5.4, t, gain * 0.08, dur * 0.22, 0.001)
}

/** Marimba: warmer Holzstab-Ton (Grundton + 4-facher Oberton, kurz). */
function marimba(ac: AudioContext, dest: AudioNode, { freq, at = 0, gain = 0.3, dur = 0.45 }: Voice): void {
  const t = ac.currentTime + at
  partial(ac, dest, 'sine', freq, t, gain, dur, 0.004)
  partial(ac, dest, 'sine', freq * 3.93, t, gain * 0.18, dur * 0.25, 0.002)
  partial(ac, dest, 'triangle', freq * 0.5, t, gain * 0.12, dur * 0.6, 0.006)
}

/** Holz-Klötzchen: kurzer, gedämpfter „Tok“ mit Klick-Anteil. */
function wood(ac: AudioContext, dest: AudioNode, { freq, at = 0, gain = 0.3 }: Voice): void {
  const t = ac.currentTime + at
  const o = ac.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq * 1.45, t)
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.025)
  const g = envelope(ac, t, gain, 0.002, 0.09)
  o.connect(g)
  g.connect(dest)
  o.start(t)
  o.stop(t + 0.16)
  // Klick: gefiltertes Rauschen, sehr kurz
  const n = ac.createBufferSource()
  n.buffer = noiseBuffer(ac)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq * 3
  bp.Q.value = 2.5
  const ng = envelope(ac, t, gain * 0.35, 0.001, 0.025)
  n.connect(bp)
  bp.connect(ng)
  ng.connect(dest)
  n.start(t)
  n.stop(t + 0.05)
}

/** Weiches Luftrauschen (Blätter im Wind) für Bildschirmwechsel. */
function whoosh(ac: AudioContext, dest: AudioNode): void {
  const t = ac.currentTime
  const n = ac.createBufferSource()
  n.buffer = noiseBuffer(ac)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.9
  bp.frequency.setValueAtTime(350, t)
  bp.frequency.exponentialRampToValueAtTime(1600, t + 0.22)
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.45)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.32, t + 0.16)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
  n.connect(bp)
  bp.connect(g)
  g.connect(dest)
  n.start(t)
  n.stop(t + 0.55)
}

// Töne (C-Dur-Pentatonik, klingt immer freundlich zusammen)
const N = {
  G4: 392,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
  A6: 1760,
  C7: 2093,
  E7: 2637.02,
}

const SOUNDS: Record<SfxName, (ac: AudioContext, d: AudioNode) => void> = {
  tap: (ac, d) => wood(ac, d, { freq: 820, gain: 0.32 }),
  open: (ac, d) => {
    marimba(ac, d, { freq: N.G5, gain: 0.22, dur: 0.3 })
    marimba(ac, d, { freq: N.C6, at: 0.06, gain: 0.2, dur: 0.35 })
  },
  close: (ac, d) => {
    marimba(ac, d, { freq: N.C6, gain: 0.18, dur: 0.28 })
    marimba(ac, d, { freq: N.G5, at: 0.06, gain: 0.18, dur: 0.32 })
  },
  found: (ac, d) => {
    wood(ac, d, { freq: 620, gain: 0.22 })
    marimba(ac, d, { freq: N.G5, at: 0.02, gain: 0.3 })
    marimba(ac, d, { freq: N.D6, at: 0.1, gain: 0.28 })
    bell(ac, d, { freq: N.G6, at: 0.1, gain: 0.09, dur: 0.8 })
  },
  unfound: (ac, d) => {
    marimba(ac, d, { freq: N.D5, gain: 0.22, dur: 0.3 })
    marimba(ac, d, { freq: N.G4, at: 0.09, gain: 0.2, dur: 0.38 })
  },
  almost: (ac, d) => {
    marimba(ac, d, { freq: N.G5, gain: 0.26 })
    marimba(ac, d, { freq: N.A5, at: 0.09, gain: 0.25 })
    marimba(ac, d, { freq: N.C6, at: 0.18, gain: 0.25 })
    bell(ac, d, { freq: N.E6, at: 0.3, gain: 0.12, dur: 1 })
  },
  bingo: (ac, d) => {
    marimba(ac, d, { freq: N.C5, gain: 0.26, dur: 0.6 })
    const run = [N.C6, N.E6, N.G6, N.C7]
    run.forEach((f, i) => bell(ac, d, { freq: f, at: 0.02 + i * 0.09, gain: 0.2, dur: 1.1 }))
    marimba(ac, d, { freq: N.G5, at: 0.36, gain: 0.2, dur: 0.6 })
    bell(ac, d, { freq: N.E7, at: 0.5, gain: 0.06, dur: 0.9 })
    bell(ac, d, { freq: N.C7, at: 0.62, gain: 0.05, dur: 1 })
  },
  full: (ac, d) => {
    const run = [N.C6, N.D6, N.E6, N.G6, N.A6, N.C7]
    run.forEach((f, i) => bell(ac, d, { freq: f, at: i * 0.075, gain: 0.16, dur: 0.8 }))
    marimba(ac, d, { freq: N.C5, at: 0, gain: 0.24, dur: 0.7 })
    marimba(ac, d, { freq: N.G4, at: 0.3, gain: 0.2, dur: 0.7 })
    // Schluss-Akkord: C-Dur, lang ausklingend
    const t = 0.55
    for (const f of [N.C6, N.E6, N.G6]) bell(ac, d, { freq: f, at: t, gain: 0.14, dur: 1.6 })
    marimba(ac, d, { freq: N.C5, at: t, gain: 0.24, dur: 1 })
    bell(ac, d, { freq: N.E7, at: t + 0.25, gain: 0.05, dur: 1.2 })
  },
  whoosh: (ac, d) => whoosh(ac, d),
}

/** Spielt einen kurzen Effekt-Klang (falls Ton an). */
export function playSfx(name: SfxName): void {
  if (!enabled) return
  try {
    const ac = audio()
    if (!ac || !out) return
    // Gleichen Klang nicht im Millisekundentakt stapeln (Doppeltipps).
    const now = ac.currentTime
    const last = lastPlayed[name]
    if (last != null && now - last < 0.05) return
    lastPlayed[name] = now
    SOUNDS[name](ac, out)
  } catch {
    // Klang ist Zugabe – niemals das Spiel stören.
  }
}

// ── Haptik ────────────────────────────────────────────────────────────────────

const HAPTICS: Record<HapticName, number | number[]> = {
  light: 10,
  success: [14, 50, 22],
  celebrate: [24, 60, 24, 60, 60],
}

/** Kurze Vibration (falls vom Gerät unterstützt). */
export function haptic(name: HapticName): void {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
    if (!hasUserActivation()) return
    navigator.vibrate(HAPTICS[name])
  } catch {
    // Kein Vibrationsmotor / verboten – egal.
  }
}
