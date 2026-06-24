import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { WB_UI } from '../../icons/pictograms'
import { Glyph } from '../Svg'

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
  html: `<div style="width:30px;height:38px;color:#1f5b38;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">${WB_UI('pin', 'ui-ic')}</div>`,
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
          weight: 2,
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
    <div className="relative isolate h-[220px] w-full overflow-hidden rounded-lg border border-line bg-line-2 sm:h-[260px]">
      <div ref={elRef} className="h-full w-full" />

      {!online && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-end justify-center bg-white/45 p-2">
          <span className="rounded-full bg-forest-900/85 px-3 py-1 text-[12px] font-semibold text-white">
            Karte nur online – Standort &amp; Spiel funktionieren weiter
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onLocate}
        disabled={busy}
        className="focus-ring absolute bottom-2.5 right-2.5 z-[600] inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-forest-700 shadow-wb2 disabled:opacity-60"
      >
        <Glyph name="pin" className="block h-4 w-4 text-forest-600" />
        {busy ? 'Suche…' : 'Mein Standort'}
      </button>
    </div>
  )
}
