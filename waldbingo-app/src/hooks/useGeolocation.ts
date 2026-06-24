import { useCallback, useState } from 'react'

export interface Coords {
  lat: number
  lng: number
  accuracy?: number
}

interface GeoState {
  loading: boolean
  error?: string
  coords?: Coords
}

/** Browser-Geolocation. `locate()` löst mit Koordinaten auf oder wirft. */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ loading: false })

  const locate = useCallback((): Promise<Coords> => {
    return new Promise<Coords>((resolve, reject) => {
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        const msg =
          'Standort braucht eine sichere Verbindung (HTTPS) – tippe solange auf die Karte.'
        setState({ loading: false, error: msg })
        reject(new Error(msg))
        return
      }
      if (!('geolocation' in navigator)) {
        const msg = 'Standort wird vom Browser nicht unterstützt.'
        setState({ loading: false, error: msg })
        reject(new Error(msg))
        return
      }
      setState((s) => ({ ...s, loading: true, error: undefined }))
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c: Coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setState({ loading: false, coords: c })
          resolve(c)
        },
        (err) => {
          const msg =
            err.code === err.PERMISSION_DENIED
              ? 'Kein Standortzugriff erlaubt – tippe auf die Karte.'
              : 'Standort konnte nicht ermittelt werden.'
          setState({ loading: false, error: msg })
          reject(new Error(msg))
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      )
    })
  }, [])

  return { ...state, locate }
}
