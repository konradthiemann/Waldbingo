import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dashboard } from './components/dashboard/Dashboard'
import { GameView } from './components/game/GameView'
import { Footer } from './components/home/Footer'
import { Hud } from './components/home/Hud'
import { ctxScene, nowScene } from './components/home/scene-input'
import { TitleScreen } from './components/home/TitleScreen'
import './components/home/shell.css'
import { JoinView } from './components/join/JoinView'
import { LegalView, type LegalPage } from './components/legal/LegalView'
import { PrintSheet } from './components/print/PrintSheet'
import { ForestScene } from './components/scene/ForestScene'
import { SceneProvider } from './components/scene/scene-context'
import { ShareModal } from './components/share/ShareModal'
import { useOnline } from './hooks/useOnline'
import { useHaptics } from './hooks/useHaptics'
import { useSound } from './hooks/useSound'
import type { SpielKontext } from './data/types'
import { loadGame, loadSettings, saveGame } from './lib/db'
import { fromStored, type GameState, toStored } from './lib/game-state'
import { deriveScene, parseSceneOverride, type SceneInput, sceneCssVars, sceneKey } from './lib/scene'
import { clearJoinFromUrl, parseJoinFromUrl, type SharedGame } from './lib/share'
import { playSfx } from './lib/sfx'
import type { CurrentWeather } from './lib/weather'

// Studio (Vorschau-Werkbank) nur bei Bedarf laden.
const Studio = lazy(() => import('./components/studio/Studio'))

/** Beitritts-Kontext: entweder ein fertiges Spiel (Link) oder ein Code (Query). */
interface JoinIntent {
  shared?: SharedGame
  code?: string
}

type Screen = 'title' | 'plan' | 'join' | 'game'

/** Tiefe der Bildschirme – bestimmt die Richtung des Übergangs. */
const DEPTH: Record<Screen, number> = { title: 0, plan: 1, join: 1, game: 2 }

export default function App() {
  const online = useOnline()
  const { soundOn, toggleSound } = useSound()
  const { hapticsOn, toggleHaptics, available: hapticsAvailable } = useHaptics()

  // ── Navigation ───────────────────────────────────────────────────────────
  // Beim Öffnen immer Startbildschirm; eine Einladung aus der URL hat Vorrang.
  const [join, setJoin] = useState<JoinIntent | null>(() => parseJoinFromUrl())
  const [screen, setScreen] = useState<Screen>(join ? 'join' : 'title')
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd')
  const screenRef = useRef(screen)
  const [legal, setLegalState] = useState<LegalPage | null>(null)
  const legalRef = useRef<LegalPage | null>(null)
  const setLegal = useCallback((page: LegalPage | null) => {
    legalRef.current = page
    setLegalState(page)
  }, [])
  const [studio, setStudio] = useState(() => new URLSearchParams(window.location.search).has('studio'))

  // ── Spielstand ───────────────────────────────────────────────────────────
  const [game, setGame] = useState<GameState | null>(null)
  const [booted, setBooted] = useState(false)
  const [showShare, setShowShare] = useState(false)
  // Overlay im Spiel offen (Info, Foto-Wahl, Kamera, Feier) → Szene beruhigen.
  const [gameOverlay, setGameOverlay] = useState(false)
  // Planen: Karte wird gerade erstellt (Overlay mit Weichzeichner) → Szene beruhigen.
  const [planBusy, setPlanBusy] = useState(false)
  const [printWithInfo, setPrintWithInfo] = useState<boolean | null>(null)

  // ── Szene (Hintergrund) ──────────────────────────────────────────────────
  // Vorschau per URL (?scene=winter,schnee,nacht) hat Vorrang und bleibt fix.
  const sceneOverride = useMemo(() => parseSceneOverride(window.location.search, nowScene()), [])
  const [studioScene, setStudioScene] = useState<SceneInput>(() => sceneOverride ?? nowScene())
  const [lastWeather, setLastWeather] = useState<CurrentWeather | null>(null)
  const [planScene, setPlanScene] = useState<SceneInput | null>(null)
  const [joinScene, setJoinScene] = useState<SceneInput | null>(null)
  // Uhr-Takt (5 min), damit Tageszeit/Jahreszeit der Startszene mitlaufen.
  const [clock, setClock] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setClock((c) => c + 1), 5 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  const sceneInput: SceneInput = useMemo(() => {
    if (studio) return studioScene
    if (sceneOverride) return sceneOverride
    if (screen === 'game' && game) return ctxScene(game.ctx)
    if (screen === 'plan' && planScene) return planScene
    if (screen === 'join' && joinScene) return joinScene
    return nowScene(lastWeather)
    // `clock` absichtlich als Abhängigkeit: erzwingt Neuberechnung der Uhrzeit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio, studioScene, sceneOverride, screen, game, planScene, joinScene, lastWeather, clock])
  const key = sceneKey(sceneInput)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scene = useMemo(() => deriveScene(sceneInput), [key])

  // Szenen-Farben als CSS-Variablen global verfügbar machen (+ Browser-Leiste).
  useEffect(() => {
    const root = document.documentElement
    for (const [k, v] of Object.entries(sceneCssVars(scene))) root.style.setProperty(k, v)
    // Schatten für Überschriften direkt auf der Szene: immer Gegenfarbe zur Schrift.
    root.style.setProperty(
      '--wb-title-shadow',
      scene.palette.onScene.toLowerCase() === '#ffffff' ? 'rgba(12,24,40,.55)' : 'rgba(255,255,255,.8)',
    )
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', scene.palette.themeColor)
  }, [scene])

  // Start: gespeichertes Spiel + letztes Wetter laden (Startbildschirm, Szene).
  useEffect(() => {
    let alive = true
    // Sicherheitsnetz: hängt IndexedDB (z. B. privater Modus), trotzdem Knöpfe zeigen.
    const fallback = window.setTimeout(() => {
      if (alive) setBooted(true)
    }, 1500)
    loadGame()
      .then((g) => {
        if (alive && g) setGame(fromStored(g))
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setBooted(true)
      })
    loadSettings()
      .then((s) => {
        if (alive) setLastWeather(s.lastWeather ?? null)
      })
      .catch(() => undefined)
    return () => {
      alive = false
      window.clearTimeout(fallback)
    }
  }, [])

  // Drucken erst nach dem Render der Druckansicht auslösen.
  useEffect(() => {
    if (printWithInfo === null) return
    const t = setTimeout(() => {
      window.print()
      setPrintWithInfo(null)
    }, 60)
    return () => clearTimeout(t)
  }, [printWithInfo])

  // Rechtliches liegt als eigene Ebene über dem Bildschirm, der eingehängt bleibt
  // (Funde, Eingaben und Karte gehen nicht verloren). Beim Öffnen nach oben, beim
  // Schließen zurück an die alte Stelle.
  const legalScroll = useRef(0)
  useEffect(() => {
    if (legal) {
      window.scrollTo({ top: 0 })
      return
    }
    window.scrollTo({ top: legalScroll.current })
    legalScroll.current = 0
    // Leaflet & Co. messen nach dem Wieder-Einblenden neu.
    window.dispatchEvent(new Event('resize'))
  }, [legal])

  // Bei jedem Bildschirmwechsel nach oben.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen])

  const go = useCallback((next: Screen) => {
    const prev = screenRef.current
    // Rechtliches schließt bei jeder Navigation (auch „Logo → Start“ vom Startbildschirm aus).
    const legalOpen = legalRef.current !== null
    legalRef.current = null
    setLegal(null)
    if (prev === next) {
      if (legalOpen) {
        setDirection('back')
        playSfx('whoosh')
      }
      return
    }
    setDirection(DEPTH[next] >= DEPTH[prev] ? 'fwd' : 'back')
    screenRef.current = next
    setScreen(next)
    playSfx('whoosh')
  }, [setLegal])

  /** Gespeicherten Stand neu laden (GameView schreibt Funde direkt in die DB). */
  const refreshGame = useCallback(async (): Promise<GameState | null> => {
    try {
      const g = await loadGame()
      const state = g ? fromStored(g) : null
      setGame(state)
      return state
    } catch {
      return null
    }
  }, [])

  function goHome() {
    if (studio) closeStudio()
    go('title')
    // Kurz warten, damit der letzte Spielstand sicher geschrieben ist.
    window.setTimeout(() => void refreshGame(), 200)
    void loadSettings()
      .then((s) => setLastWeather(s.lastWeather ?? null))
      .catch(() => undefined)
  }

  function closeStudio() {
    setStudio(false)
    window.history.replaceState(null, '', window.location.pathname)
  }

  async function continueGame() {
    const fresh = await refreshGame()
    if (fresh || game) go('game')
  }

  function startGame(g: GameState) {
    setGame(g)
    go('game')
  }

  /** Nach Spieler-Auswahl: geteiltes Spiel als aktives Spiel übernehmen. */
  async function handleJoin(g: GameState) {
    await saveGame(toStored(g))
    setGame(g)
    setJoin(null)
    setJoinScene(null)
    clearJoinFromUrl()
    go('game')
  }

  // Stabil, damit JoinView den Kontext nur bei neuem Spiel meldet.
  const onJoinContext = useCallback((ctx: SpielKontext) => setJoinScene(ctxScene(ctx)), [])

  function cancelJoin() {
    setJoin(null)
    setJoinScene(null)
    clearJoinFromUrl()
    goHome()
  }

  function openLegal(page: LegalPage) {
    if (!legal) {
      setDirection('fwd')
      legalScroll.current = window.scrollY
    }
    setLegal(page)
    playSfx('whoosh')
  }

  function closeLegal() {
    setDirection('back')
    setLegal(null)
    playSfx('whoosh')
  }

  // ── Bildschirm-Inhalt ────────────────────────────────────────────────────
  let content: JSX.Element
  let contentKey: string
  if (studio) {
    contentKey = 'studio'
    content = (
      <main className="mx-auto w-full max-w-[920px] px-3 pb-8 pt-2 sm:px-4">
        <Suspense fallback={null}>
          <Studio
            scene={studioScene}
            onScene={setStudioScene}
            onClose={closeStudio}
          />
        </Suspense>
      </main>
    )
  } else if (screen === 'join') {
    contentKey = 'join'
    content = (
      <main className="mx-auto w-full max-w-[620px] px-3 pb-8 pt-2 sm:px-4">
        <JoinView
          initialShared={join?.shared}
          initialCode={join?.code}
          onJoin={handleJoin}
          onCancel={cancelJoin}
          onContext={onJoinContext}
        />
      </main>
    )
  } else if (screen === 'game' && game) {
    contentKey = 'game'
    content = (
      <main className="mx-auto w-full max-w-[920px] px-3 pb-8 pt-2 sm:px-4">
        <GameView
          key={game.createdAt}
          game={game}
          onExit={() => go('plan')}
          onPrint={(withInfo) => setPrintWithInfo(withInfo)}
          onInvite={() => setShowShare(true)}
          onOverlayChange={setGameOverlay}
        />
      </main>
    )
  } else if (screen === 'plan') {
    contentKey = 'plan'
    content = (
      <main className="mx-auto w-full max-w-[920px] px-3 pb-8 pt-2 sm:px-4">
        <Dashboard
          online={online}
          onStart={startGame}
          onBack={goHome}
          onJoinClick={() => go('join')}
          onSceneChange={setPlanScene}
          onBusy={setPlanBusy}
        />
      </main>
    )
  } else {
    contentKey = 'title'
    content = (
      <main className="flex flex-1 flex-col">
        <TitleScreen
          scene={scene}
          savedGame={game}
          ready={booted}
          onContinue={() => void continueGame()}
          onNew={() => go('plan')}
          onJoin={() => go('join')}
        />
      </main>
    )
  }

  const onTitle = contentKey === 'title' && !legal
  const anim = direction === 'fwd' ? 'wb-screen-fwd' : 'wb-screen-back'
  // Seitentitel für Screenreader (der Startbildschirm hat das Logo als h1,
  // Rechtliches eigene h1-Überschriften).
  const SCREEN_TITLE: Record<string, string> = {
    studio: 'Studio',
    join: 'Spiel beitreten',
    game: 'Spielbrett',
    plan: 'Expedition planen',
  }
  const srTitle = SCREEN_TITLE[contentKey]
  const calm =
    showShare || (screen === 'game' && gameOverlay) || (screen === 'plan' && planBusy && !legal)

  return (
    // Aktuelle Szene für Figuren (z. B. Wingos Laterne an dunklen Abenden).
    <SceneProvider value={scene}>
      <ForestScene scene={scene} calm={calm} />
      {/* Startbildschirm: genau eine Fensterhöhe (kleinste Höhe 580 px, darunter scrollt die Seite). */}
      <div
        className={`app-screen relative z-10 flex flex-col ${onTitle ? 'h-[max(100dvh,580px)]' : 'min-h-[100dvh]'}`}
      >
        <Hud
          showLogo={!onTitle}
          onHome={goHome}
          online={online}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          hapticsOn={hapticsOn}
          hapticsAvailable={hapticsAvailable}
          onToggleHaptics={toggleHaptics}
        />

        {/* Bildschirm bleibt bei offenem Rechtlichem eingehängt (nur ausgeblendet). */}
        <div key={contentKey} className={legal ? 'hidden' : `flex flex-1 flex-col ${anim}`}>
          {srTitle && <h1 className="sr-only">Waldbingo – {srTitle}</h1>}
          {content}
        </div>

        {legal && (
          <div key="legal" className={`flex flex-1 flex-col ${anim}`}>
            <main className="mx-auto w-full max-w-[920px] px-3 pb-8 pt-2 sm:px-4">
              <LegalView page={legal} onClose={closeLegal} onNavigate={setLegal} />
            </main>
          </div>
        )}

        <Footer onLegal={openLegal} compact={onTitle} className={onTitle ? 'pb-3' : 'pb-6 pt-4'} />
      </div>

      {showShare && game && <ShareModal game={game} online={online} onClose={() => setShowShare(false)} />}

      {printWithInfo !== null && game && (
        <div className="print-only">
          <PrintSheet game={game} withInfo={printWithInfo} />
        </div>
      )}
    </SceneProvider>
  )
}
