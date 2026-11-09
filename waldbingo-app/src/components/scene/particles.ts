// Wetter-Partikel der Waldszene: EIN <canvas>, EIN rAF-Loop (Art Bible §8).
// Regen (schräg je Wind), Schnee, fallende Blätter, Blütenblätter,
// Glühwürmchen, Lichtpünktchen, Raureif-/Tropfen-Glitzer und Windböen.
// `particlePlan` ist rein (testbar); `ParticleEngine` zeichnet.
import type { SceneState } from '../../lib/scene'
import { seeded } from './geometry'

export type ParticleKind = 'rain' | 'snow' | 'leaf' | 'petal' | 'firefly' | 'mote' | 'sparkle' | 'gust'

export interface ParticleSpec {
  kind: ParticleKind
  count: number
}

/** Szenen-Felder, die die Partikel bestimmen. */
export type ParticleScene = Pick<
  SceneState,
  | 'precipitation'
  | 'precipIntensity'
  | 'fallingLeaves'
  | 'petals'
  | 'fireflies'
  | 'motes'
  | 'frost'
  | 'snowCover'
  | 'wet'
  | 'wind'
  | 'isNight'
  | 'daylight'
>

/** Referenzfläche: Handy hochkant. */
export const PHONE_AREA = 390 * 844
/** Höchstzahl Partikel auf Handy-Fläche (Art Bible: ≤ ~80). */
export const PHONE_BUDGET = 80
/** Obergrenze des Flächenfaktors (große Bildschirme). */
export const MAX_AREA_FACTOR = 3
/** Dämpfung bei `calm`. */
export const CALM_FACTOR = 0.35

/**
 * Wie viele Partikel welcher Art? Basiswerte gelten für Handy-Fläche,
 * werden auf das Budget gedeckelt und dann mit der Fläche skaliert.
 * `budget` < 1 dünnt zusätzlich aus (Sparmodus, perf-mode.ts).
 */
export function particlePlan(
  s: ParticleScene,
  width: number,
  height: number,
  calm = false,
  budget = 1,
): ParticleSpec[] {
  const want: ParticleSpec[] = []
  if (s.precipitation === 'rain') want.push({ kind: 'rain', count: 34 + 50 * s.precipIntensity })
  if (s.precipitation === 'snow') want.push({ kind: 'snow', count: 32 + 46 * s.precipIntensity })
  if (s.fallingLeaves) want.push({ kind: 'leaf', count: s.wind > 0.6 ? 16 : 11 })
  if (s.petals) want.push({ kind: 'petal', count: 13 })
  if (s.fireflies) want.push({ kind: 'firefly', count: 16 })
  if (s.motes) want.push({ kind: 'mote', count: 14 })
  const glitter = s.frost || (s.snowCover && s.daylight > 0.35) || (s.wet && s.precipitation === 'none')
  if (glitter) want.push({ kind: 'sparkle', count: s.isNight ? 7 : 12 })
  if (s.wind > 0.6) want.push({ kind: 'gust', count: 4 })

  const total = want.reduce((n, p) => n + p.count, 0)
  const fit = total > PHONE_BUDGET ? PHONE_BUDGET / total : 1
  const area = Math.min(MAX_AREA_FACTOR, Math.max(0.15, (Math.max(0, width) * Math.max(0, height)) / PHONE_AREA))
  const k = fit * area * (calm ? CALM_FACTOR : 1) * Math.max(0, Math.min(1, budget))
  return want
    .map((p) => ({ kind: p.kind, count: Math.max(1, Math.round(p.count * k)) }))
    .filter((p) => width > 0 && height > 0 && p.count > 0)
}

// ── Engine ──────────────────────────────────────────────────────────────────

interface Particle {
  kind: ParticleKind
  x: number
  y: number
  /** Tiefe 0 (fern) … 1 (nah): Größe, Tempo, Deckkraft. */
  z: number
  size: number
  vx: number
  vy: number
  rot: number
  vrot: number
  phase: number
  /** Regen: Aufprallhöhe; Glitzer: Zyklus-Zähler. */
  aux: number
  color: string
}

interface Splash {
  x: number
  y: number
  t: number
}

export interface ParticleColors {
  leaves: string[]
  petals: string[]
}

const TAU = Math.PI * 2

/** Weicher Leuchtpunkt als Sprite (einmal gerendert, dann nur drawImage). */
function makeGlowSprite(color: string, size: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return null
  const h = size / 2
  const grad = g.createRadialGradient(h, h, 0, h, h, h)
  grad.addColorStop(0, color)
  grad.addColorStop(0.25, color)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export class ParticleEngine {
  private ctx: CanvasRenderingContext2D | null
  private w = 0
  private h = 0
  private dpr = 1
  private parts: Particle[] = []
  private splashes: Splash[] = []
  private scene: ParticleScene | null = null
  private colors: ParticleColors = { leaves: ['#e8892f'], petals: ['#ffc4d8'] }
  private calm = false
  /** Partikel-Budget 0 … 1 (Sparmodus). */
  private budget = 1
  /** Optional: Bildabstand (ms) jedes gezeichneten Bilds – für die Sparmodus-Messung. */
  onFrame: ((dtMs: number) => void) | null = null
  private raf = 0
  private last = 0
  private t = 0
  /** Loop läuft gerade (rAF angefordert). */
  private running = false
  /** Von außen gewünscht (sichtbar, Bewegung erlaubt). Läuft trotzdem nur, wenn es etwas zu bewegen gibt. */
  private active = false
  private rnd = seeded(2024)
  private glowFirefly: HTMLCanvasElement | null = null
  private glowMote: HTMLCanvasElement | null = null
  private glowSnow: HTMLCanvasElement | null = null

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')
    this.glowFirefly = makeGlowSprite('rgba(236,255,150,0.95)', 48)
    this.glowMote = makeGlowSprite('rgba(255,232,150,0.95)', 24)
    this.glowSnow = makeGlowSprite('rgba(255,255,255,0.95)', 32)
  }

  /** Größe in CSS-Pixeln; Pixeldichte wird auf 2 gedeckelt. */
  resize(width: number, height: number, devicePixelRatio: number): void {
    const dpr = Math.min(2, Math.max(1, devicePixelRatio || 1))
    const changed = width !== this.w || height !== this.h || dpr !== this.dpr
    this.w = Math.max(0, Math.round(width))
    this.h = Math.max(0, Math.round(height))
    this.dpr = dpr
    if (!changed) return
    this.canvas.width = Math.round(this.w * dpr)
    this.canvas.height = Math.round(this.h * dpr)
    // Bei Größenwechsel neu verteilen, damit nichts außerhalb hängt.
    this.parts = []
    this.sync()
    this.wake()
  }

  setScene(scene: ParticleScene, colors: ParticleColors, calm: boolean, budget = 1): void {
    this.scene = scene
    this.colors = colors
    this.calm = calm
    this.budget = budget
    for (const p of this.parts) {
      if (p.kind === 'leaf') p.color = this.pick(colors.leaves)
      if (p.kind === 'petal') p.color = this.pick(colors.petals)
    }
    this.sync()
    this.wake()
  }

  /**
   * Bewegung erlauben. Der rAF-Loop läuft nur, solange es Partikel gibt –
   * ohne Partikel (z. B. Winter · klar) bleibt die Fläche leer und der Loop aus.
   */
  start(): void {
    this.active = true
    this.wake()
  }

  /** Bewegung anhalten (versteckter Tab, reduzierte Bewegung). */
  stop(): void {
    this.active = false
    this.halt()
  }

  /** Läuft der rAF-Loop gerade? */
  get isRunning(): boolean {
    return this.running
  }

  /** Nach Szenen-/Größenwechsel: Loop starten, wenn erlaubt und nötig, sonst einmal zeichnen. */
  private wake(): void {
    if (this.active && this.hasWork()) this.loop()
    else {
      if (this.running) this.halt()
      this.draw()
    }
  }

  private hasWork(): boolean {
    return this.parts.length > 0 || this.splashes.length > 0
  }

  private loop(): void {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    const frame = (now: number) => {
      if (!this.running) return
      this.onFrame?.(now - this.last)
      const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
      this.last = now
      this.step(dt)
      this.draw()
      // Nichts mehr zu bewegen (Plan leer, letzte Spritzer verklungen): Loop beenden.
      if (!this.hasWork()) {
        this.running = false
        return
      }
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  private halt(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  /** Standbild (reduzierte Bewegung): einmal zeichnen, nichts bewegen. */
  drawStatic(): void {
    this.stop()
    this.draw()
  }

  get count(): number {
    return this.parts.length
  }

  // ── intern ──

  private pick<T>(list: T[]): T {
    return list[Math.floor(this.rnd() * list.length) % list.length]
  }

  /** Anzahl je Art an den Plan anpassen (vorhandene Partikel bleiben). */
  private sync(): void {
    if (!this.scene || this.w === 0 || this.h === 0) {
      this.parts = []
      return
    }
    const plan = particlePlan(this.scene, this.w, this.h, this.calm, this.budget)
    const next: Particle[] = []
    for (const spec of plan) {
      const have = this.parts.filter((p) => p.kind === spec.kind)
      for (let i = 0; i < spec.count; i++) next.push(have[i] ?? this.spawn(spec.kind, true))
    }
    this.parts = next
    if (!plan.some((p) => p.kind === 'rain')) this.splashes = []
  }

  private spawn(kind: ParticleKind, initial: boolean): Particle {
    const r = this.rnd
    const z = r()
    const p: Particle = {
      kind,
      x: r() * this.w,
      y: initial ? r() * this.h : -20,
      z,
      size: 1,
      vx: 0,
      vy: 0,
      rot: r() * TAU,
      vrot: (r() - 0.5) * 2,
      phase: r() * TAU,
      aux: 0,
      color: '#ffffff',
    }
    const wind = this.scene?.wind ?? 0
    switch (kind) {
      case 'rain': {
        const angle = 0.1 + wind * 0.5
        p.vy = 720 + 520 * z
        p.vx = p.vy * Math.tan(angle)
        p.size = 0.9 + z * 1.1
        // Aufprall irgendwo im unteren Bilddrittel (Boden/Pfützen).
        p.aux = this.h * (0.72 + r() * 0.28)
        if (!initial) {
          p.y = -r() * this.h * 0.3 - 10
          p.x = r() * (this.w + this.h * Math.tan(angle)) - this.h * Math.tan(angle)
        }
        break
      }
      case 'snow':
        p.size = 1.3 + z * 2.8
        p.vy = 22 + z * 46
        p.vx = wind * (30 + z * 60)
        if (!initial) p.y = -10
        break
      case 'leaf':
        p.size = 6 + z * 6
        p.vy = 26 + z * 30
        p.vx = wind * (60 + z * 120)
        p.vrot = (r() - 0.5) * 2.4
        p.color = this.pick(this.colors.leaves)
        if (!initial) {
          p.y = -20
          p.x = r() * this.w - (wind > 0.5 ? this.w * 0.3 : 0)
        }
        break
      case 'petal':
        p.size = 3 + z * 2.6
        p.vy = 16 + z * 18
        p.vx = 10 + wind * 60
        p.vrot = (r() - 0.5) * 3
        p.color = this.pick(this.colors.petals)
        if (!initial) {
          p.y = -10
          p.x = r() * this.w * 1.1 - this.w * 0.1
        }
        break
      case 'firefly':
        p.x = r() * this.w
        p.y = this.h * (0.42 + r() * 0.52)
        p.size = 6 + z * 7
        break
      case 'mote':
        // Lichtpünktchen schweben im Waldlicht (untere Hälfte), nicht im offenen Himmel.
        p.y = initial ? this.h * (0.45 + r() * 0.5) : this.h + 10
        p.size = 2.5 + z * 3
        p.vy = -(4 + z * 7)
        break
      case 'sparkle':
        this.placeSparkle(p)
        p.size = 3 + z * 4
        break
      case 'gust':
        p.x = initial ? r() * this.w : -260 - r() * 400
        p.y = this.h * (0.08 + r() * 0.62)
        p.vx = 240 + z * 200
        p.size = 70 + z * 110
        break
    }
    return p
  }

  private placeSparkle(p: Particle): void {
    // Glitzer sitzt auf Boden, Büschen und Baumkronen (untere Bildhälfte).
    p.x = this.rnd() * this.w
    p.y = this.h * (0.5 + this.rnd() * 0.48)
  }

  private step(dt: number): void {
    const s = this.scene
    if (!s) return
    const slow = this.calm ? 0.55 : 1
    const d = dt * slow
    this.t += d
    const t = this.t
    const w = this.w
    const h = this.h
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i]
      switch (p.kind) {
        case 'rain':
          p.x += p.vx * d
          p.y += p.vy * d
          if (p.y > p.aux) {
            if (this.splashes.length < 40 && this.rnd() < 0.7) this.splashes.push({ x: p.x, y: p.aux, t: 0 })
            this.parts[i] = this.spawn('rain', false)
          }
          break
        case 'snow':
          p.y += p.vy * d
          p.x += (p.vx + Math.sin(t * 0.9 + p.phase) * (10 + p.z * 14)) * d
          if (p.y > h + 8) this.parts[i] = this.spawn('snow', false)
          else if (p.x > w + 10) p.x = -10
          else if (p.x < -10) p.x = w + 10
          break
        case 'leaf':
        case 'petal': {
          const sway = Math.sin(t * (p.kind === 'leaf' ? 1.1 : 1.7) + p.phase)
          p.y += (p.vy + sway * 6) * d
          p.x += (p.vx + sway * (p.kind === 'leaf' ? 26 : 18)) * d
          p.rot += p.vrot * d
          if (p.y > h + 20 || p.x > w + 40) this.parts[i] = this.spawn(p.kind, false)
          break
        }
        case 'firefly':
          p.x += (Math.sin(t * 0.5 + p.phase) * 14 + Math.cos(t * 0.23 + p.phase * 2) * 9) * d
          p.y += Math.cos(t * 0.37 + p.phase) * 10 * d
          if (p.x < -20) p.x = w + 20
          if (p.x > w + 20) p.x = -20
          break
        case 'mote':
          p.y += p.vy * d
          p.x += Math.sin(t * 0.6 + p.phase) * 8 * d
          if (p.y < this.h * 0.38) this.parts[i] = this.spawn('mote', false)
          break
        case 'sparkle': {
          const cycle = Math.floor((t * 0.9 + p.phase) / TAU)
          if (cycle !== p.aux) {
            p.aux = cycle
            this.placeSparkle(p)
          }
          break
        }
        case 'gust':
          p.x += p.vx * (0.6 + s.wind * 0.6) * d
          if (p.x > w + 260) this.parts[i] = this.spawn('gust', false)
          break
      }
    }
    for (const sp of this.splashes) sp.t += d
    this.splashes = this.splashes.filter((sp) => sp.t < 0.38)
  }

  private draw(): void {
    const g = this.ctx
    if (!g) return
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    g.clearRect(0, 0, this.w, this.h)
    const s = this.scene
    if (!s) return
    const night = s.isNight
    const t = this.t

    // Regen: alle Striche in einem Pfad je Tiefenstufe (schnell).
    const rain = this.parts.filter((p) => p.kind === 'rain')
    if (rain.length) {
      g.lineCap = 'round'
      for (const near of [false, true]) {
        g.beginPath()
        for (const p of rain) {
          if (p.z > 0.55 !== near) continue
          const len = 0.024 + p.z * 0.014
          g.moveTo(p.x, p.y)
          g.lineTo(p.x - p.vx * len, p.y - p.vy * len)
        }
        g.lineWidth = near ? 1.7 : 1.1
        g.strokeStyle = night
          ? `rgba(190,205,240,${near ? 0.42 : 0.26})`
          : `rgba(235,244,255,${near ? 0.62 : 0.4})`
        g.stroke()
      }
      // Spritzer: kleine, sich weitende Ellipsen.
      g.lineWidth = 1.2
      for (const sp of this.splashes) {
        const k = sp.t / 0.38
        g.strokeStyle = night ? `rgba(190,205,240,${0.45 * (1 - k)})` : `rgba(240,248,255,${0.7 * (1 - k)})`
        g.beginPath()
        g.ellipse(sp.x, sp.y, 2 + k * 7, 0.8 + k * 2.2, 0, Math.PI, TAU)
        g.stroke()
      }
    }

    for (const p of this.parts) {
      switch (p.kind) {
        case 'snow': {
          const sz = p.size * 2.6
          if (this.glowSnow) {
            g.globalAlpha = night ? 0.7 : 0.92
            g.drawImage(this.glowSnow, p.x - sz, p.y - sz, sz * 2, sz * 2)
            g.globalAlpha = 1
          } else {
            g.fillStyle = 'rgba(255,255,255,0.9)'
            g.beginPath()
            g.arc(p.x, p.y, p.size, 0, TAU)
            g.fill()
          }
          break
        }
        case 'leaf':
          this.drawLeaf(g, p, t)
          break
        case 'petal':
          this.drawPetal(g, p, t)
          break
        case 'firefly': {
          const pulse = Math.pow(Math.max(0, Math.sin(t * 1.25 + p.phase)), 2)
          const a = 0.2 + 0.8 * pulse
          if (this.glowFirefly) {
            g.globalAlpha = a
            const sz = p.size * (0.8 + pulse * 0.5)
            g.drawImage(this.glowFirefly, p.x - sz, p.y - sz, sz * 2, sz * 2)
          }
          g.globalAlpha = Math.min(1, a + 0.15)
          g.fillStyle = '#fbffd6'
          g.beginPath()
          g.arc(p.x, p.y, 1.4 + p.z, 0, TAU)
          g.fill()
          g.globalAlpha = 1
          break
        }
        case 'mote':
          if (this.glowMote) {
            // sanft ein- und ausblenden (oben verglühen)
            const fade = Math.min(1, (p.y / this.h - 0.38) * 5)
            g.globalAlpha = Math.max(0, fade) * (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + p.phase)))
            g.drawImage(this.glowMote, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
            g.globalAlpha = 1
          }
          break
        case 'sparkle': {
          const a = Math.pow(Math.max(0, Math.sin(t * 0.9 + p.phase)), 6)
          if (a < 0.02) break
          this.drawSparkle(g, p.x, p.y, p.size * (0.6 + a * 0.6), a * (night ? 0.6 : 0.95))
          break
        }
        case 'gust':
          this.drawGust(g, p, t)
          break
        default:
          break
      }
    }
  }

  private drawLeaf(g: CanvasRenderingContext2D, p: Particle, t: number): void {
    const flip = Math.cos(t * 1.8 + p.phase)
    g.save()
    g.translate(p.x, p.y)
    g.rotate(p.rot)
    g.scale(1, Math.max(0.2, Math.abs(flip)))
    const s = p.size
    g.fillStyle = p.color
    g.beginPath()
    g.moveTo(0, -s)
    g.quadraticCurveTo(s * 0.85, -s * 0.2, 0, s)
    g.quadraticCurveTo(-s * 0.85, -s * 0.2, 0, -s)
    g.fill()
    g.strokeStyle = 'rgba(13,21,48,0.28)'
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(0, -s * 0.7)
    g.lineTo(0, s * 1.15)
    g.stroke()
    g.restore()
  }

  private drawPetal(g: CanvasRenderingContext2D, p: Particle, t: number): void {
    const flip = Math.cos(t * 2.2 + p.phase)
    g.save()
    g.translate(p.x, p.y)
    g.rotate(p.rot)
    g.scale(1, Math.max(0.25, Math.abs(flip)))
    g.fillStyle = p.color
    g.globalAlpha = 0.92
    g.beginPath()
    g.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, TAU)
    g.fill()
    g.globalAlpha = 1
    g.restore()
  }

  private drawSparkle(g: CanvasRenderingContext2D, x: number, y: number, s: number, a: number): void {
    g.save()
    g.globalAlpha = a
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.moveTo(x, y - s * 1.6)
    g.quadraticCurveTo(x, y, x + s * 1.6, y)
    g.quadraticCurveTo(x, y, x, y + s * 1.6)
    g.quadraticCurveTo(x, y, x - s * 1.6, y)
    g.quadraticCurveTo(x, y, x, y - s * 1.6)
    g.fill()
    g.restore()
  }

  /** Comic-Windböe: geschwungene Linie mit kleinem Kringel am Ende. */
  private drawGust(g: CanvasRenderingContext2D, p: Particle, t: number): void {
    const len = p.size
    const fade = Math.min(1, Math.max(0, p.x / 120), Math.max(0, (this.w + 200 - p.x) / 160))
    if (fade <= 0) return
    const wob = Math.sin(t * 2 + p.phase) * 4
    g.save()
    g.globalAlpha = 0.38 * fade
    g.strokeStyle = '#ffffff'
    g.lineWidth = 2.2
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(p.x - len, p.y + wob)
    g.bezierCurveTo(p.x - len * 0.6, p.y - 10 + wob, p.x - len * 0.35, p.y + 9, p.x, p.y)
    // Kringel
    g.arc(p.x, p.y - 7, 7, Math.PI / 2, Math.PI * 2.1, true)
    g.stroke()
    g.restore()
  }
}
