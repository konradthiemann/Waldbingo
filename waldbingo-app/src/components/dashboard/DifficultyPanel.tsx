import { playSfx } from '../../lib/sfx'
import { Friend, FRIENDS, type FriendId } from '../characters/Friends'
import { CheckIcon } from '../home/ShellIcons'
import { Panel } from '../ui'

interface Props {
  diff: number
  onDiff: (d: number) => void
}

interface DiffCard {
  d: number
  friend: FriendId
  label: string
  short: string
  hint: string
}

// Jede Schwierigkeit wird von einem Waldfreund „vertreten“ (Art Bible: Pilzi/Flitz/Fine).
const CARDS: DiffCard[] = [
  { d: 1, friend: 'pilzi', label: 'Leicht', short: 'Bilder', hint: 'Nur Bilder-Symbole – perfekt für kleine Forscher.' },
  { d: 2, friend: 'flitz', label: 'Mittel', short: 'Bilder & Fotos', hint: 'Bilder-Symbole und echte Fotos von Arten aus deiner Gegend.' },
  { d: 3, friend: 'fine', label: 'Experte', short: 'Echte Fotos', hint: 'Nur echte Fotos – Arten, die hier gerade vorkommen.' },
]

/** „Wie schwer?“ – drei Figuren-Karten (Pilzi, Flitz, Fine). */
export function DifficultyPanel({ diff, onDiff }: Props) {
  const current = CARDS.find((c) => c.d === diff) ?? CARDS[1]
  return (
    <Panel as="section" sign="Wie schwer?">
      <div role="radiogroup" aria-label="Schwierigkeit" className="grid grid-cols-3 gap-2 sm:gap-3">
        {CARDS.map((c) => {
          const active = c.d === diff
          const meta = FRIENDS[c.friend]
          return (
            <button
              key={c.d}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${c.label} mit ${meta.name}: ${c.short}`}
              onClick={() => {
                playSfx('tap')
                onDiff(c.d)
              }}
              className={`focus-ring relative flex flex-col items-center overflow-hidden rounded-[22px] border-2 px-1 pb-2.5 pt-2 transition-[transform,box-shadow,background-color] duration-200 ease-spring active:translate-y-px ${
                active
                  ? '-translate-y-1 border-sun-dark bg-gradient-to-b from-[#fff6d6] to-sun-light shadow-[0_4px_0_#d9a21f,0_10px_18px_rgba(15,38,23,.18)]'
                  : 'border-cream-line bg-white shadow-[0_4px_0_#ead8b8,0_8px_14px_rgba(15,38,23,.08)] hover:-translate-y-px'
              }`}
            >
              {/* Lichtkreis hinter der Figur */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-2 h-[66px] w-[66px] -translate-x-1/2 rounded-full"
                style={{ background: `radial-gradient(closest-side, ${meta.color}33, transparent)` }}
              />
              <Friend
                id={c.friend}
                size={70}
                mood={active ? 'happy' : 'idle'}
                animated={active}
                title=""
                className={`relative transition-transform duration-300 ease-spring ${active ? 'scale-[1.06]' : 'scale-100'}`}
              />
              <span className="relative mt-1 font-display text-[16px] font-semibold leading-tight text-forest-900">
                {c.label}
              </span>
              <span className="relative text-[11.5px] font-semibold leading-tight text-muted">{meta.name}</span>
              <span
                className={`relative mt-1.5 rounded-full px-2 py-0.5 text-center text-[11px] font-bold leading-tight ${
                  active ? 'bg-white/80 text-wood-lip' : 'bg-cream-2 text-forest-800'
                }`}
              >
                {c.short}
              </span>
              {active && (
                <span className="anim-pop absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-forest-500 text-white shadow-[0_2px_0_#1f5b38]">
                  <CheckIcon size={14} />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[13px] leading-snug text-muted">{current.hint}</p>
    </Panel>
  )
}
