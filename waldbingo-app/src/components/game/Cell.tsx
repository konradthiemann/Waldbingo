// Eine Bingo-Kachel: Creme-Papier mit Bild + Name. Gefunden → Moos-Grün mit
// Stempel (Bild bleibt erkennbar), goldener Rahmen in einer Bingo-Linie,
// sanftes Leuchten, wenn sie eine Linie vervollständigen würde.
import { memo } from 'react'
import type { Jahreszeit, WaldObjekt } from '../../data/types'
import { LeafBurst } from '../fx'
import { CheckIcon, InfoIcon } from './icons'
import { MediaView } from './MediaView'
import { nameFit, tileName } from './tile-name'

interface Props {
  o: WaldObjekt
  /** Feld-Index 0 … 24 (für Messung der Bingo-Linien und die Handler). */
  idx: number
  found: boolean
  /** Teil einer kompletten Bingo-Linie. */
  golden?: boolean
  /** Würde eine 4/5-Linie vervollständigen. */
  hot?: boolean
  /** > 0: gerade gefunden → Kipp-/Stempel-Animation + Blätter-Burst (Wert = Auslöser-Nr.). */
  pop?: number
  season?: Jahreszeit
  hasCamera: boolean
  /**
   * Touch-Gerät mit Kamera: Infos kommen über die Wahl („Mehr erfahren“) bzw.
   * Tippen auf ein gefundenes Feld. Das (i) ist dann nur Deko – als Tippziel
   * wäre es auf schmalen Handys zu klein (< 44 px) oder würde die Kachel verdecken.
   */
  infoViaTap?: boolean
  onToggle: (idx: number) => void
  onPhoto: (idx: number) => void
  onInfo: (idx: number) => void
}

function CellImpl({
  o,
  idx,
  found,
  golden,
  hot,
  pop = 0,
  season,
  hasCamera,
  infoViaTap = false,
  onToggle,
  onPhoto,
  onInfo,
}: Props) {
  const handleClick = () => {
    if (found) {
      if (infoViaTap) onInfo(idx)
      else onToggle(idx)
      return
    }
    if (hasCamera) {
      onPhoto(idx)
    } else {
      onToggle(idx)
    }
  }

  const popping = pop > 0 && found
  const name = tileName(o.name)
  const fit = nameFit(o.name)
  const frame = golden
    ? 'border-sun-dark bg-gradient-to-b from-[#fff4c9] to-[#ffe08a] shadow-[0_0_0_2px_#f3c44d,0_0_14px_rgba(255,214,92,.75),0_3px_0_rgba(150,100,20,.35)]'
    : found
      ? 'border-moss-dark bg-moss-light shadow-[0_1.5px_0_rgba(255,255,255,.7)_inset,0_3px_0_#3f9a70,0_5px_10px_rgba(15,38,23,.14)]'
      : `border-cream-line bg-cream shadow-tile ${hot ? 'gb-hot ring-2 ring-sun' : ''}`

  return (
    <div data-cell={idx} className={`relative z-[1] ${popping ? '!z-20' : ''}`}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={found}
        aria-label={o.name + (found ? ' – gefunden' : '') + (golden ? ' (Bingo-Reihe)' : '')}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleClick()
          }
        }}
        className={`gb-tile focus-ring relative flex h-full cursor-pointer select-none flex-col rounded-[13px] border-2 p-[2px] sm:rounded-[16px] sm:p-1 lg:aspect-[0.85] ${frame} ${
          popping ? 'gb-flip' : ''
        }`}
      >
        {/* Bildbereich – bleibt auch gefunden gut erkennbar. Desktop: ca. 62 % der
            Kachelhöhe, damit das ganze Brett in die Fensterhöhe passt. */}
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-[9px] sm:rounded-[12px] lg:aspect-auto lg:h-[62%] lg:flex-none ${
            golden ? 'bg-[#fffaf0]' : found ? 'bg-[#f3fbf5]' : 'bg-white'
          }`}
        >
          <div className="grid h-full w-full place-items-center p-[3px] sm:p-1.5 [&>img[class*=object-cover]]:rounded-[6px]">
            <MediaView o={o} />
          </div>
        </div>

        {/* Name: Trennung nur an Wortfugen (weiches Trennzeichen), lange Wörter kleiner */}
        <div className="flex min-h-[30px] flex-1 items-center justify-center pb-[1px] pt-[3px] sm:min-h-[40px] lg:min-h-0">
          <span
            lang="de"
            className={`${fit.lines === 3 ? 'line-clamp-3 leading-[1.02]' : 'line-clamp-2 leading-[1.08]'} hyphens-manual break-words text-center font-extrabold tracking-[-0.01em] ${
              golden ? 'text-[#7a5410]' : found ? 'text-forest-800' : 'text-forest-900'
            }`}
            style={{
              fontSize: `clamp(${fit.min}px, ${(2.95 * fit.scale).toFixed(3)}vw, ${(14 * fit.scale).toFixed(2)}px)`,
            }}
          >
            {name}
          </span>
        </div>

        {/* Moos-Stempel mit Häkchen */}
        {found && (
          <span
            aria-hidden="true"
            className={`gb-stamp pointer-events-none absolute left-[-6px] top-[-7px] grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-white bg-moss-deep text-white shadow-[0_2px_0_rgba(20,60,40,.35),0_3px_8px_rgba(15,38,23,.25)] sm:h-[34px] sm:w-[34px] ${
              popping ? 'gb-stamp-in' : ''
            }`}
          >
            <span className="absolute inset-[2px] rounded-full border border-dashed border-white/55" />
            <CheckIcon size={16} className="relative sm:h-[21px] sm:w-[21px]" />
          </span>
        )}
      </div>

      {/* Info: Maus/ohne Kamera als Knopf, auf Touch mit Kamera nur Plakette */}
      {infoViaTap ? (
        <span aria-hidden="true" className="pointer-events-none absolute right-[5px] top-[5px] sm:right-2 sm:top-2">
          <InfoBadge />
        </span>
      ) : (
        <button
          type="button"
          aria-label={`Mehr Infos zu ${o.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onInfo(idx)
          }}
          className="focus-ring group absolute right-0 top-0 grid h-9 w-9 items-start justify-items-end rounded-full p-[5px] sm:h-10 sm:w-10 sm:p-2"
        >
          <InfoBadge hover />
        </button>
      )}

      {popping && <LeafBurst key={pop} season={season} seed={idx + pop} count={14} spread={58} />}
    </div>
  )
}

function InfoBadge({ hover = false }: { hover?: boolean }) {
  return (
    <span
      className={`grid h-[18px] w-[18px] place-items-center rounded-full border border-cream-line bg-cream/95 text-forest-600 shadow-[0_1px_0_rgba(110,68,38,.2)] sm:h-[22px] sm:w-[22px] ${
        hover ? 'transition group-hover:bg-white group-hover:text-forest-800' : ''
      }`}
    >
      <InfoIcon size={12} className="sm:h-[14px] sm:w-[14px]" />
    </span>
  )
}

/** Memoisiert: Kacheln rendern nur neu, wenn sich ihr eigener Zustand ändert. */
export const Cell = memo(CellImpl)
