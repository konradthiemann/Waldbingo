import { afterEach, describe, expect, it, vi } from 'vitest'
import { haptic, isSoundEnabled, playSfx, setSoundEnabled, type SfxName } from './sfx'

const ALL: SfxName[] = ['tap', 'open', 'close', 'found', 'unfound', 'almost', 'bingo', 'full', 'whoosh']

describe('sfx – Vertrag & Fehlertoleranz', () => {
  afterEach(() => {
    setSoundEnabled(true)
    vi.unstubAllGlobals()
  })

  it('schaltet Ton an und aus', () => {
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)
    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })

  it('wirft ohne WebAudio (jsdom) nie', () => {
    for (const n of ALL) expect(() => playSfx(n)).not.toThrow()
  })

  it('wirft auch dann nicht, wenn der AudioContext kaputt ist', () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('kaputt')
        }
      },
    )
    for (const n of ALL) expect(() => playSfx(n)).not.toThrow()
  })

  it('vibriert über navigator.vibrate, falls vorhanden', () => {
    const vibrate = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    haptic('success')
    expect(vibrate).toHaveBeenCalledTimes(1)
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('nein')
      },
      configurable: true,
    })
    expect(() => haptic('celebrate')).not.toThrow()
  })
})
