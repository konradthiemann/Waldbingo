import { Glyph } from '../Svg'

interface Props {
  found: number
  total: number
  bingo: boolean
}

export function ProgressBar({ found, total, bingo }: Props) {
  const pct = total ? (found / total) * 100 : 0
  return (
    <div className="mx-auto mt-[18px] max-w-[680px]">
      <div className="mb-[7px] flex items-center justify-between text-[13px] font-bold text-muted">
        <span>
          {found} von {total} gefunden
        </span>
        <span className="text-forest-700">{bingo ? 'Bingo erreicht!' : ''}</span>
      </div>
      <div className="h-[9px] overflow-hidden rounded-full bg-line-2">
        <i
          className="block h-full rounded-full bg-gradient-to-r from-forest-500 to-forest-600 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {bingo && (
        <div className="anim-pop mx-auto mt-[14px] flex max-w-[680px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-sun bg-gradient-to-br from-[#fff7e6] to-[#ffeccc] p-3.5 text-[18px] font-extrabold text-amber-600 shadow-wb1">
          <Glyph name="sparkle" className="block h-6 w-6 text-sun" />
          BINGO! Super gemacht!
          <Glyph name="sparkle" className="block h-6 w-6 text-sun" />
        </div>
      )}
    </div>
  )
}
