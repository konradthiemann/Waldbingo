import type { Jahreszeit, Tageszeit, Wetter } from '../../data/types'
import { wingoLine } from '../../lib/wingo-lines'
import { Wingo } from '../characters/Wingo'
import { Modal } from '../ui'

interface Props {
  status: string | null
  season: Jahreszeit
  weather: Wetter | null
  time: Tageszeit
}

/** Ladebildschirm „Karte wird erstellt“: Wingo schnuppert, Statuszeile darunter. */
export function CreatingOverlay({ status, season, weather, time }: Props) {
  const night = time === 'nacht' || time === 'daemmerung'
  return (
    <Modal onClose={() => undefined} closable={false} closeOnBackdrop={false} size="sm" label="Karte wird erstellt" z={60}>
      <div className="flex flex-col items-center pb-1 pt-2 text-center">
        <Wingo mood="think" size={150} season={season} weather={weather} night={night} title="" />
        <h2 className="mt-2 text-[22px] font-semibold text-forest-900">Wingo schnuppert…</h2>
        <p className="mt-1 font-display text-[15.5px] leading-snug text-forest-800">
          {wingoLine('creating', { season, weather, time })}
        </p>
        <div className="mt-4 flex items-end gap-2" aria-hidden="true">
          {[0, 160, 320].map((d) => (
            <svg
              key={d}
              viewBox="0 0 24 24"
              width={22}
              height={22}
              className="wb-leaf-dot"
              style={{ ['--d' as string]: `${d}ms` }}
            >
              <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill="#5fb87c" stroke="#1f5b38" strokeWidth={2} strokeLinejoin="round" />
              <path d="M6 18L15 9" stroke="#1f5b38" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          ))}
        </div>
        <p role="status" className="mt-3 min-h-[2.6em] text-[13px] leading-snug text-muted">
          {status ?? 'Einen Moment…'}
        </p>
      </div>
    </Modal>
  )
}
