import { useEffect, useRef, useState } from 'react'
import { OBJEKTE } from '../../data/objects'
import type { Habitat, Jahreszeit, SpielKontext, Tageszeit, Wetter } from '../../data/types'
import { saveGame } from '../../lib/db'
import { seasonFromDate, timeFromHour } from '../../lib/datetime'
import {
  fetchElevation,
  GEBIRGE_ELEVATION_M,
  reverseGeocode,
  type RegionInfo,
  suggestHabitatFromElevation,
} from '../../lib/geocode'
import { createGame } from '../../lib/generator'
import type { GameState } from '../../lib/game-state'
import { toStored } from '../../lib/game-state'
import { getRegionalSpecies, prefetchMedia } from '../../lib/species'
import { type CurrentWeather, fetchCurrentWeather } from '../../lib/weather'
import { loadSettings, saveSettings } from '../../lib/db'
import { useGeolocation } from '../../hooks/useGeolocation'
import { Glyph } from '../Svg'
import { LocationTile } from './LocationTile'
import { ManualChips } from './ManualChips'
import { MapTile } from './MapTile'
import { OptionsTile } from './OptionsTile'
import { TimeSeasonTile } from './TimeSeasonTile'
import { WeatherTile } from './WeatherTile'

interface Props {
  online: boolean
  onStart: (game: GameState) => void
}

export function Dashboard({ online, onStart }: Props) {
  const now = new Date()
  const [season, setSeason] = useState<Jahreszeit>(seasonFromDate(now))
  const [time, setTime] = useState<Tageszeit>(timeFromHour(now.getHours()))
  const [weather, setWeather] = useState<Wetter | null>(null)
  const [habitat, setHabitat] = useState<Habitat>('mischwald')
  const habitatTouched = useRef(false)

  const [diff, setDiff] = useState(2)
  const [players, setPlayers] = useState(1)
  const [seed, setSeed] = useState('')
  const [radiusKm, setRadiusKm] = useState(30)

  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [region, setRegion] = useState<RegionInfo | null>(null)
  const [elevation, setElevation] = useState<number | null>(null)
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null)

  const [loadingCtx, setLoadingCtx] = useState(false)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const geo = useGeolocation()
  const ctxAbort = useRef<AbortController | null>(null)

  // Letzten Standort/Wetter vorbefüllen.
  useEffect(() => {
    void loadSettings().then((s) => {
      if (s.lastLat != null && s.lastLng != null) {
        setLat(s.lastLat)
        setLng(s.lastLng)
      }
      if (s.lastWeather) {
        setWeatherData(s.lastWeather)
        setWeather(s.lastWeather.wb)
      }
    })
  }, [])

  /** Standort gewählt → Wetter, Region und Höhe best-effort laden. */
  function applyLocation(newLat: number, newLng: number) {
    setLat(newLat)
    setLng(newLng)
    void saveSettings({ lastLat: +newLat.toFixed(2), lastLng: +newLng.toFixed(2) })

    ctxAbort.current?.abort()
    if (!online) return
    const ctrl = new AbortController()
    ctxAbort.current = ctrl
    setLoadingCtx(true)
    setRegion(null)
    setElevation(null)

    const tasks: Promise<unknown>[] = [
      fetchCurrentWeather(newLat, newLng, ctrl.signal)
        .then((w) => {
          setWeatherData(w)
          setWeather(w.wb)
          void saveSettings({ lastWeather: w })
        })
        .catch(() => undefined),
      reverseGeocode(newLat, newLng, ctrl.signal)
        .then((r) => setRegion(r))
        .catch(() => undefined),
      fetchElevation(newLat, newLng, ctrl.signal)
        .then((e) => {
          setElevation(e)
          const sugg = suggestHabitatFromElevation(e)
          if (sugg && !habitatTouched.current) setHabitat(sugg)
        })
        .catch(() => undefined),
    ]
    void Promise.allSettled(tasks).then(() => setLoadingCtx(false))
  }

  async function onLocate() {
    try {
      const c = await geo.locate()
      applyLocation(c.lat, c.lng)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Standort fehlgeschlagen.')
    }
  }

  function setHabitatManual(h: Habitat) {
    habitatTouched.current = true
    setHabitat(h)
  }

  async function createBingo() {
    setCreating(true)
    setStatus(null)
    const ctx: SpielKontext = { season, weather, time, habitat }
    let data = OBJEKTE

    try {
      if (diff > 1 && online) {
        // Standort sicherstellen – falls keiner gesetzt ist, automatisch holen
        // (auf einer frischen Domain gibt es keinen gespeicherten Standort).
        let coords = lat != null && lng != null ? { lat, lng } : null
        if (!coords) {
          setStatus('Standort wird ermittelt…')
          try {
            const c = await geo.locate()
            applyLocation(c.lat, c.lng)
            coords = { lat: c.lat, lng: c.lng }
          } catch {
            coords = null
          }
        }

        if (coords) {
          setStatus('Suche Arten, die hier gerade vorkommen…')
          const live = await getRegionalSpecies({ lat: coords.lat, lng: coords.lng, ctx, diff, radiusKm })

          if (diff === 3) {
            // Schwer: reine Foto-Karte. Genug Live-Arten → nur Live; sonst mit
            // Piktogrammen auffüllen, damit immer 25 Felder zustande kommen.
            if (live.length >= 25) {
              data = live
              setStatus(`✓ ${live.length} regionale Arten – reine Foto-Karte.`)
            } else if (live.length > 0) {
              data = live.concat(OBJEKTE)
              setStatus(`✓ ${live.length} regionale Arten (mit Piktogrammen aufgefüllt).`)
            } else {
              setStatus('⚠ Keine regionalen Arten gefunden – generische Karte.')
            }
          } else {
            // Mittel: Mischung aus Piktogrammen (kuratiert) und Fotos (Live-Arten).
            if (live.length) {
              data = OBJEKTE.concat(live)
              setStatus(`✓ ${live.length} regionale Arten – Mischung aus Fotos & Piktogrammen.`)
            } else {
              setStatus('⚠ Keine regionalen Arten gefunden – generische Karte.')
            }
          }
        } else {
          setStatus('⚠ Kein Standortzugriff – generische Karte. Erlaube den Standort oder tippe auf die Karte für Fotos.')
        }
      }

      const seedStr = seed.trim() || 'wb' + Date.now()
      const { pool, cards } = createGame({ data, ctx, diff, seedStr, players })

      // Bild-Cache für die tatsächlich gezogenen Felder vorwärmen (Offline).
      const mediaUrls = pool.map((o) => o._media?.url).filter((u): u is string => !!u)
      if (mediaUrls.length && online) {
        setStatus('Bilder werden für offline geladen…')
        await prefetchMedia(mediaUrls)
      }

      const game: GameState = {
        pool,
        cards,
        found: cards.map(() => new Set<number>()),
        activePlayer: 0,
        ctx,
        seedStr,
        diff,
        players,
        createdAt: Date.now(),
      }
      await saveGame(toStored(game))
      onStart(game)
    } catch (e) {
      setStatus(e instanceof Error ? `Fehler: ${e.message}` : 'Spiel konnte nicht erstellt werden.')
    } finally {
      setCreating(false)
    }
  }

  const isGebirge = elevation != null && elevation >= GEBIRGE_ELEVATION_M

  return (
    <section className="mb-[18px]">
      <h2 className="mb-4 px-1 text-[17px] font-extrabold text-forest-900">
        Wo &amp; wann seid ihr unterwegs?
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <MapTile
            lat={lat}
            lng={lng}
            online={online}
            busy={geo.loading}
            radiusKm={diff > 1 ? radiusKm : null}
            onPick={applyLocation}
            onLocate={onLocate}
          />
        </div>
        <WeatherTile weather={weatherData} loading={loadingCtx && !weatherData} />
        <LocationTile
          lat={lat}
          lng={lng}
          region={region}
          elevation={elevation}
          isGebirge={isGebirge}
          loading={loadingCtx}
        />
        <TimeSeasonTile season={season} time={time} />
        <OptionsTile
          diff={diff}
          players={players}
          seed={seed}
          radiusKm={radiusKm}
          onDiff={setDiff}
          onPlayers={setPlayers}
          onSeed={setSeed}
          onRadius={setRadiusKm}
        />
      </div>

      <div className="mt-4">
        <ManualChips
          season={season}
          weather={weather}
          time={time}
          habitat={habitat}
          onSeason={setSeason}
          onWeather={setWeather}
          onTime={setTime}
          onHabitat={setHabitatManual}
        />
      </div>

      {status && <p className="mt-3 px-1 text-[13px] text-muted">{status}</p>}

      <div className="sticky bottom-3 z-10 mt-5">
        <button
          type="button"
          onClick={createBingo}
          disabled={creating}
          className="focus-ring flex w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-br from-forest-600 to-forest-700 px-6 py-4 text-[17px] font-bold text-white shadow-wb2 transition active:translate-y-px disabled:opacity-70"
        >
          <Glyph name="dice" className="block h-5 w-5" />
          {creating ? 'Wird erstellt…' : 'Bingo erstellen'}
        </button>
      </div>
    </section>
  )
}
