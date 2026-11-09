import { useEffect, useState } from 'react'
import type { WaldObjekt } from '../../data/types'
import { openMojiSrc } from '../../lib/emoji'
import { WB_HAS_ICON } from '../../icons/pictograms'
import { Pictogram } from '../Svg'
import { TILE_ART } from './tile-art'

interface Props {
  o: WaldObjekt
  /** 'cell' = im Bingo-Raster, 'hero' = groß im Info-Modal. */
  variant?: 'cell' | 'hero'
}

/**
 * Visueller Schwierigkeits-Gradient pro Objekt:
 *  - Live-Foto/Illustration → Bild (Illustration ggf. "gemalt" gefiltert)
 *  - eigenes Kachelbild im Wingo-Stil (TILE_ART), wo OpenMoji mehrdeutig ist
 *  - sonst → OpenMoji (Konturen warm statt Schwarz), Piktogramm oder Emoji
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

  // Eigenes Kachelbild (eindeutig, im Spielstil)
  const Art = TILE_ART[o.id]
  if (Art) {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={o.name} className="block h-full w-full">
        <Art />
      </svg>
    )
  }

  // Leichter Modus / Fallback: detailliertes OpenMoji-Symbol
  const om = openMojiSrc(o.emoji)
  if (om) {
    return <OpenMojiImg src={om} alt={o.name} />
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

// ── OpenMoji mit warmer Kontur ──────────────────────────────────────────────
// Die Bibel will nie schwarze Konturen. OpenMoji zeichnet seine Linien in
// #000000 – wir laden das (vorgecachte, gebündelte) SVG einmal, färben Schwarz in
// ein tiefes Waldbraun um und zeigen es als data-URL. Die Originaldateien in
// public/emoji bleiben unverändert; klappt das Laden nicht, bleibt das Original.

const INK = '#3b2a1e'
const inked = new Map<string, Promise<string | null>>()
/** Bereits umgefärbte Bilder (synchron lesbar → kein Umspringen, auch im Druck). */
const ready = new Map<string, string>()

function recolor(svg: string): string {
  return svg.replace(/(stroke|fill)="#000(000)?"/gi, `$1="${INK}"`)
}

function loadInked(src: string): Promise<string | null> {
  let p = inked.get(src)
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(recolor(text))}`
        ready.set(src, url)
        return url
      })
      .catch(() => null)
    inked.set(src, p)
  }
  return p
}

function OpenMojiImg({ src, alt }: { src: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(() => ready.get(src) ?? null)
  useEffect(() => {
    if (typeof fetch === 'undefined') return
    let alive = true
    void loadInked(src).then((u) => {
      if (alive && u) setUrl(u)
    })
    return () => {
      alive = false
    }
  }, [src])
  // Bis zur Umfärbung (nur beim allerersten Laden) das Original zeigen –
  // so fehlt nie ein Bild, auch nicht in der Druckansicht.
  return <img src={url ?? src} alt={alt} draggable={false} className="h-full w-full object-contain" />
}
