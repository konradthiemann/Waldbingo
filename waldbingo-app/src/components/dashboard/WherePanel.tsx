import { useState } from 'react'
import type { Habitat } from '../../data/types'
import type { RegionInfo } from '../../lib/geocode'
import { HABITAT_LABEL, HABITATS } from '../../lib/labels'
import { ChevronIcon, PinIcon } from '../home/ShellIcons'
import { Panel } from '../ui'
import { ChipChoice } from './ChoiceGrid'
import { MapTile } from './MapTile'

interface Props {
  lat: number | null
  lng: number | null
  online: boolean
  locating: boolean
  radiusKm: number | null
  region: RegionInfo | null
  elevation: number | null
  isGebirge: boolean
  loading: boolean
  habitat: Habitat
  onPick: (lat: number, lng: number) => void
  onLocate: () => void
  onHabitat: (h: Habitat) => void
}

/** „Wo seid ihr?“ – Karte, Ort/Höhe und Lebensraum. */
export function WherePanel(p: Props) {
  const [habitatOpen, setHabitatOpen] = useState(false)
  const hasCoords = p.lat != null && p.lng != null

  return (
    <Panel as="section" sign="Wo seid ihr?">
      <MapTile
        lat={p.lat}
        lng={p.lng}
        online={p.online}
        busy={p.locating}
        radiusKm={p.radiusKm}
        onPick={p.onPick}
        onLocate={p.onLocate}
      />

      <div className="mt-3 flex items-start gap-2.5">
        <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-berry-light/60 text-berry">
          <PinIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          {hasCoords ? (
            <>
              <div className="truncate font-display text-[16.5px] font-semibold leading-tight text-forest-900">
                {p.loading ? 'Ort wird gesucht…' : (p.region?.label ?? 'Ort gefunden')}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
                <span className="tabular-nums">
                  {p.lat!.toFixed(3)}, {p.lng!.toFixed(3)}
                </span>
                {p.elevation != null && <span>· {Math.round(p.elevation)} m hoch</span>}
                {p.isGebirge && (
                  <span className="rounded-full bg-forest-100 px-2 py-0.5 font-semibold text-forest-700">
                    Mittelgebirge
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-[16px] font-semibold leading-tight text-forest-900">
                Noch kein Ort gewählt
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">
                Tippe auf die Karte oder nutze „Mein Standort“.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Lebensraum (aus der Höhe vorgeschlagen, änderbar) */}
      <div className="mt-3 rounded-[18px] border-2 border-cream-line bg-cream-2/60">
        <button
          type="button"
          onClick={() => setHabitatOpen((v) => !v)}
          aria-expanded={habitatOpen}
          className="focus-ring flex min-h-[48px] w-full items-center gap-2 rounded-[16px] px-3.5 text-left"
        >
          <span className="text-[12px] font-bold uppercase tracking-wide text-muted">Lebensraum</span>
          <span className="font-display text-[15.5px] font-semibold text-forest-800">{HABITAT_LABEL[p.habitat]}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-forest-600">
            ändern
            <ChevronIcon open={habitatOpen} />
          </span>
        </button>
        {habitatOpen && (
          <div className="anim-fade px-3 pb-3.5 pt-1">
            <ChipChoice
              label="Lebensraum"
              options={HABITATS.map((h) => ({ value: h, label: HABITAT_LABEL[h] }))}
              value={p.habitat}
              onChange={(h) => {
                p.onHabitat(h)
              }}
            />
          </div>
        )}
      </div>
    </Panel>
  )
}
