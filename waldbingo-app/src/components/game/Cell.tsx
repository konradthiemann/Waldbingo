import { useState } from 'react'
import type { WaldObjekt } from '../../data/types'
import { Glyph } from '../Svg'
import { MediaView } from './MediaView'

interface Props {
  o: WaldObjekt
  found: boolean
  hasCamera: boolean
  onToggle: () => void
  onPhoto: () => void
  onInfo: () => void
}

export function Cell({ o, found, hasCamera, onToggle, onPhoto, onInfo }: Props) {
  const [showActions, setShowActions] = useState(false)

  const handleClick = () => {
    if (found) {
      // Bereits gefunden: direkt wieder entfernen
      onToggle()
      return
    }
    if (hasCamera) {
      // Kamera verfuegbar: Aktions-Auswahl zeigen
      setShowActions(true)
    } else {
      // Keine Kamera: direkt abhaken
      onToggle()
    }
  }

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={found}
        aria-label={o.name + (found ? ' – gefunden' : '')}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleClick()
          }
        }}
        className={`focus-ring relative flex cursor-pointer select-none flex-col overflow-hidden rounded-lg border-[1.5px] shadow-wb1 transition ${
          found
            ? 'border-ok-line bg-ok-bg'
            : 'border-line bg-white hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-wb2'
        }`}
      >
        {/* Bildbereich: volle Kachelbreite, randbündig */}
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

        {/* Name: eigene Zeile unter dem Bild */}
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

      {/* Aktions-Popup: Foto oder Manuell */}
      {showActions && !found && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowActions(false)}
          />
          <div className="anim-pop absolute inset-x-0 bottom-full z-50 mb-1 flex flex-col gap-1 rounded-lg border border-line bg-white p-1.5 shadow-wb2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(false)
                onPhoto()
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-bold text-forest-700 hover:bg-forest-100"
            >
              <span className="text-[14px]">📷</span>
              Foto
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(false)
                onToggle()
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-bold text-forest-700 hover:bg-forest-100"
            >
              <Glyph name="check" className="block h-3.5 w-3.5 text-ok" />
              Manuell
            </button>
          </div>
        </>
      )}
    </div>
  )
}
