import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { WB_UI } from '../../icons/pictograms'
import { playSfx } from '../../lib/sfx'
import { PinIcon } from '../home/ShellIcons'

interface Props {
  lat: number | null
  lng: number | null
  online: boolean
  busy?: boolean
  /** Such-Radius in km als Kreis darstellen; null = ausblenden (leichter Modus). */
  radiusKm: number | null
  onPick: (lat: number, lng: number) => void
  onLocate: () => void
}

const pinIcon = L.divIcon({
  className: 'wb-pin',
  html: `<div style="width:30px;height:38px;color:#e85d75;filter:drop-shadow(0 2px 2px rgba(15,38,23,.4))">${WB_UI('pin', 'ui-ic')}</div>`,
  iconSize: [30, 38],
  iconAnchor: [15, 36],
})

/** Minikarte (Leaflet + OSM). Klick/Tap setzt den Ziel-Pin. Tiles nur online. */
export function MapTile({ lat, lng, online, busy, radiusKm, onPick, onLocate }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  // Karte einmalig initialisieren.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const hasPin = lat != null && lng != null
    const center: [number, number] = hasPin ? [lat, lng] : [51.2, 10.4] // Deutschland-Mitte
    const map = L.map(elRef.current, { attributionControl: true }).setView(center, hasPin ? 12 : 6)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap',
    }).addTo(map)
    map.on('click', (e: L.LeafletMouseEvent) => onPickRef.current(e.latlng.lat, e.latlng.lng))
    mapRef.current = map
    // Größe nach Layout korrigieren.
    const t = setTimeout(() => map.invalidateSize(), 60)
    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pin, Radius-Kreis und Ansicht aktualisieren.
  useEffect(() => {
    const map = mapRef.current
    if (!map || lat == null || lng == null) return
    if (!markerRef.current) markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
    else markerRef.current.setLatLng([lat, lng])

    if (radiusKm != null) {
      const meters = radiusKm * 1000
      if (!circleRef.current) {
        circleRef.current = L.circle([lat, lng], {
          radius: meters,
          color: '#2f7d4f',
          weight: 2.5,
          dashArray: '6 6',
          fillColor: '#3f9d63',
          fillOpacity: 0.12,
        }).addTo(map)
      } else {
        circleRef.current.setLatLng([lat, lng])
        circleRef.current.setRadius(meters)
      }
      map.fitBounds(circleRef.current.getBounds(), { padding: [12, 12], animate: false })
    } else {
      if (circleRef.current) {
        circleRef.current.remove()
        circleRef.current = null
      }
      map.setView([lat, lng], Math.max(map.getZoom() ?? 12, 12))
    }
  }, [lat, lng, radiusKm])

  return (
    <div className="relative isolate h-[210px] w-full overflow-hidden rounded-[22px] border-2 border-cream-line bg-cream-2 shadow-[inset_0_2px_6px_rgba(110,68,38,.12)] sm:h-[250px]">
      <div ref={elRef} className="h-full w-full" />

      {!online && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-start justify-center bg-cream/60 p-2.5 pl-14">
          <span className="rounded-[14px] bg-forest-900/85 px-3 py-1.5 text-center font-display text-[12.5px] font-medium leading-snug text-white">
            Karte nur online – Standort &amp; Spiel funktionieren weiter
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          playSfx('tap')
          onLocate()
        }}
        disabled={busy}
        className="focus-ring absolute bottom-3 right-3 z-[600] inline-flex h-11 items-center gap-2 rounded-full border-2 border-cream-line bg-cream px-4 font-display text-[14.5px] font-semibold text-forest-800 shadow-[0_3px_0_#d9c39d,0_6px_14px_rgba(15,38,23,.22)] transition active:translate-y-[2px] disabled:opacity-70"
      >
        <PinIcon size={18} className={`text-berry ${busy ? 'animate-pulse' : ''}`} />
        {busy ? 'Suche…' : 'Mein Standort'}
      </button>
    </div>
  )
}
