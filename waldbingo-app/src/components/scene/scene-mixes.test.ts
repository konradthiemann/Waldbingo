import { describe, expect, it } from 'vitest'
import { deriveScene, SCENE_SEASONS, SCENE_TIMES, SCENE_WEATHERS } from '../../lib/scene'
import { mixVarName, type SceneMix, sceneMixes, sceneMixVars } from './scene-mixes'

const COLOR = /^(#[0-9a-f]{6}|rgba\(\d{1,3},\d{1,3},\d{1,3},(0|1|0?\.\d+)\))$/

describe('scene-mixes – vorberechnete Mischfarben statt color-mix()', () => {
  it('liefert für alle Szenen gültige, einfache Farbwerte (ohne var()/color-mix)', () => {
    for (const season of SCENE_SEASONS)
      for (const weather of SCENE_WEATHERS)
        for (const time of SCENE_TIMES) {
          const vars = sceneMixVars(deriveScene({ season, weather, time }).palette)
          for (const [k, v] of Object.entries(vars)) expect(v, `${season}/${weather}/${time} ${k}`).toMatch(COLOR)
        }
  })

  it('entspricht color-mix(in srgb, a k%, b)', () => {
    const p = deriveScene({ season: 'sommer', weather: 'klar', time: 'tag' }).palette
    const m = sceneMixes({ ...p, trunk: '#ffffff', treeFar: '#000000' })
    // 45 % Weiß + 55 % Schwarz → 0,45 · 255 ≈ 115 (0x73)
    expect(m.farOakBare).toBe('#737373')
  })

  it('jede Mischfarbe ist in scene.css registriert und blendet über', async () => {
    // Vitest liefert CSS-Importe leer – deshalb die Datei direkt lesen (Pfad relativ zum App-Ordner).
    const fsModule = 'node:fs'
    const fs = (await import(/* @vite-ignore */ fsModule)) as { readFileSync: (p: string, enc: 'utf8') => string }
    const css = fs.readFileSync('src/components/scene/scene.css', 'utf8')
    const names = Object.keys(sceneMixes(deriveScene({ season: 'sommer', weather: 'klar', time: 'tag' }).palette))
    const transition = css.match(/transition-property:([^;]+);/)?.[1] ?? ''
    for (const n of names) {
      const v = mixVarName(n as SceneMix)
      expect(css, `@property ${v}`).toContain(`@property ${v} {`)
      expect(transition, `transition ${v}`).toMatch(new RegExp(`${v}(?=[,\\s]|$)`))
    }
  })

  it('Szenen-Komponenten nutzen kein color-mix() mehr', async () => {
    const files = import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
    for (const [f, src] of Object.entries(files)) expect(src, f).not.toContain('color-mix(')
  })
})
