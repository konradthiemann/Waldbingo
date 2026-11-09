// Studio-Abschnitt „Spielbrett“: Live-Vorschau mit echtem GameView (ohne
// Speichern!) und Knöpfen für typische Spielstände, Feiern und Klänge.
// Deep-Links für die visuelle QA: ?studio=spiel&demo=fast|bingo|voll&party=bingo|full&players=4&shared=1
// Foto-Prüfung mit vorgegebenem Ergebnis (ohne Kamera/Modell):
// ?studio=spiel&photo=laedt|prueft|passt|unsicher|anderes|fehler|offline
import { type ReactNode, useMemo, useState } from 'react'
import { OBJEKTE } from '../../data/objects'
import type { Habitat, Kategorie, SpielKontext } from '../../data/types'
import { type ClassifyResult, matchesObject } from '../../lib/classifier'
import { openMojiSrc } from '../../lib/emoji'
import type { GameState } from '../../lib/game-state'
import { createGame } from '../../lib/generator'
import { HABITAT_LABEL } from '../../lib/labels'
import type { SceneInput } from '../../lib/scene'
import { playSfx, type SfxName } from '../../lib/sfx'
import { wingoLine } from '../../lib/wingo-lines'
import { Celebration, type CelebrationKind } from '../fx'
import { GameView } from '../game/GameView'
import { type PhotoVerifyState, PhotoVerifyView } from '../game/PhotoVerify'
import { GameButton, Panel } from '../ui'

type Demo = 'leer' | 'fast' | 'bingo' | 'voll'

const DEMOS: Array<{ id: Demo; label: string }> = [
  { id: 'fast', label: 'fast Bingo' },
  { id: 'bingo', label: 'Bingo' },
  { id: 'voll', label: 'volle Karte' },
  { id: 'leer', label: 'zurücksetzen' },
]

/** Vorbefüllte Funde je Demo-Stand (Spieler 1; weitere Spieler leicht versetzt). */
const PRESET: Record<Demo, number[]> = {
  leer: [],
  // Reihe 0 und Diagonale ↘ haben je 4 von 5 → zwei „heiße“ Felder (4 und 24)
  fast: [0, 1, 2, 3, 6, 12, 18, 9, 15],
  // Reihe 2 komplett + Diagonale fast
  bingo: [10, 11, 12, 13, 14, 0, 6, 18, 3, 21],
  voll: Array.from({ length: 25 }, (_, i) => i),
}

const SOUNDS: SfxName[] = ['tap', 'open', 'close', 'found', 'unfound', 'almost', 'bingo', 'full', 'whoosh']
const PLAYER_OPTIONS = [1, 2, 4, 10]
const HABITATS: Habitat[] = ['mischwald', 'laubwald', 'nadelwald', 'gewaesser']

// ── Foto-Prüfung: vorgegebene Ergebnisse (echte ImageNet-Klassennamen) ──
type PhotoDemo = 'laedt' | 'prueft' | 'passt' | 'unsicher' | 'anderes' | 'fehler' | 'offline'

const PHOTO_DEMOS: Array<{ id: PhotoDemo; label: string }> = [
  { id: 'laedt', label: 'Lupe lädt' },
  { id: 'prueft', label: 'prüft' },
  { id: 'passt', label: 'passt' },
  { id: 'unsicher', label: 'unsicher' },
  { id: 'anderes', label: 'eher anderes' },
  { id: 'fehler', label: 'Fehler' },
  { id: 'offline', label: 'offline' },
]

const res = (className: string, probability: number, kategorie: Kategorie | null): ClassifyResult => ({
  className,
  probability,
  kategorie,
  matchLabels: kategorie ? [kategorie] : [],
})

const PHOTO_RESULTS: Partial<Record<PhotoDemo, ClassifyResult[]>> = {
  passt: [res('agaric', 0.62, 'Pilz'), res('mushroom', 0.21, 'Pilz'), res('bolete', 0.05, 'Pilz'), res('earthstar', 0.03, null)],
  unsicher: [res('maze', 0.31, null), res('digital clock', 0.12, null), res('jigsaw puzzle', 0.06, null)],
  anderes: [res('daisy', 0.44, 'Pflanze'), res('pot, flowerpot', 0.14, 'Pflanze'), res('agaric', 0.03, 'Pilz')],
}

/** Zustand wie in PhotoVerify – Treffer über die echte `matchesObject`-Regel. */
function photoState(demo: PhotoDemo, kategorie: Kategorie): PhotoVerifyState {
  const base: PhotoVerifyState = { phase: 'result', results: [], matched: false, confidence: 0, matchLabel: '', error: null }
  if (demo === 'laedt') return { ...base, phase: 'loading-model' }
  if (demo === 'prueft') return { ...base, phase: 'classifying' }
  if (demo === 'fehler' || demo === 'offline') return { ...base, error: 'Failed to fetch' }
  const results = PHOTO_RESULTS[demo] ?? []
  const m = matchesObject(results, kategorie)
  return { ...base, results, matched: m.matched, confidence: m.confidence, matchLabel: m.label }
}

function readParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

function initialDemo(): Demo {
  const d = readParam('demo')
  return d === 'fast' || d === 'bingo' || d === 'voll' ? d : 'leer'
}

function initialPhoto(): PhotoDemo | null {
  const p = readParam('photo')
  return PHOTO_DEMOS.some((d) => d.id === p) ? (p as PhotoDemo) : null
}

function initialParty(): CelebrationKind | null {
  const p = readParam('party')
  return p === 'bingo' || p === 'full' ? p : null
}

export function GameStudio({ scene }: { scene: SceneInput }) {
  const [demo, setDemo] = useState<Demo>(initialDemo)
  const [nonce, setNonce] = useState(0)
  const [players, setPlayers] = useState(() => {
    const n = Number(readParam('players'))
    return PLAYER_OPTIONS.includes(n) ? n : 2
  })
  const [shared, setShared] = useState(() => readParam('shared') === '1')
  const [habitat, setHabitat] = useState<Habitat>('mischwald')
  const [party, setParty] = useState<CelebrationKind | null>(initialParty)
  const [note, setNote] = useState<string | null>(null)
  const [photo, setPhoto] = useState<PhotoDemo | null>(initialPhoto)
  const photoTarget = useMemo(() => OBJEKTE.find((o) => o.id === 'fliegenpilz') ?? OBJEKTE[0], [])

  const ctx: SpielKontext = useMemo(
    () => ({ season: scene.season, weather: scene.weather, time: scene.time, habitat }),
    [scene.season, scene.weather, scene.time, habitat],
  )

  const game: GameState = useMemo(() => {
    const { pool, cards } = createGame({ data: OBJEKTE, ctx, diff: 1, seedStr: 'studio', players })
    const own = PRESET[demo]
    return {
      pool,
      cards,
      // Mitspieler bekommen ein paar Funde, damit die Tabs etwas zeigen.
      found: cards.map((_, p) => new Set(p === 0 ? own : own.filter((i) => (i + p) % 3 === 0))),
      activePlayer: 0,
      ctx,
      seedStr: 'studio',
      diff: 1,
      players,
      createdAt: 0,
      selfPlayer: shared ? 0 : undefined,
    }
  }, [ctx, players, demo, shared])

  const remountKey = `${demo}-${nonce}-${players}-${shared}-${ctx.season}-${ctx.weather}-${ctx.time}-${ctx.habitat}`
  const pick = (d: Demo) => {
    playSfx('tap')
    setDemo(d)
    setNonce((n) => n + 1)
  }
  const studioOnly = (what: string) => () => setNote(`„${what}“ ist im Studio abgeschaltet.`)

  return (
    <div className="space-y-4">
      <Panel variant="glass" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[17px] font-semibold text-forest-900">Spielbrett-Vorschau</h3>
          <span className="text-[12px] font-semibold text-forest-800/70">
            speichert nichts · echter Spielstand bleibt unberührt
          </span>
        </div>

        <Row label="Spielstand">
          {DEMOS.map((d) => (
            <GameButton
              key={d.id}
              size="sm"
              variant={d.id === 'leer' ? 'secondary' : demo === d.id ? 'accent' : 'secondary'}
              onClick={() => pick(d.id)}
            >
              {d.label}
            </GameButton>
          ))}
        </Row>

        <Row label="Feier testen">
          <GameButton
            size="sm"
            variant="berry"
            onClick={() => {
              playSfx('bingo')
              setParty('bingo')
            }}
          >
            BINGO!
          </GameButton>
          <GameButton
            size="sm"
            variant="berry"
            onClick={() => {
              playSfx('full')
              setParty('full')
            }}
          >
            Waldmeister!
          </GameButton>
        </Row>

        <Row label="Foto-Prüfung (Fliegenpilz)">
          {PHOTO_DEMOS.map((d) => (
            <Chip key={d.id} on={photo === d.id} onClick={() => setPhoto(d.id)}>
              {d.label}
            </Chip>
          ))}
        </Row>

        <Row label="Spieler">
          {PLAYER_OPTIONS.map((n) => (
            <Chip
              key={n}
              on={players === n && !shared}
              onClick={() => {
                setShared(false)
                setPlayers(n)
              }}
            >
              {n}
            </Chip>
          ))}
          <Chip on={shared} onClick={() => setShared((s) => !s)}>
            geteiltes Spiel
          </Chip>
        </Row>

        <Row label="Lebensraum">
          {HABITATS.map((h) => (
            <Chip key={h} on={habitat === h} onClick={() => setHabitat(h)}>
              {HABITAT_LABEL[h]}
            </Chip>
          ))}
        </Row>

        <Row label="Klänge">
          {SOUNDS.map((s) => (
            <Chip key={s} on={false} onClick={() => playSfx(s)}>
              {s}
            </Chip>
          ))}
        </Row>
        {note && <p className="text-[12.5px] font-semibold text-forest-800">{note}</p>}
      </Panel>

      <GameView
        key={remountKey}
        game={game}
        persist={false}
        onExit={studioOnly('Neues Spiel')}
        onPrint={(withInfo) => studioOnly(withInfo ? 'Info-Seite' : 'Drucken')()}
        onInvite={studioOnly('Einladen')}
      />

      {photo && (
        <PhotoVerifyView
          key={photo}
          photoUrl={openMojiSrc(photo === 'anderes' ? '🌼' : '🍄') ?? ''}
          target={photoTarget}
          state={photoState(photo, photoTarget.kategorie)}
          offline={photo === 'offline'}
          lineVariant={0}
          season={scene.season}
          weather={scene.weather}
          night={scene.time === 'nacht' || scene.time === 'daemmerung'}
          onConfirm={() => {
            setPhoto(null)
            studioOnly('Abhaken')()
          }}
          onRetry={() => {
            setPhoto(null)
            studioOnly('Neues Foto')()
          }}
          onCancel={() => setPhoto(null)}
        />
      )}

      {party && (
        <Celebration
          kind={party}
          line={wingoLine(party, { season: scene.season, weather: scene.weather, time: scene.time })}
          season={scene.season}
          weather={scene.weather}
          night={scene.time === 'nacht' || scene.time === 'daemmerung'}
          found={party === 'full' ? 25 : 10}
          lines={party === 'full' ? 12 : 1}
          onClose={() => setParty(null)}
        />
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-forest-800/70">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-full border px-3 py-1 text-[13px] font-semibold ${
        on ? 'border-forest-700 bg-forest-600 text-white' : 'border-white/70 bg-white/70 text-forest-900'
      }`}
    >
      {children}
    </button>
  )
}
