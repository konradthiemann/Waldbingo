// Goldene Bingo-Linien. Misst die echten Kachel-Positionen (data-cell), damit
// Linien bei jeder Breite exakt sitzen.
//
// Zwei Ebenen, damit Bilder und Namen nie durchgestrichen sind:
//  - dauerhaft HINTER den Kacheln: ein goldenes Band, das nur in den Fugen
//    zwischen den Kacheln leuchtet („Kette“ golden verbundener Felder),
//  - kurz ÜBER den Kacheln: eine neue Linie zieht sich einmal golden über die
//    Reihe und blendet dann aus (Basis-Stil unsichtbar → bei „Bewegung
//    reduzieren“ bleibt nur die ruhige Ebene).
// Bei voller Karte zeigt das Brett keine Einzellinien (siehe GameView).
import { type RefObject, useEffect, useState } from 'react'
import type { BingoLine } from '../../lib/bingo-lines'

interface Props {
  gridRef: RefObject<HTMLDivElement>
  lines: BingoLine[]
  /** Linien-IDs, die gerade neu sind (werden einmal „gezeichnet“). */
  fresh?: ReadonlySet<string>
}

interface Box {
  w: number
  h: number
  centers: Array<{ x: number; y: number }>
}

interface Seg {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export function BingoLinesOverlay({ gridRef, lines, fresh }: Props) {
  const [box, setBox] = useState<Box | null>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const measure = () => {
      const centers: Box['centers'] = []
      grid.querySelectorAll<HTMLElement>('[data-cell]').forEach((el) => {
        const i = Number(el.dataset.cell)
        // Mitte des Bildbereichs (etwas über der Kachelmitte) wirkt ruhiger.
        centers[i] = { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight * 0.44 }
      })
      setBox({ w: grid.clientWidth, h: grid.clientHeight, centers })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    return () => ro.disconnect()
  }, [gridRef])

  if (!box || lines.length === 0) return null

  const segs: Seg[] = []
  for (const l of lines) {
    const a = box.centers[l.cells[0]]
    const b = box.centers[l.cells[l.cells.length - 1]]
    if (!a || !b) continue
    // Band ein Stück über die äußeren Kachelmitten hinaus verlängern.
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const ext = 10
    segs.push({
      id: l.id,
      x1: a.x - (dx / len) * ext,
      y1: a.y - (dy / len) * ext,
      x2: b.x + (dx / len) * ext,
      y2: b.y + (dy / len) * ext,
    })
  }
  const flash = fresh?.size ? segs.filter((s) => fresh.has(s.id)) : []
  const viewBox = `0 0 ${box.w} ${box.h}`

  return (
    <>
      {/* Ruhige Ebene hinter den Kacheln (z-0; Kacheln liegen auf z-[1]) */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" viewBox={viewBox}>
        {segs.map((s) => (
          <g key={s.id}>
            <line {...xy(s)} stroke="#ffd34d" strokeOpacity={0.55} strokeWidth={20} strokeLinecap="round" />
            <line {...xy(s)} stroke="#ffe7a0" strokeWidth={8} strokeLinecap="round" />
          </g>
        ))}
      </svg>

      {/* Aufleuchten über den Kacheln – nur für neue Linien, danach unsichtbar */}
      {flash.length > 0 && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" viewBox={viewBox}>
          {flash.map((s) => (
            <g key={s.id} className="gb-line-flash">
              <line {...xy(s)} pathLength={1} className="gb-line-draw" stroke="#b8861a" strokeOpacity={0.5} strokeWidth={11} strokeLinecap="round" />
              <line {...xy(s)} pathLength={1} className="gb-line-draw" stroke="#ffd34d" strokeWidth={7} strokeLinecap="round" />
              <line {...xy(s)} pathLength={1} className="gb-line-draw" stroke="#fff6cf" strokeWidth={2.2} strokeLinecap="round" />
            </g>
          ))}
        </svg>
      )}
    </>
  )
}

function xy(s: Seg) {
  return { x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2 }
}
