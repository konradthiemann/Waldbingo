import type { Jahreszeit, Tageszeit } from '../../data/types'
import { SEASON_LABEL, TIME_LABEL } from '../../lib/labels'
import { Glyph } from '../Svg'
import { Tile } from './Tile'

interface Props {
  season: Jahreszeit
  time: Tageszeit
}

export function TimeSeasonTile({ season, time }: Props) {
  return (
    <Tile title="Zeit & Saison" glyph="season">
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-[15px] font-bold text-forest-900">
          <Glyph name="season" className="block h-[18px] w-[18px] text-forest-600" />
          {SEASON_LABEL[season]}
        </span>
        <span className="inline-flex items-center gap-2 text-[15px] font-bold text-forest-900">
          <Glyph name="clock" className="block h-[18px] w-[18px] text-forest-600" />
          {TIME_LABEL[time]}
        </span>
      </div>
      <p className="mt-2 text-[11.5px] text-muted">Automatisch aus Datum &amp; Uhrzeit.</p>
    </Tile>
  )
}
