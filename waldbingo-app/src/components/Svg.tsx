import { WB_ICON, WB_UI } from '../icons/pictograms'

/** Rendert eine UI-Glyphe (Wetter, Pin, Würfel …) als Inline-SVG. */
export function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: WB_UI(name, 'ui-ic') }}
    />
  )
}

/** Rendert ein Objekt-Piktogramm als Inline-SVG. */
export function Pictogram({ iconId, className }: { iconId: string; className?: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: WB_ICON(iconId, 'pico') }}
    />
  )
}
