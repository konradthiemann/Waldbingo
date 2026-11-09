import { useState } from 'react'
import type { GameState } from '../../lib/game-state'
import type { SceneState } from '../../lib/scene'
import { playSfx } from '../../lib/sfx'
import { wingoLine } from '../../lib/wingo-lines'
import { Wingo, type WingoMood } from '../characters/Wingo'
import { GameButton, SpeechBubble } from '../ui'
import { GameLogo } from './GameLogo'
import { FriendsIcon, PlayIcon, SproutIcon } from './ShellIcons'

interface Props {
  /** Aktuelle Szene (Jahreszeit/Wetter/Tageszeit) – für Begrüßung & Accessoires. */
  scene: SceneState
  /** Gespeichertes Spiel (falls vorhanden) → „Weiterspielen“ primär. */
  savedGame: GameState | null
  /** Spielstand geladen? Bis dahin keine Knöpfe zeigen (kein Umspringen). */
  ready: boolean
  onContinue: () => void
  onNew: () => void
  onJoin: () => void
}

/**
 * Startbildschirm – das Aushängeschild: großes Logo, Wingo winkt mit einer
 * wetterbezogenen Begrüßung, dicke Spiel-Knöpfe. Die Szene wirkt hier am stärksten.
 */
export function TitleScreen({ scene, savedGame, ready, onContinue, onNew, onJoin }: Props) {
  // Begrüßung: zufällig eine der beiden passendsten Zeilen (der Pool beginnt mit
  // Fortschritt/Wetter/Tageszeit), Antippen von Wingo blättert weiter.
  const [variant, setVariant] = useState(() => Math.floor(Math.random() * 2))
  const [hop, setHop] = useState(0)
  const [mood, setMood] = useState<WingoMood>('wave')

  const found = savedGame ? (savedGame.found[savedGame.activePlayer]?.size ?? 0) : 0
  const ctx = { season: scene.season, weather: scene.weather, time: scene.time, count: found }
  const greeting = wingoLine(savedGame ? 'welcomeBack' : 'welcome', ctx, variant)

  function pokeWingo() {
    playSfx('tap')
    setVariant((v) => v + 1)
    setHop((h) => h + 1)
    setMood('happy')
    window.setTimeout(() => setMood('wave'), 1400)
  }

  return (
    <section className="wb-title mx-auto flex min-h-0 w-full max-w-[1080px] flex-1 flex-col px-4 pb-2 lg:flex-row lg:gap-12 lg:px-8 lg:pb-0">
      {/* ── Logo + Knöpfe (Desktop: linke Spalte) ─────────────────────── */}
      <div className="contents lg:flex lg:w-[46%] lg:flex-none lg:flex-col lg:items-stretch lg:justify-center lg:pb-[6dvh]">
        <div className="order-1 mx-auto w-full max-w-[min(400px,46dvh)] flex-none pt-1 lg:max-w-[460px]">
          <h1 className="wb-logo-in m-0">
            <div className="wb-logo-float">
              <GameLogo sparkles />
            </div>
          </h1>
          <div
            className="wb-stagger wb-title-sub -mt-1 flex justify-center"
            style={{ ['--d' as string]: '250ms' }}
          >
            <p className="wb-glass-strong rounded-full border border-white/70 px-4 py-1 text-center font-display text-[15px] font-medium tracking-[0.01em] text-forest-900 shadow-wb2 backdrop-blur-md sm:text-[16px]">
              Das Such-Abenteuer für die ganze Familie
            </p>
          </div>
        </div>

        <nav
          aria-label="Hauptmenü"
          className="order-3 mx-auto mt-2 flex w-full max-w-[360px] flex-none flex-col gap-3 lg:order-2 lg:mt-8 lg:max-w-[380px] lg:gap-3.5"
        >
          {ready ? (
            savedGame ? (
              <>
                <div className="wb-stagger" style={{ ['--d' as string]: '350ms' }}>
                  <GameButton
                    variant="accent"
                    size="xl"
                    block
                    icon={<PlayIcon size={24} />}
                    onClick={() => {
                      playSfx('tap')
                      onContinue()
                    }}
                  >
                    <span className="flex flex-col items-start leading-tight">
                      <span>Weiterspielen</span>
                      <span className="text-[12.5px] font-medium opacity-80">
                        {found} von 25 gefunden
                      </span>
                    </span>
                  </GameButton>
                </div>
                <div className="wb-stagger" style={{ ['--d' as string]: '430ms' }}>
                  <GameButton
                    variant="primary"
                    size="lg"
                    block
                    icon={<SproutIcon />}
                    onClick={() => {
                      playSfx('tap')
                      onNew()
                    }}
                  >
                    Neues Abenteuer
                  </GameButton>
                </div>
              </>
            ) : (
              <div className="wb-stagger" style={{ ['--d' as string]: '350ms' }}>
                <GameButton
                  variant="accent"
                  size="xl"
                  block
                  icon={<SproutIcon size={26} />}
                  onClick={() => {
                    playSfx('tap')
                    onNew()
                  }}
                >
                  Neues Abenteuer
                </GameButton>
              </div>
            )
          ) : (
            <div className="h-16" aria-hidden="true" />
          )}
          {ready && (
            <div className="wb-stagger" style={{ ['--d' as string]: '510ms' }}>
              <GameButton
                variant="secondary"
                size="lg"
                block
                icon={<FriendsIcon />}
                onClick={() => {
                  playSfx('tap')
                  onJoin()
                }}
              >
                Einem Spiel beitreten
              </GameButton>
            </div>
          )}
        </nav>
      </div>

      {/* ── Wingo mit Begrüßung (Desktop: rechte Spalte) ───────────────
          Wingo füllt den restlichen Platz (Größe über Container-Einheiten),
          steht auf einem kleinen Moos-Hügel. Desktop: Füße auf der Bodenlinie
          der Szene (≈ 84 % der Fensterhöhe). */}
      <div className="wb-title-stage order-2 flex min-h-[150px] flex-1 flex-col items-center lg:min-h-0">
        {/* Handy: Blase im Fluss über Wingo. Desktop: Blase sitzt direkt über
            Wingos Kopf (Wingo steht unten auf der Bodenlinie). */}
        <div
          className="wb-stagger relative w-full max-w-[300px] flex-none lg:hidden"
          style={{ ['--d' as string]: '450ms' }}
        >
          <SpeechBubble tail="bottom" className="text-center text-[16px] sm:text-[17px]">
            {greeting}
          </SpeechBubble>
        </div>
        <div className="wb-cq relative mt-2 flex w-full min-h-0 flex-1 items-end justify-center">
          <div className="relative flex flex-col items-center">
            <div
              className="wb-stagger absolute bottom-full left-1/2 mb-1 hidden w-[340px] -translate-x-1/2 lg:block"
              style={{ ['--d' as string]: '450ms' }}
            >
              <SpeechBubble tail="bottom" className="text-center text-[17px]">
                {greeting}
              </SpeechBubble>
            </div>
            <button
              type="button"
              onClick={pokeWingo}
              aria-label="Wingo antippen"
              className="focus-ring group relative z-[1] -mb-[6%] rounded-[40px] outline-none"
            >
              <span key={hop} className={`block ${hop > 0 ? 'wb-hop' : ''}`}>
                <Wingo
                  mood={mood}
                  size={208}
                  season={scene.season}
                  weather={scene.weather}
                  night={scene.isNight}
                  title="Wingo, das Waldmonster"
                  className="wb-title-wingo relative z-[1] block h-auto"
                />
              </span>
            </button>
            <MossMound />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Kleine Bühne unter Wingo: Moos-Hügel in den Bodenfarben der Szene
 * (Schnee im Winter, Laub im Herbst – über --sc-ground/--sc-ground-shade).
 * Kandidat für die Szene (scene/): als Teil des Vordergrunds denkbar.
 */
function MossMound() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 40"
      className="wb-title-mound relative block h-auto"
      preserveAspectRatio="xMidYMax meet"
    >
      <ellipse cx="120" cy="34" rx="112" ry="6" fill="rgba(15,38,23,.22)" />
      <path
        d="M14 33C26 15 64 6 120 6s94 9 106 27c-36 4-176 4-212 0Z"
        style={{ fill: 'var(--sc-ground-shade, #4f9a48)' }}
      />
      <path
        d="M24 29C38 15 72 9 120 9s82 6 96 20c-34 3-158 3-192 0Z"
        style={{ fill: 'var(--sc-ground, #6dbb5a)' }}
      />
      <path d="M62 15c18-5 40-7 58-7" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeLinecap="round" />
      {/* Grasbüschel und Moospolster */}
      <g style={{ fill: 'var(--sc-ground-shade, #4f9a48)' }}>
        <path d="M30 28c1-6 3-9 5-11-1 4-1 7 0 11Zm6 0c0-5 2-8 5-9-2 3-2 6-1 9Z" />
        <path d="M200 28c1-6 3-9 5-11-1 4-1 7 0 11Zm6 0c0-5 2-8 5-9-2 3-2 6-1 9Z" />
      </g>
      <circle cx="176" cy="22" r="3" style={{ fill: 'var(--sc-flower, #ff8fa3)' }} />
      <circle cx="58" cy="23" r="2.4" style={{ fill: 'var(--sc-flower, #ff8fa3)' }} />
    </svg>
  )
}
