// Spieler-Tabs: Jede Spielerin bekommt einen Waldfreund als Avatar.
// Aktiver Tab = Papier-Plakette mit Ring, andere = Milchglas. Bei vielen
// Spielern seitlich wischbar. Im wischbaren Modus (Handy) ohne backdrop-blur,
// damit das Wischen auf schwächeren Geräten flüssig bleibt.
import { PlayerAvatar, playerName } from '../characters/Friends'
import { SparkleIcon } from './icons'

interface Props {
  count: number
  active: number
  onSelect: (i: number) => void
  /** Gefundene Felder je Spieler (optional, zeigt Mini-Zähler). */
  counts?: number[]
  /** Hat der Spieler schon ein Bingo? (optional, zeigt Glitzer). */
  bingos?: boolean[]
  className?: string
}

export function PlayerTabs({ count, active, onSelect, counts, bingos, className = '' }: Props) {
  if (count < 2) return null
  return (
    <div
      role="tablist"
      aria-label="Spieler wählen"
      className={`no-print gb-scroll-x -mx-3 flex snap-x scroll-px-3 gap-2 overflow-x-auto px-3 py-1.5 sm:mx-0 sm:scroll-px-0 sm:flex-wrap sm:overflow-visible sm:px-0 ${className}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const on = i === active
        const name = playerName(i)
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={`${name} (Spieler ${i + 1})${counts ? `, ${counts[i]} gefunden` : ''}`}
            onClick={() => onSelect(i)}
            className={`focus-ring relative flex min-h-[48px] flex-none snap-start items-center gap-2 rounded-full py-1 pl-1 pr-3.5 font-display transition-[transform,background-color,box-shadow] duration-200 ease-spring ${
              on
                ? 'scale-100 border-2 border-cream-line bg-cream text-forest-900 shadow-[0_3px_0_#d9c39d,0_8px_16px_rgba(15,38,23,.18)]'
                : 'wb-glass-strong scale-[.96] border-2 border-white/60 text-forest-900 shadow-wb1 hover:bg-white/85 sm:backdrop-blur-md'
            }`}
          >
            <PlayerAvatar index={i} size={on ? 38 : 34} active={on} />
            <span className="flex flex-col items-start leading-none">
              <span className={`text-[15px] ${on ? 'font-semibold' : 'font-medium'}`}>{name}</span>
              {/* Spielernummer sichtbar: Papierkarten heißen „Spieler N“. */}
              <span className={`mt-0.5 whitespace-nowrap text-[11.5px] font-medium ${on ? 'text-forest-700' : 'text-forest-800'}`}>
                Sp. {i + 1}
                {counts && ` · ${counts[i]}/25`}
              </span>
            </span>
            {bingos?.[i] && (
              <span className="absolute -right-0.5 -top-1 text-sun-dark" aria-hidden="true">
                <SparkleIcon size={15} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Feste Spieler-Plakette bei geteilten Spielen (Gerät = ein Spieler). */
export function SelfPlayerBadge({ index, players }: { index: number; players: number }) {
  return (
    <div className="no-print inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-cream-line bg-cream py-1 pl-1 pr-4 font-display text-forest-900 shadow-[0_3px_0_#d9c39d,0_8px_16px_rgba(15,38,23,.18)]">
      <PlayerAvatar index={index} size={38} active />
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold">Du spielst als {playerName(index)}</span>
        <span className="block text-[12px] font-medium text-forest-600">
          Spieler {index + 1} von {players}
        </span>
      </span>
    </div>
  )
}
