import type { RegionInfo } from '../../lib/geocode'
import { Tile } from './Tile'

interface Props {
  lat: number | null
  lng: number | null
  region: RegionInfo | null
  elevation: number | null
  isGebirge: boolean
  loading: boolean
}

export function LocationTile({ lat, lng, region, elevation, isGebirge, loading }: Props) {
  const hasCoords = lat != null && lng != null
  return (
    <Tile title="Standort" glyph="pin">
      {hasCoords ? (
        <div>
          <div className="font-mono text-[15px] font-bold text-forest-900">
            {lat.toFixed(3)}, {lng.toFixed(3)}
          </div>
          <div className="mt-0.5 text-[13.5px] text-ink">
            {loading ? 'Region wird ermittelt…' : (region?.label ?? 'Region unbekannt')}
          </div>
          {elevation != null && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
              <span>⛰ {Math.round(elevation)} m ü. NN</span>
              {isGebirge && (
                <span className="rounded-full bg-forest-100 px-2 py-0.5 font-semibold text-forest-700">
                  Mittelgebirge
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-[13.5px] text-muted">
          Noch kein Standort. Tippe auf die Karte oder nutze „Mein Standort“.
        </p>
      )}
    </Tile>
  )
}
