import { useEffect, useRef, useState } from 'react'
import { OBJEKTE } from '../../data/objects'
import type { Habitat, Jahreszeit, SpielKontext, Tageszeit, Wetter } from '../../data/types'
import { useGeolocation } from '../../hooks/useGeolocation'
import { loadSettings, saveGame, saveSettings } from '../../lib/db'
import { seasonFromDate, timeFromHour } from '../../lib/datetime'
import { createGame } from '../../lib/generator'
import { type GameState, toStored } from '../../lib/game-state'
import {
  fetchElevation,
  GEBIRGE_ELEVATION_M,
  type RegionInfo,
  reverseGeocode,
  suggestHabitatFromElevation,
} from '../../lib/geocode'
import type { SceneInput } from '../../lib/scene'
import { playSfx } from '../../lib/sfx'
import { getRegionalSpecies, prefetchMedia } from '../../lib/species'
import { type CurrentWeather, fetchCurrentWeather } from '../../lib/weather'
import { wingoLine } from '../../lib/wingo-lines'
import { Friend } from '../characters/Friends'
import { WingoSays } from '../characters/WingoSays'
import { BackIcon, CloudOffIcon, FriendsIcon, SproutIcon } from '../home/ShellIcons'
import { GameButton, IconButton } from '../ui'
import { CreatingOverlay } from './CreatingOverlay'
import './dashboard.css'
import { DifficultyPanel } from './DifficultyPanel'
import { MoreOptions } from './MoreOptions'
import { PlayersPanel } from './PlayersPanel'
import { type ValueSource, WeatherTimePanel } from './WeatherTimePanel'
import { WherePanel } from './WherePanel'

interface Props {
  online: boolean
  onStart: (game: GameState) => void
  /** Zurück zum Startbildschirm. */
  onBack?: () => void
  /** Optionaler Link „Spiel beitreten“. */
  onJoinClick?: () => void
  /** Meldet Jahreszeit/Wetter/Tageszeit an die App, damit die Szene live mitwechselt. */
  onSceneChange?: (scene: SceneInput) => void
  /** Meldet, ob gerade eine Karte erstellt wird (App beruhigt dann die Szene). */
  onBusy?: (busy: boolean) => void
}

/** Wie lange ein gemessenes Wetter als „live“ beschriftet wird. */
const LIVE_MS = 60 * 60 * 1000

/** „Expedition planen“ – Ort, Wetter & Zeit, Schwierigkeit, Mitspieler. */
export function Dashboard({ online, onStart, onBack, onJoinClick, onSceneChange, onBusy }: Props) {
  const now = new Date()
  const [season, setSeason] = useState<Jahreszeit>(seasonFromDate(now))
  const [time, setTime] = useState<Tageszeit>(timeFromHour(now.getHours()))
  const [weather, setWeather] = useState<Wetter | null>(null)
  const [habitat, setHabitat] = useState<Habitat>('mischwald')
  const habitatTouched = useRef(false)
  const weatherTouched = useRef(false)
  const [seasonSource, setSeasonSource] = useState<ValueSource>('auto')
  const [timeSource, setTimeSource] = useState<ValueSource>('auto')
  const [weatherSource, setWeatherSource] = useState<ValueSource>('none')

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
  // Begrüßungs-Variante einmal pro Besuch auswürfeln.
  const [lineVariant] = useState(() => Math.floor(Math.random() * 1000))

  const geo = useGeolocation()
  const ctxAbort = useRef<AbortController | null>(null)

  // Klebt „Los geht’s!“ gerade unten am Bildschirm? Nur dann braucht er den
  // Creme-Untergrund (am Seitenende säße sonst ein harter Kasten in der Szene).
  const ctaEndRef = useRef<HTMLDivElement>(null)
  const [ctaStuck, setCtaStuck] = useState(false)
  useEffect(() => {
    const el = ctaEndRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setCtaStuck(!e.isIntersecting && e.boundingClientRect.top > 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Szene der App live mitführen.
  useEffect(() => {
    onSceneChange?.({ season, weather, time })
  }, [season, weather, time, onSceneChange])

  // Erstellen läuft → Szene beruhigen (Overlay mit Weichzeichner liegt darüber).
  useEffect(() => {
    onBusy?.(creating)
  }, [creating, onBusy])
  useEffect(() => () => onBusy?.(false), [onBusy])

  // Letzten Standort/Wetter vorbefüllen.
  useEffect(() => {
    void loadSettings()
      .then((s) => {
        if (s.lastLat != null && s.lastLng != null) {
          setLat(s.lastLat)
          setLng(s.lastLng)
        }
        if (s.lastWeather && !weatherTouched.current) {
          setWeatherData(s.lastWeather)
          setWeather(s.lastWeather.wb)
          setWeatherSource(Date.now() - s.lastWeather.fetchedAt < LIVE_MS ? 'live' : 'saved')
        }
      })
      .catch(() => undefined)
    return () => ctxAbort.current?.abort()
  }, [])

  /** Standort gewählt → Wetter, Region und Höhe best-effort laden. */
  function applyLocation(newLat: number, newLng: number) {
    setLat(newLat)
    setLng(newLng)
    void saveSettings({ lastLat: +newLat.toFixed(2), lastLng: +newLng.toFixed(2) }).catch(() => undefined)

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
          // Eine bewusst gewählte Wetterlage nicht überschreiben.
          if (!weatherTouched.current) {
            setWeather(w.wb)
            setWeatherSource('live')
          }
          void saveSettings({ lastWeather: w }).catch(() => undefined)
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
    void Promise.allSettled(tasks).then(() => {
      if (!ctrl.signal.aborted) setLoadingCtx(false)
    })
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
    playSfx('tap')
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
  const night = time === 'nacht' || time === 'daemmerung'

  return (
    <section className="wb-plan pb-2">
      {/* Kopf: Zurück + Titel direkt auf der Szene */}
      <div className="mb-1 flex items-center gap-3">
        {onBack && (
          <IconButton label="Zurück zum Startbildschirm" onClick={onBack}>
            <BackIcon />
          </IconButton>
        )}
        <h2 className="scene-title text-[27px] font-semibold leading-tight sm:text-[30px]">Expedition planen</h2>
      </div>

      {/* Wingo als Begleiter */}
      <WingoSays mood="happy" size={92} season={season} weather={weather} night={night} className="mb-1 max-w-[520px]">
        {wingoLine('setup', { season, weather, time }, lineVariant)}
      </WingoSays>

      {!online && (
        <div className="mt-2 flex items-center gap-2.5 rounded-[20px] border-2 border-sun-dark/40 bg-sun-light/95 py-2 pl-2 pr-3.5 text-[13px] leading-snug text-wood-lip shadow-wb2">
          {/* Stupsi kümmert sich um Hinweise und Leerzustände (Figuren-Bibel). */}
          <span className="relative flex-none">
            <Friend id="stupsi" size={44} mood={night ? 'sleep' : 'idle'} title="" />
            <CloudOffIcon size={16} className="absolute -right-1 -top-1 rounded-full bg-sun-light" />
          </span>
          <span>
            <b className="font-display font-semibold">Offline-Modus:</b> Karte &amp; neue Arten brauchen Netz –
            erstellte Spiele bleiben voll spielbar.
          </span>
        </div>
      )}

      {/* Handy: eine Spalte (Ort, Wetter, Schwierigkeit, Spieler).
          Desktop: zwei Spalten – links Ort + Spieler, rechts Wetter + Schwierigkeit. */}
      <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
        <div className="contents lg:flex lg:w-1/2 lg:flex-col lg:gap-3">
          <div className="order-1">
            <WherePanel
              lat={lat}
              lng={lng}
              online={online}
              locating={geo.loading}
              radiusKm={diff > 1 ? radiusKm : null}
              region={region}
              elevation={elevation}
              isGebirge={isGebirge}
              loading={loadingCtx}
              habitat={habitat}
              onPick={applyLocation}
              onLocate={onLocate}
              onHabitat={setHabitatManual}
            />
          </div>
          <div className="order-4">
            <PlayersPanel players={players} onPlayers={setPlayers} />
          </div>
        </div>
        <div className="contents lg:flex lg:w-1/2 lg:flex-col lg:gap-3">
          <div className="order-2">
            <WeatherTimePanel
              season={season}
              weather={weather}
              time={time}
              seasonSource={seasonSource}
              weatherSource={weatherSource}
              timeSource={timeSource}
              weatherData={weatherData}
              loadingWeather={loadingCtx && !weatherData}
              onSeason={(v) => {
                setSeason(v)
                setSeasonSource('manual')
              }}
              onWeather={(v) => {
                weatherTouched.current = true
                setWeather(v)
                setWeatherSource('manual')
              }}
              onTime={(v) => {
                setTime(v)
                setTimeSource('manual')
              }}
            />
          </div>
          <div className="order-3">
            <DifficultyPanel diff={diff} onDiff={setDiff} />
          </div>
        </div>
      </div>

      <MoreOptions diff={diff} seed={seed} radiusKm={radiusKm} onSeed={setSeed} onRadius={setRadiusKm} />

      {status && !creating && (
        <p
          role="status"
          className="mx-auto mt-4 max-w-[560px] rounded-[18px] border-2 border-cream-line bg-cream px-4 py-2.5 text-center text-[13.5px] leading-snug text-ink shadow-wb2"
        >
          {status}
        </p>
      )}

      {/* Handy: klebt unten auf einem weichen Creme-Untergrund (nichts scheint
          durch). Desktop: ruhig unter den beiden Spalten. */}
      <div
        data-stuck={ctaStuck || undefined}
        className="wb-cta pointer-events-none sticky bottom-0 z-20 -mx-3 mt-4 px-3 pt-7 sm:-mx-4 sm:px-4 lg:pointer-events-auto lg:static lg:mx-0 lg:mt-6 lg:px-0 lg:pt-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}
      >
        <div className="pointer-events-auto mx-auto max-w-[560px]">
          <GameButton
            variant="accent"
            size="xl"
            block
            onClick={() => void createBingo()}
            disabled={creating}
            icon={<SproutIcon size={26} />}
          >
            {creating ? 'Wird erstellt…' : 'Los geht’s!'}
          </GameButton>
        </div>
      </div>
      {/* Messpunkt: sichtbar = Knopf steht an seinem Platz (nicht geklebt) */}
      <div ref={ctaEndRef} aria-hidden="true" className="h-px" />

      {onJoinClick && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              playSfx('tap')
              onJoinClick()
            }}
            className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 font-display text-[14px] font-medium text-forest-900 shadow-wb2 backdrop-blur-md transition hover:bg-white/75"
          >
            <FriendsIcon size={18} className="text-forest-600" />
            Einladung bekommen? Spiel beitreten
          </button>
        </div>
      )}

      {creating && <CreatingOverlay status={status} season={season} weather={weather} time={time} />}
    </section>
  )
}
