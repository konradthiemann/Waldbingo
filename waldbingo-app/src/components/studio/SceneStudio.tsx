// Studio-Abschnitt „Szene“: Handy-Vorschau der Waldszene (eingebettet),
// alle abgeleiteten Flags, Palette als Farbfelder, Partikel-Budget und
// Schnell-Links zur Abnahme-Matrix (?studio&scene=…).
import { useMemo, useState } from 'react'
import { SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { deriveScene, type SceneInput, type ScenePalette, sceneKey } from '../../lib/scene'
import { ForestScene } from '../scene/ForestScene'
import { particlePlan } from '../scene/particles'
import { Badge, Panel } from '../ui'

/** Abnahme-Matrix: jede Kombination muss „auf einen Blick“ erkennbar sein. */
export const SCENE_MATRIX: readonly SceneInput[] = [
  { season: 'sommer', weather: 'klar', time: 'tag' },
  { season: 'fruehling', weather: 'klar', time: 'morgen' },
  { season: 'herbst', weather: 'regen', time: 'abend' },
  { season: 'herbst', weather: 'nebel', time: 'morgen' },
  { season: 'winter', weather: 'schnee', time: 'nacht' },
  { season: 'winter', weather: 'frost', time: 'tag' },
  { season: 'sommer', weather: 'klar', time: 'nacht' },
  { season: 'fruehling', weather: 'nach_regen', time: 'tag' },
  { season: 'sommer', weather: 'wind', time: 'abend' },
  { season: 'herbst', weather: 'bewoelkt', time: 'daemmerung' },
]

const PALETTE_LABEL: Record<keyof ScenePalette, string> = {
  skyTop: 'Himmel oben',
  skyBottom: 'Himmel unten',
  glow: 'Glühen',
  cloud: 'Wolken',
  hillFar: 'Hügel fern',
  hillNear: 'Hügel nah',
  treeFar: 'Bäume fern',
  treeMid: 'Bäume Mitte',
  treeNear: 'Bäume vorn',
  foliage: 'Laub',
  foliageAccent: 'Laub-Akzent',
  trunk: 'Stamm',
  ground: 'Boden',
  groundShade: 'Boden-Schatten',
  flower: 'Blüten/Beeren',
  snow: 'Schnee',
  haze: 'Dunst',
  onScene: 'Text auf Szene',
  themeColor: 'Browser-Leiste',
}

const CELESTIAL_LABEL = { sun: 'Sonne', moon: 'Mond', none: 'verdeckt' } as const
const PRECIP_LABEL = { none: 'keiner', rain: 'Regen', snow: 'Schnee' } as const
const FOLIAGE_LABEL = { bluete: 'Blüte', satt: 'sattgrün', herbstlaub: 'Herbstlaub', kahl: 'kahl' } as const

function label(s: SceneInput): string {
  return `${SEASON_LABEL[s.season]} · ${s.weather ? WEATHER_LABEL[s.weather] : 'unbekannt'} · ${TIME_LABEL[s.time]}`
}

function href(s: SceneInput): string {
  return `?studio&scene=${s.season},${s.weather ?? 'klar'},${s.time}`
}

export function SceneStudio({ scene }: { scene: SceneInput }) {
  const state = useMemo(() => deriveScene(scene), [scene])
  const [calm, setCalm] = useState(false)
  const key = sceneKey(scene)

  const flags: [string, string][] = [
    ['Tageslicht', state.daylight.toFixed(2)],
    ['Himmelskörper', CELESTIAL_LABEL[state.celestial]],
    ['Sterne', state.stars ? 'ja' : 'nein'],
    ['Wolken', state.clouds.toFixed(2)],
    ['Niederschlag', `${PRECIP_LABEL[state.precipitation]}${state.precipIntensity ? ` (${state.precipIntensity.toFixed(1)})` : ''}`],
    ['Nebel', state.fog.toFixed(2)],
    ['Wind', state.wind.toFixed(2)],
    ['Laub', FOLIAGE_LABEL[state.foliage]],
    ['Schneedecke', state.snowCover ? 'ja' : 'nein'],
    ['Raureif', state.frost ? 'ja' : 'nein'],
    ['Nass/Pfützen', state.wet ? 'ja' : 'nein'],
    ['Fallende Blätter', state.fallingLeaves ? 'ja' : 'nein'],
    ['Blütenblätter', state.petals ? 'ja' : 'nein'],
    ['Glühwürmchen', state.fireflies ? 'ja' : 'nein'],
    ['Lichtpünktchen', state.motes ? 'ja' : 'nein'],
    ['Regenbogen', state.rainbow ? 'ja' : 'nein'],
  ]
  const phone = particlePlan(state, 390, 844, calm)
  const desk = particlePlan(state, 1280, 800, calm)
  const sum = (p: { count: number }[]) => p.reduce((n, x) => n + x.count, 0)

  return (
    <div className="space-y-4">
      <Panel sign="Szene" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* EINE eingebettete Vorschau im Handy-Format (volle Szenen mehrfach wären zu teuer). */}
          <div className="mx-auto w-full max-w-[260px] flex-none">
            <div
              className="relative overflow-hidden rounded-[28px] border-[5px] border-forest-900 shadow-panel"
              style={{ aspectRatio: '390 / 844' }}
            >
              <ForestScene scene={state} calm={calm} contained />
            </div>
            <label className="mt-2 flex min-h-[44px] cursor-pointer items-center justify-center gap-2 text-[13px] font-semibold text-forest-800">
              <input type="checkbox" checked={calm} onChange={(e) => setCalm(e.target.checked)} className="h-4 w-4" />
              ruhig (calm) – Partikel gedämpft
            </label>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <h3 className="text-[18px] font-semibold text-forest-900">{label(scene)}</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-3">
              {flags.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-cream-line py-0.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="text-[12.5px] text-muted">
              <span className="font-semibold text-forest-800">Partikel:</span> Handy {sum(phone)} · Desktop {sum(desk)}
              {phone.length > 0 && <> ({phone.map((p) => `${p.kind} ${p.count}`).join(', ')})</>}
            </div>
          </div>
        </div>
      </Panel>

      <Panel sign="Palette">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(PALETTE_LABEL) as (keyof ScenePalette)[]).map((k) => (
            <div key={k} className="flex items-center gap-2 rounded-lg bg-white/70 p-1.5 pr-2">
              <span
                className="h-9 w-9 flex-none rounded-[10px] border border-cream-line"
                style={{
                  background:
                    k === 'haze'
                      ? `linear-gradient(${state.palette.haze}, ${state.palette.haze}), repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 10px 10px`
                      : state.palette[k],
                }}
              />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[12px] font-semibold text-forest-900">{PALETTE_LABEL[k]}</span>
                <span className="block truncate font-mono text-[11px] text-muted">{state.palette[k]}</span>
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel sign="Abnahme-Matrix">
        <p className="mb-3 text-[13px] text-muted">
          Jede Szene muss Wetter, Jahreszeit und Tageszeit „auf einen Blick“ zeigen. Tippen lädt die Szene als
          Hintergrund (Handy- und Desktop-Ansicht prüfen).
        </p>
        <div className="flex flex-wrap gap-2">
          {SCENE_MATRIX.map((m) => {
            const active = sceneKey(m) === key
            return (
              <a
                key={sceneKey(m)}
                href={href(m)}
                aria-current={active ? 'true' : undefined}
                className="focus-ring inline-flex min-h-[44px] items-center rounded-full"
              >
                <Badge tone={active ? 'forest' : 'cream'}>{label(m)}</Badge>
              </a>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
