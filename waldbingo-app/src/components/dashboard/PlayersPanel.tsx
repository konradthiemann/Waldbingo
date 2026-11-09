import { playSfx } from '../../lib/sfx'
import { PlayerAvatar, playerName } from '../characters/Friends'
import { IconButton, Panel } from '../ui'

interface Props {
  players: number
  onPlayers: (n: number) => void
}

const MIN = 1
const MAX = 10

/** „Wer spielt mit?“ – Stepper mit Avatar-Vorschau (jeder bekommt einen Waldfreund). */
export function PlayersPanel({ players, onPlayers }: Props) {
  const set = (n: number) => {
    const v = Math.max(MIN, Math.min(MAX, n))
    if (v === players) return
    playSfx('tap')
    onPlayers(v)
  }
  return (
    <Panel as="section" sign="Wer spielt mit?">
      <div className="flex items-center justify-center gap-5">
        <IconButton label="Weniger Spieler" size={52} onClick={() => set(players - 1)} disabled={players <= MIN} className="disabled:opacity-40">
          <span className="font-display text-[30px] font-semibold leading-none">−</span>
        </IconButton>
        <div className="min-w-[92px] text-center" aria-live="polite">
          <div className="font-display text-[40px] font-semibold leading-none text-forest-900 tabular-nums">{players}</div>
          <div className="mt-1 text-[12.5px] font-bold uppercase tracking-wide text-muted">
            {players === 1 ? 'Spieler' : 'Spieler'}
          </div>
        </div>
        <IconButton label="Mehr Spieler" size={52} onClick={() => set(players + 1)} disabled={players >= MAX} className="disabled:opacity-40">
          <span className="font-display text-[30px] font-semibold leading-none">+</span>
        </IconButton>
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-2.5" aria-label="Spieler-Figuren">
        {Array.from({ length: players }, (_, i) => (
          <li key={i} className="anim-pop-in flex w-[58px] flex-col items-center">
            <PlayerAvatar index={i} size={46} active={i === 0} />
            <span className="mt-1 max-w-full truncate font-display text-[12px] font-medium text-forest-800">
              {playerName(i)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[12.5px] leading-snug text-muted">
        {players === 1
          ? 'Allein auf Entdeckungstour – oder mehr Spieler für eigene Karten.'
          : 'Jeder bekommt eine eigene Karte – auf einem Handy oder per Einladung.'}
      </p>
    </Panel>
  )
}
