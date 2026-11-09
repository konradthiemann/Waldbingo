// Foto/Manuell-Wahl: kleines Modal mit Wingo. Foto machen (Kamera +
// Erkennung) oder einfach abhaken – plus Abkürzung zu den Infos.
import type { Jahreszeit, WaldObjekt, Wetter } from '../../data/types'
import { catColor } from '../../lib/categories'
import { WingoSays } from '../characters/WingoSays'
import { GameButton, Modal } from '../ui'
import { CameraIcon, CheckIcon, InfoIcon } from './icons'
import { MediaView } from './MediaView'

interface Props {
  o: WaldObjekt
  season?: Jahreszeit
  weather?: Wetter | null
  night?: boolean
  /** Wingos Frage (z. B. `wingoLine('choose', …)`); Standard: allgemeine Frage. */
  line?: string
  onPhoto: () => void
  onManual: () => void
  onInfo: () => void
  onClose: () => void
}

export function ChooseModal({ o, season, weather, night, line, onPhoto, onManual, onInfo, onClose }: Props) {
  const col = catColor(o.kategorie)
  return (
    <Modal onClose={onClose} label={`${o.name} abhaken`} size="sm">
      <div className="flex items-center gap-3 pr-8">
        <div
          className="grid h-[68px] w-[68px] flex-none place-items-center overflow-hidden rounded-[18px] border-[3px] bg-white p-1 shadow-tile"
          style={{ borderColor: col }}
        >
          <MediaView o={o} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[22px] font-semibold leading-tight text-forest-900">{o.name}</h3>
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 font-display text-[11.5px] font-semibold uppercase tracking-wide text-white"
            style={{ background: col }}
          >
            {o.kategorie}
          </span>
        </div>
      </div>

      <WingoSays mood="think" size={84} season={season} weather={weather} night={night} className="mt-3">
        {line ?? 'Hast du es entdeckt? Zeig es mir mit einem Foto – oder hak es einfach ab!'}
      </WingoSays>

      <div className="mt-4 flex flex-col gap-2.5">
        <GameButton variant="primary" size="lg" block icon={<CameraIcon size={24} />} onClick={onPhoto}>
          Foto machen
        </GameButton>
        <GameButton variant="accent" size="lg" block icon={<CheckIcon size={22} />} onClick={onManual}>
          Einfach abhaken
        </GameButton>
        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onInfo}
            className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 font-display text-[15px] font-medium text-forest-700 hover:bg-cream-2"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-100 text-forest-600">
              <InfoIcon size={14} />
            </span>
            Mehr erfahren
          </button>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring min-h-[44px] rounded-full px-4 font-display text-[15px] font-medium text-muted hover:bg-cream-2 hover:text-forest-800"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </Modal>
  )
}
