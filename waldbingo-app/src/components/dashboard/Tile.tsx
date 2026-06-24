import type { ReactNode } from 'react'
import { Glyph } from '../Svg'

interface Props {
  title?: string
  glyph?: string
  children: ReactNode
  className?: string
}

export function Tile({ title, glyph, children, className }: Props) {
  return (
    <div className={`rounded-xl border border-line bg-white p-4 shadow-wb1 ${className ?? ''}`}>
      {title && (
        <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">
          {glyph && <Glyph name={glyph} className="block h-4 w-4 text-forest-500" />}
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
