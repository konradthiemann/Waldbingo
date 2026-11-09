// Studio (?studio): Vorschau-Werkbank für Szene, Figuren und Spielbrett-Bausteine.
// Hilft beim Gestalten und Abnehmen der Spielwelt – im normalen Spielfluss unsichtbar.
import { useState } from 'react'
import { SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { SCENE_SEASONS, SCENE_TIMES, SCENE_WEATHERS, type SceneInput } from '../../lib/scene'
import { Panel } from '../ui'
import { CharacterStudio } from './CharacterStudio'
import { GameStudio } from './GameStudio'
import { SceneStudio } from './SceneStudio'

interface Props {
  scene: SceneInput
  onScene: (s: SceneInput) => void
  onClose: () => void
}

type Tab = 'szene' | 'figuren' | 'spiel'

export default function Studio({ scene, onScene, onClose }: Props) {
  // Deep-Link: ?studio=figuren / ?studio=spiel öffnet direkt den Abschnitt.
  const [tab, setTab] = useState<Tab>(() => {
    const v = new URLSearchParams(window.location.search).get('studio')
    return v === 'figuren' || v === 'spiel' ? v : 'szene'
  })
  return (
    <div className="mx-auto max-w-[920px] space-y-4">
      <Panel variant="glass" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[20px] font-semibold text-forest-900">Wingo-Studio</h2>
          <button type="button" onClick={onClose} className="text-[13px] font-bold text-forest-700 underline">
            Studio schließen
          </button>
        </div>
        <Picker
          label="Jahreszeit"
          value={scene.season}
          options={SCENE_SEASONS}
          labels={SEASON_LABEL}
          onChange={(season) => onScene({ ...scene, season })}
        />
        <Picker
          label="Wetter"
          value={scene.weather ?? 'klar'}
          options={SCENE_WEATHERS}
          labels={WEATHER_LABEL}
          onChange={(weather) => onScene({ ...scene, weather })}
        />
        <Picker
          label="Tageszeit"
          value={scene.time}
          options={SCENE_TIMES}
          labels={TIME_LABEL}
          onChange={(time) => onScene({ ...scene, time })}
        />
        <div className="flex gap-2 pt-1">
          {(['szene', 'figuren', 'spiel'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 font-display text-[14px] font-semibold ${
                tab === t ? 'bg-forest-600 text-white' : 'bg-white/70 text-forest-800'
              }`}
            >
              {t === 'szene' ? 'Szene' : t === 'figuren' ? 'Figuren' : 'Spielbrett'}
            </button>
          ))}
        </div>
      </Panel>
      {tab === 'szene' && <SceneStudio scene={scene} />}
      {tab === 'figuren' && <CharacterStudio scene={scene} />}
      {tab === 'spiel' && <GameStudio scene={scene} />}
    </div>
  )
}

function Picker<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  labels: Record<T, string>
  onChange: (v: T) => void
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-forest-800/70">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${
              o === value ? 'border-forest-700 bg-forest-600 text-white' : 'border-white/70 bg-white/70 text-forest-900'
            }`}
          >
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  )
}
