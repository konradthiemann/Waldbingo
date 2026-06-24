import type { WaldObjekt } from '../../data/types'
import { openMojiSrc } from '../../lib/emoji'
import { WB_HAS_ICON } from '../../icons/pictograms'
import { Pictogram } from '../Svg'

interface Props {
  o: WaldObjekt
  /** 'cell' = im Bingo-Raster, 'hero' = groß im Info-Modal. */
  variant?: 'cell' | 'hero'
}

/**
 * Visueller Schwierigkeits-Gradient pro Objekt:
 *  - Live-Foto/Illustration → Bild (Illustration ggf. "gemalt" gefiltert)
 *  - sonst → Piktogramm (oder Emoji-Fallback)
 */
export function MediaView({ o, variant = 'cell' }: Props) {
  const m = o._media
  const rounded = variant === 'hero' ? 'rounded-2xl' : 'rounded-lg'

  // Echtes Foto (mittel & schwer)
  if (m?.url) {
    return (
      <img
        src={m.url}
        alt={o.name}
        loading="lazy"
        draggable={false}
        className={`h-full w-full object-cover ${rounded}`}
      />
    )
  }

  // Leichter Modus / Fallback: detailliertes OpenMoji-Symbol
  const om = openMojiSrc(o.emoji)
  if (om) {
    return (
      <img
        src={om}
        alt={o.name}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-contain"
      />
    )
  }

  // Fallback: kuratiertes Vektor-Piktogramm, sonst Emoji-Zeichen
  if (WB_HAS_ICON(o.iconId)) {
    return <Pictogram iconId={o.iconId} className="grid h-full w-full place-items-center" />
  }
  return (
    <span className={variant === 'hero' ? 'text-5xl' : 'text-3xl'} aria-hidden="true">
      {o.emoji}
    </span>
  )
}
