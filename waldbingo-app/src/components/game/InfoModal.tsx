import { useEffect } from 'react'
import type { WaldObjekt } from '../../data/types'
import { catColor } from '../../lib/categories'
import { Glyph } from '../Svg'
import { MediaView } from './MediaView'

interface Props {
  o: WaldObjekt
  found: boolean
  onToggleFound: () => void
  onClose: () => void
}

export function InfoModal({ o, found, onToggleFound, onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const col = catColor(o.kategorie)
  const m = o._media
  const mediaCredit =
    m && m.source
      ? `${m.attribution ? m.attribution + ' · ' : ''}${m.source}${m.license ? ' (' + m.license + ')' : ''}`
      : null

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,33,25,0.5)] p-[18px] backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="anim-rise relative w-full max-w-[430px] rounded-xl bg-white p-6 pt-[26px] shadow-wb3">
        <button
          type="button"
          aria-label="Schließen"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-line-2 text-[18px] leading-none text-muted hover:bg-line"
        >
          ✕
        </button>

        <div
          className="mx-auto mb-1 grid h-24 w-24 place-items-center overflow-hidden rounded-2xl"
          style={{ background: col + '22' }}
        >
          <MediaView o={o} variant="hero" />
        </div>
        <h3 className="mb-1.5 mt-2 text-center text-[23px] font-extrabold text-forest-900">{o.name}</h3>
        <span
          className="mx-auto mb-4 block w-fit rounded-full px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-wide text-white"
          style={{ background: col }}
        >
          {o.kategorie}
          {o._live ? ' · regional' : ''}
        </span>

        <InfoBlock glyph="info" title="Was ist das?" value={o.info.kurz} />
        <InfoBlock glyph="weather" title="Woran erkenne ich es?" value={o.info.erkennen} />
        <InfoBlock glyph="sparkle" title="Wusstest du?" value={o.info.wusstest_du} />

        {mediaCredit && (
          <p className="mt-3 text-[11px] leading-snug text-muted">Bild: {mediaCredit}</p>
        )}

        <button
          type="button"
          onClick={onToggleFound}
          className="focus-ring mt-[18px] flex w-full items-center justify-center gap-2.5 rounded bg-gradient-to-br from-forest-600 to-forest-700 px-5 py-3.5 text-[16px] font-bold text-white shadow-wb1"
        >
          <Glyph name="check" className="block h-5 w-5" />
          {found ? 'Als nicht gefunden markieren' : 'Gefunden!'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-2 w-full rounded border-[1.5px] border-line px-5 py-3 font-bold text-forest-700 hover:bg-line-2"
        >
          Schließen
        </button>
      </div>
    </div>
  )
}

function InfoBlock({ glyph, title, value }: { glyph: string; title: string; value: string }) {
  return (
    <div className="my-3 flex items-start gap-2.5">
      <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-forest-100 text-forest-600">
        <Glyph name={glyph} className="block h-[17px] w-[17px]" />
      </div>
      <div>
        <div className="text-[11.5px] font-extrabold uppercase tracking-wide text-amber-600">{title}</div>
        <div className="mt-0.5 text-[14.5px] text-ink">{value}</div>
      </div>
    </div>
  )
}
