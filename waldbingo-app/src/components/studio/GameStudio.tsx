// Studio-Abschnitt „Spielbrett“: Live-Vorschau mit echtem GameView (ohne
// Speichern!) und Knöpfen für typische Spielstände, Feiern und Klänge.
// Deep-Links für die visuelle QA: ?studio=spiel&demo=fast|bingo|voll&party=bingo|full&players=4&shared=1
import { type ReactNode, useMemo, useState } from 'react'
import { OBJEKTE } from '../../data/objects'
import type { Habitat, SpielKontext } from '../../data/types'
import type { GameState } from '../../lib/game-state'
import { createGame } from '../../lib/generator'
import { HABITAT_LABEL } from '../../lib/labels'
import type { SceneInput } from '../../lib/scene'
import { playSfx, type SfxName } from '../../lib/sfx'
import { wingoLine } from '../../lib/wingo-lines'
import { Celebration, type CelebrationKind } from '../fx'
import { GameView } from '../game/GameView'
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
