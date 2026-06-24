import { useEffect, useState } from 'react'
import { updateFound } from '../../lib/db'
import type { GameState } from '../../lib/game-state'
import { checkBingo } from '../../lib/generator'
import { HABITAT_LABEL, SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { Glyph } from '../Svg'
import { Cell } from './Cell'
import { InfoModal } from './InfoModal'
import { PlayerTabs } from './PlayerTabs'
import { ProgressBar } from './ProgressBar'

interface Props {
  game: GameState
  onExit: () => void
  onPrint: (withInfo: boolean) => void
}

export function GameView({ game, onExit, onPrint }: Props) {
  const [found, setFound] = useState<Set<number>[]>(game.found)
  const [activePlayer, setActivePlayer] = useState(game.activePlayer)
  const [modalIdx, setModalIdx] = useState<number | null>(null)

  // Spielstand bei jeder Änderung offline persistieren.
  useEffect(() => {
    void updateFound(
      found.map((s) => [...s]),
      activePlayer,
    )
  }, [found, activePlayer])

  const card = game.cards[activePlayer]
  const playerFound = found[activePlayer]

  const toggle = (idx: number) => {
    setFound((prev) => {
      const next = prev.map((s) => new Set(s))
      const s = next[activePlayer]
      if (s.has(idx)) s.delete(idx)
      else s.add(idx)
      return next
    })
  }

  const bingo = checkBingo(playerFound)
  const { ctx } = game
  const pills: Array<{ glyph: string; label: string }> = [
    { glyph: 'season', label: SEASON_LABEL[ctx.season] },
    { glyph: 'weather', label: ctx.weather ? WEATHER_LABEL[ctx.weather] : '–' },
    { glyph: 'clock', label: TIME_LABEL[ctx.time] },
    { glyph: 'habitat', label: HABITAT_LABEL[ctx.habitat] },
  ]
  const fotoCount = game.pool.filter((o) => o._media?.url).length

  return (
    <section className="mb-[18px] rounded-xl border border-line bg-white p-3 shadow-wb2 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {pills.map((p, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-[7px] rounded-full border border-[#cfe6d6] bg-forest-100 px-3 py-[7px] text-[13px] font-semibold text-forest-900"
          >
            <Glyph name={p.glyph} className="block h-[15px] w-[15px] text-forest-600" />
            <b>{p.label}</b>
          </span>
        ))}
        <span
          className="inline-flex items-center gap-[7px] rounded-full border border-[#cfe6d6] bg-forest-100 px-3 py-[7px] text-[13px] font-semibold text-forest-900"
          title="Felder mit echtem Artenfoto (regionale Live-Arten)"
        >
          {fotoCount > 0 ? `📷 ${fotoCount} Foto-Arten` : '🎨 generische Karte'}
        </span>
        <span className="ml-auto inline-flex items-center gap-[7px] rounded-full border border-line bg-white px-3 py-[7px] font-mono text-[13px] font-semibold text-muted">
          <Glyph name="seed" className="block h-[15px] w-[15px]" />
          {game.seedStr}
        </span>
      </div>

      <PlayerTabs count={game.cards.length} active={activePlayer} onSelect={setActivePlayer} />

      <div className="mx-auto grid max-w-[680px] grid-cols-5 gap-1 sm:gap-2">
        {card.map((o, idx) => (
          <Cell
            key={idx}
            o={o}
            found={playerFound.has(idx)}
            onToggle={() => toggle(idx)}
            onInfo={() => setModalIdx(idx)}
          />
        ))}
      </div>

      <ProgressBar found={playerFound.size} total={25} bingo={bingo} />

      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-center text-[12.5px] text-muted">
        Tippe ein Feld an, wenn du es gefunden hast –
        <Glyph name="info" className="inline-block h-[15px] w-[15px] text-forest-500" />
        öffnet mehr Infos.
      </div>

      <div className="no-print mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onPrint(false)}
          className="focus-ring inline-flex items-center gap-2.5 rounded border-[1.5px] border-forest-300 bg-white px-5 py-3.5 font-bold text-forest-700 hover:bg-forest-100"
        >
          <Glyph name="printer" className="block h-[19px] w-[19px] text-forest-600" />
          Drucken / als PDF
        </button>
        <button
          type="button"
          onClick={() => onPrint(true)}
          className="focus-ring inline-flex items-center gap-2.5 rounded border-[1.5px] border-forest-300 bg-white px-5 py-3.5 font-bold text-forest-700 hover:bg-forest-100"
        >
          <Glyph name="doc" className="block h-[19px] w-[19px] text-forest-600" />
          Info-Begleitseite
        </button>
        <button
          type="button"
          onClick={onExit}
          className="focus-ring inline-flex items-center gap-2.5 rounded border-[1.5px] border-line bg-transparent px-5 py-3.5 font-bold text-forest-700 hover:bg-line-2"
        >
          <Glyph name="back" className="block h-[19px] w-[19px]" />
          Neues Spiel
        </button>
      </div>

      {modalIdx !== null && (
        <InfoModal
          o={card[modalIdx]}
          found={playerFound.has(modalIdx)}
          onToggleFound={() => {
            toggle(modalIdx)
            setModalIdx(null)
          }}
          onClose={() => setModalIdx(null)}
        />
      )}
    </section>
  )
}
