import type { WaldObjekt } from '../../data/types'
import { Glyph } from '../Svg'
import { MediaView } from './MediaView'

interface Props {
  o: WaldObjekt
  found: boolean
  onToggle: () => void
  onInfo: () => void
}

export function Cell({ o, found, onToggle, onInfo }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={found}
      aria-label={o.name + (found ? ' – gefunden' : '')}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={`focus-ring relative flex cursor-pointer select-none flex-col overflow-hidden rounded-lg border-[1.5px] shadow-wb1 transition ${
        found
          ? 'border-ok-line bg-ok-bg'
          : 'border-line bg-white hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-wb2'
      }`}
    >
      {/* Bildbereich: volle Kachelbreite, randbündig → größtmögliches Motiv */}
      <div className={`relative aspect-square w-full ${found ? 'anim-pop' : ''}`}>
        <MediaView o={o} />

        <button
          type="button"
          aria-label={`Mehr Infos zu ${o.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onInfo()
          }}
          className="focus-ring absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/85 text-muted shadow-sm backdrop-blur-sm hover:bg-forest-100 hover:text-forest-700"
        >
          <Glyph name="info" className="block h-3.5 w-3.5" />
        </button>

        {found && (
          <span className="anim-pop absolute left-1 top-1 grid h-[22px] w-[22px] place-items-center rounded-full bg-ok text-white shadow-wb1">
            <Glyph name="check" className="block h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Name: eigene Zeile unter dem Bild – kein Overlap */}
      <div
        className={`flex min-h-[2.2em] items-center justify-center border-t px-1 py-0.5 ${
          found ? 'border-ok-line/60 bg-ok-bg' : 'border-line-2 bg-white'
        }`}
      >
        <span
          className={`line-clamp-2 text-center font-bold leading-tight ${found ? 'text-forest-800' : 'text-ink'}`}
          style={{ fontSize: 'clamp(10px,2.7vw,13px)' }}
        >
          {o.name}
        </span>
      </div>
    </div>
  )
}
