import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FrameMeter,
  getFxLevel,
  LITE_WINDOWS,
  noteSteadyFrame,
  raiseFxLevel,
  resetFxLevel,
} from './perf-mode'

afterEach(() => {
  vi.restoreAllMocks()
  resetFxLevel()
})

describe('FrameMeter', () => {
  it('liefert je Fenster die mittlere Bildrate', () => {
    const m = new FrameMeter(1000)
    let fps: number | null = null
    for (let i = 0; i < 70 && fps === null; i++) fps = m.push(1000 / 60)
    expect(fps).toBeCloseTo(60, 0)
    // nächstes Fenster beginnt leer
    expect(m.push(16)).toBeNull()
  })

  it('ignoriert Pausen (Tab-Wechsel) und Unsinn', () => {
    const m = new FrameMeter(1000)
    expect(m.push(5000)).toBeNull()
    expect(m.push(0)).toBeNull()
    expect(m.push(Number.NaN)).toBeNull()
    let fps: number | null = null
    for (let i = 0; i < 40 && fps === null; i++) fps = m.push(30)
    expect(fps).toBeCloseTo(33.3, 0)
  })
})

describe('Sparmodus-Stufen', () => {
  it('steigt nur auf, nie ab', () => {
    expect(getFxLevel()).toBe('full')
    raiseFxLevel('steps')
    expect(getFxLevel()).toBe('steps')
    raiseFxLevel('full')
    expect(getFxLevel()).toBe('steps')
    raiseFxLevel('lite')
    expect(getFxLevel()).toBe('lite')
  })

  it('schaltet erst nach mehreren langsamen Ruhe-Fenstern in den Sparmodus', () => {
    let t = 10_000
    vi.spyOn(performance, 'now').mockImplementation(() => t)
    const run = (ms: number, dt: number) => {
      for (let s = 0; s < ms; s += dt) {
        t += dt
        noteSteadyFrame(dt)
      }
    }
    run(3100, 1000 / 60) // flott
    expect(getFxLevel()).toBe('full')
    run(3100 * (LITE_WINDOWS - 1), 34) // ≈ 29 fps, aber noch nicht genug Fenster
    expect(getFxLevel()).toBe('full')
    run(3100, 34)
    expect(getFxLevel()).toBe('lite')
  })

  it('zählt kurz nach dem Start nicht (Start-Ruckler)', () => {
    let t = 0
    vi.spyOn(performance, 'now').mockImplementation(() => t)
    for (let s = 0; s < 3900; s += 50) {
      t += 50
      noteSteadyFrame(50)
    }
    expect(getFxLevel()).toBe('full')
  })
})
