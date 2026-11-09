// Spielbrett: Kontext-Plaketten, Spieler-Tabs, Wingo schaut über das
// Holzbrett und reagiert auf Funde, 5 × 5 Kacheln, goldene Bingo-Linien,
// Ranke als Fortschritt, Feier-Overlay bei Bingo und voller Karte.
//
// Spiellogik unverändert: Abhaken/Abwählen, Foto-Erkennung oder manuell,
// Info-Modal, Persistenz pro Änderung (abschaltbar über `persist`).
//
// Bingo in drei Schritten: 1) Kachel klappt um, Stempel, Blätter (0–450 ms),
// 2) goldene Linie zieht sich, Wingo jubelt, Glöckchen (450–1100 ms),
// 3) Feier-Overlay. Bis dahin nimmt das Brett keine Klicks an.
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type BingoLine, lineEvent, lineStatus, isFullCard } from '../../lib/bingo-lines'
import { updateFound } from '../../lib/db'
import type { GameState } from '../../lib/game-state'
import { checkBingo } from '../../lib/generator'
import { HABITAT_LABEL, SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { haptic, playSfx } from '../../lib/sfx'
import { type LineContext, wingoLine, type WingoSituation } from '../../lib/wingo-lines'
import { Friend, playerName } from '../characters/Friends'
import { Wingo, type WingoMood } from '../characters/Wingo'
import { Celebration, type CelebrationKind, Portal, prefersReducedMotion } from '../fx'
import { Badge, GameButton, SpeechBubble } from '../ui'
import { BingoLinesOverlay } from './BingoLinesOverlay'
import { CameraCapture } from './CameraCapture'
import { Cell } from './Cell'
import { ChooseModal } from './ChooseModal'
import './game.css'
import {
  BookIcon,
  CameraIcon,
  HabitatIcon,
  PrinterIcon,
  SeasonIcon,
  SeedIcon,
  SproutIcon,
  TimeIcon,
  UsersIcon,
  WeatherIcon,
} from './icons'
import { InfoModal } from './InfoModal'
import { PhotoVerify } from './PhotoVerify'
import { PlayerTabs, SelfPlayerBadge } from './PlayerTabs'
import { ProgressBar } from './ProgressBar'
import { useMediaQuery } from './useMedia'

interface Props {
  game: GameState
  onExit: () => void
  onPrint: (withInfo: boolean) => void
  onInvite: () => void
  /**
   * Spielstand in IndexedDB speichern (Standard: ja). Das Studio setzt
   * `false`, damit eine Vorschau nie den echten Spielstand überschreibt.
   */
  persist?: boolean
  /**
   * Meldet, ob gerade ein Overlay (Info, Foto-Wahl, Kamera, Feier) offen ist –
   * die App beruhigt dann die Szene (`ForestScene calm`).
   */
  onOverlayChange?: (open: boolean) => void
}

/** Kamera-Flow: welches Feld wird gerade per Foto verifiziert? */
interface CameraState {
  idx: number
  phase: 'choose' | 'camera' | 'verify'
  canvas?: HTMLCanvasElement
}

/** Was Wingo gerade sagt (n zählt hoch → Blase/Hüpfer neu animieren). */
interface Say {
  text: string
  mood: WingoMood
  n: number
  hop: 'none' | 'hop' | 'cheer'
}

interface Party {
  kind: CelebrationKind
  n: number
}

const HAS_CAMERA = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

/** Ohne Aktivität meldet sich Wingo nach dieser Zeit mit einem Tipp. */
const IDLE_MS = 60_000

/** Ablauf der Bingo-Feier (ms): Linie + Jubel, dann Overlay. */
const STEP_LINE = 450
const STEP_PARTY = 1100
const STEP_PARTY_REDUCED = 300

const NO_LINES: ReadonlySet<string> = new Set()

/** Wingos Hüpfer (Web Animations, ohne Neu-Einhängen der Figur). */
const HOP: Record<'hop' | 'cheer', { frames: Keyframe[]; ms: number }> = {
  hop: {
    frames: [{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)', offset: 0.4 }, { transform: 'translateY(0)' }],
    ms: 550,
  },
  cheer: {
    frames: [
      { transform: 'translateY(0) rotate(0)' },
      { transform: 'translateY(-18px) rotate(-4deg)', offset: 0.25 },
      { transform: 'translateY(-6px) rotate(3deg)', offset: 0.55 },
      { transform: 'translateY(0) rotate(0)' },
    ],
    ms: 900,
  },
}

/** So lange bewegt Wingo nach einem neuen Spruch den Mund (je nach Textlänge). */
function talkMs(text: string): number {
  return Math.min(2400, Math.max(900, text.length * 32))
}

export function GameView({ game, onExit, onPrint, onInvite, persist = true, onOverlayChange }: Props) {
  const [found, setFound] = useState<Set<number>[]>(game.found)
  const [activePlayer, setActivePlayer] = useState(game.activePlayer)
  const [modalIdx, setModalIdx] = useState<number | null>(null)
  const [cameraState, setCameraState] = useState<CameraState | null>(null)
  const [pop, setPop] = useState<{ idx: number; n: number } | null>(null)
  const [party, setParty] = useState<Party | null>(null)
  const [freshLines, setFreshLines] = useState<ReadonlySet<string>>(NO_LINES)
  // Neue komplette Linien, die erst nach dem Stempel gezeigt werden (Schritt 2).
  const [heldLines, setHeldLines] = useState<ReadonlySet<string>>(NO_LINES)
  // Feier-Ablauf läuft → Brett nimmt keine Klicks an.
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const timers = useRef<number[]>([])
  const coarse = useMediaQuery('(pointer: coarse)')
  // Touch + Kamera: Infos über die Wahl („Mehr erfahren“) bzw. Tippen auf ein
  // gefundenes Feld – das kleine (i) ist dann nur Deko (zu klein für Finger).
  const infoViaTap = HAS_CAMERA && coarse
  // Geteiltes Spiel (über mehrere Geräte): Gerät ist auf einen Spieler fixiert.
  const isShared = game.selfPlayer != null
  const { ctx } = game
  const night = ctx.time === 'nacht' || ctx.time === 'daemmerung'
  const lineCtx = useMemo(() => ({ season: ctx.season, weather: ctx.weather, time: ctx.time }), [ctx])

  // Bereits beim Laden erreichte Bingos/volle Karten werden NICHT erneut gefeiert.
  const celebrated = useRef({
    bingo: game.found.map((s) => checkBingo(s)),
    full: game.found.map((s) => isFullCard(s)),
  })
  const lineVariant = useRef(0)

  const [say, setSay] = useState<Say>(() => {
    const any = game.found[game.activePlayer]?.size ?? 0
    const situation: WingoSituation = any > 0 ? 'idle' : 'start'
    return { text: wingoLine(situation, lineCtx, 0), mood: night ? 'idle' : 'happy', n: 0, hop: 'none' }
  })

  const speak = useCallback(
    (situation: WingoSituation, mood: WingoMood, hop: Say['hop'], extra: Partial<LineContext> = {}) => {
      lineVariant.current += 1
      setSay((prev) => ({
        text: wingoLine(situation, { ...lineCtx, ...extra }, lineVariant.current),
        mood,
        n: prev.n + 1,
        hop,
      }))
    },
    [lineCtx],
  )

  // Spielstand bei jeder Änderung offline persistieren (nicht im Studio).
  // Nicht beim Einhängen: Der mitgegebene Stand liegt schon in der DB – ein
  // veralteter Prop darf neuere Funde nie überschreiben.
  const persistReady = useRef(false)
  useEffect(() => {
    if (!persist) return
    if (!persistReady.current) {
      persistReady.current = true
      return
    }
    void updateFound(
      found.map((s) => [...s]),
      activePlayer,
    )
  }, [found, activePlayer, persist])

  // Wingo spricht sichtbar, solange die neue Sprechblase „gesagt“ wird.
  const [talking, setTalking] = useState(false)
  useEffect(() => {
    if (say.n === 0) return
    setTalking(true)
    const t = setTimeout(() => setTalking(false), talkMs(say.text))
    return () => clearTimeout(t)
    // Nur bei neuem Spruch (n zählt hoch), nicht bei Stimmungswechsel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [say.n])

  // Offene Overlays an die App melden (Szene beruhigen); beim Verlassen zurücksetzen.
  const overlayOpen = modalIdx !== null || cameraState !== null || party !== null
  useEffect(() => {
    onOverlayChange?.(overlayOpen)
  }, [overlayOpen, onOverlayChange])
  useEffect(() => () => onOverlayChange?.(false), [onOverlayChange])

  // Wingo beruhigt sich nach einer Reaktion wieder (Stimmung → idle).
  useEffect(() => {
    if (say.mood === 'idle' || say.n === 0) return
    const t = setTimeout(() => setSay((s) => ({ ...s, mood: 'idle', hop: 'none' })), 2600)
    return () => clearTimeout(t)
  }, [say.n, say.mood])

  // Nach längerer Ruhe: freundlicher Such-Tipp.
  useEffect(() => {
    if (modalIdx !== null || cameraState || party) return
    const t = setTimeout(() => speak('idle', 'think', 'none'), IDLE_MS)
    return () => clearTimeout(t)
  }, [say.n, modalIdx, cameraState, party, speak])

  // Burst/Stempel-Markierung nach der Animation wieder entfernen.
  useEffect(() => {
    if (!pop) return
    const t = setTimeout(() => setPop(null), 1100)
    return () => clearTimeout(t)
  }, [pop])

  // Neue Linien nur einmal „zeichnen“ (Aufleuchten ≈ 2 s, danach ruhig).
  useEffect(() => {
    if (freshLines.size === 0) return
    const t = setTimeout(() => setFreshLines(NO_LINES), 2100)
    return () => clearTimeout(t)
  }, [freshLines])

  // Geplante Feier-Schritte beim Verlassen abbrechen.
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    },
    [],
  )
  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id)
      fn()
    }, ms)
    timers.current.push(id)
  }
  const lock = (on: boolean) => {
    busyRef.current = on
    setBusy(on)
  }

  // Wingo hüpft per Web Animations – die Figur bleibt eingehängt (Blinzeln/Atmen laufen weiter).
  const peekRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (say.n === 0 || prefersReducedMotion()) return
    const bubble = bubbleRef.current
    if (bubble && typeof bubble.animate === 'function') {
      bubble.animate(
        [
          { opacity: 0.3, transform: 'scale(0.75) translateY(6px)' },
          { opacity: 1, transform: 'scale(1.04)', offset: 0.7 },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' },
      )
    }
    if (say.hop === 'none') return
    const el = peekRef.current
    if (!el || typeof el.animate !== 'function') return
    const h = HOP[say.hop]
    el.animate(h.frames, { duration: h.ms, easing: 'cubic-bezier(.34,1.56,.64,1)' })
    // Nur bei neuem Spruch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [say.n])

  const card = game.cards[activePlayer]
  const playerFound = found[activePlayer]
  const status = useMemo(() => lineStatus(playerFound), [playerFound])
  const full = isFullCard(playerFound)
  // Sichtbare Linien: neue erst nach dem Stempel (heldLines), volle Karte ohne Einzellinien.
  const shownLines: BingoLine[] = useMemo(
    () => (heldLines.size ? status.complete.filter((l) => !heldLines.has(l.id)) : status.complete),
    [status, heldLines],
  )
  const goldenCells = useMemo(() => {
    if (!heldLines.size) return status.goldenCells
    const g = new Set<number>()
    for (const l of shownLines) for (const i of l.cells) g.add(i)
    return g
  }, [status, heldLines, shownLines])
  // Zähler wird erst golden, wenn die Linie gezeigt ist (Schritt 2).
  const bingo = shownLines.length > 0
  const gridRef = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery('(min-width: 640px)')

  /** Zentrale Änderung eines Feldes inkl. Reaktion (Klang, Wingo, Feier). */
  const change = (idx: number, mode: 'add' | 'toggle') => {
    if (busyRef.current) return
    const p = activePlayer
    const before = found[p]
    if (mode === 'add' && before.has(idx)) return
    const after = new Set(before)
    if (after.has(idx)) after.delete(idx)
    else after.add(idx)
    setFound((prev) => prev.map((s, i) => (i === p ? after : s)))

    const ev = lineEvent(before, after)
    const thing = card[idx]?.name
    if (ev === 'unfound') {
      playSfx('unfound')
      haptic('light')
      speak('unfound', 'think', 'none')
      return
    }
    setPop((prev) => ({ idx, n: (prev?.n ?? 0) + 1 }))

    if (ev === 'full' || ev === 'bingo') {
      const beforeIds = new Set(lineStatus(before).complete.map((l) => l.id))
      const newIds = new Set(
        lineStatus(after)
          .complete.filter((l) => !beforeIds.has(l.id))
          .map((l) => l.id),
      )
      const kind: CelebrationKind | null =
        ev === 'full' && !celebrated.current.full[p] ? 'full' : !celebrated.current.bingo[p] ? 'bingo' : null
      if (kind === 'full') celebrated.current.full[p] = true
      if (kind) celebrated.current.bingo[p] = true
      const reduced = prefersReducedMotion()

      // Schritt 2: Linie zieht sich, Wingo jubelt, Glöckchen.
      const reveal = () => {
        setHeldLines(NO_LINES)
        setFreshLines(newIds)
        playSfx(ev === 'full' ? 'full' : 'bingo')
        haptic(kind ? 'celebrate' : 'success')
        speak(ev === 'full' ? 'full' : 'bingo', 'cheer', 'cheer')
      }
      if (reduced) {
        reveal()
      } else {
        // Schritt 1: nur Fund-Klang, Kachel klappt um (pop), Linie noch verborgen.
        playSfx('found')
        haptic('light')
        setHeldLines(newIds)
        later(STEP_LINE, reveal)
      }
      // Schritt 3: Feier-Overlay (nur beim ersten Bingo bzw. bei voller Karte).
      if (kind) {
        lock(true)
        later(reduced ? STEP_PARTY_REDUCED : STEP_PARTY, () => {
          setParty((prev) => ({ kind, n: (prev?.n ?? 0) + 1 }))
          lock(false)
        })
      }
    } else if (ev === 'almost') {
      playSfx('almost')
      haptic('success')
      speak('almost', 'surprised', 'hop')
    } else {
      playSfx('found')
      haptic('light')
      speak('found', 'happy', 'hop', { thing, count: after.size })
    }
  }

  const markFound = (idx: number) => change(idx, 'add')
  const toggle = (idx: number) => change(idx, 'toggle')

  // Stabile Kachel-Handler (Index-basiert), damit die memoisierten Kacheln
  // bei Wingos Reaktionen nicht alle neu rendern.
  const changeRef = useRef(change)
  changeRef.current = change
  const onCellToggle = useCallback((idx: number) => {
    if (busyRef.current) return
    changeRef.current(idx, 'toggle')
  }, [])
  const onCellPhoto = useCallback((idx: number) => {
    if (busyRef.current) return
    playSfx('open')
    setCameraState({ idx, phase: 'choose' })
  }, [])
  const onCellInfo = useCallback((idx: number) => {
    if (busyRef.current) return
    playSfx('open')
    setModalIdx(idx)
  }, [])

  const selectPlayer = (i: number) => {
    if (i === activePlayer || busyRef.current) return
    playSfx('tap')
    setActivePlayer(i)
    setPop(null)
    // Wingo begrüßt die nächste Spielerin mit Namen.
    speak('switch', 'wave', 'hop', { player: playerName(i) })
  }

  const fotoCount = game.pool.filter((o) => o._media?.url).length
  const counts = found.map((s) => s.size)
  const bingos = found.map((s) => checkBingo(s))
  const closeModal = () => {
    playSfx('close')
    setModalIdx(null)
  }

  const hint = !HAS_CAMERA
    ? 'Tippe ein Feld, wenn du es gefunden hast. Das (i) zeigt dir mehr.'
    : infoViaTap
      ? 'Tippe ein Feld: Foto machen, abhaken oder mehr erfahren.'
      : 'Tippe ein Feld: Foto machen oder abhaken. Das (i) zeigt dir mehr.'

  const progress = (
    <ProgressBar found={playerFound.size} total={25} bingo={bingo} lines={shownLines.length || (full ? 12 : 0)} />
  )

  return (
    <section aria-label="Spielbrett" className="mx-auto w-full max-w-[600px] lg:max-w-none">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_272px] lg:grid-rows-[auto_auto_auto_1fr] lg:items-start lg:gap-x-6 lg:gap-y-3">
        {/* ── Kontext-Leiste (eine Plakette, vier Segmente) ─────── */}
        <div className="no-print mb-2 flex justify-center lg:col-start-2 lg:row-start-1 lg:mb-0 lg:justify-start">
          <ul
            aria-label="Spiel-Kontext"
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-[22px] border border-cream-line bg-cream/95 px-3.5 py-1.5 font-display text-[13.5px] font-medium leading-none text-forest-900 shadow-[0_2px_0_rgba(110,68,38,.15),0_6px_14px_rgba(15,38,23,.12)]"
          >
            <ContextItem icon={<SeasonIcon season={ctx.season} size={16} />} label={SEASON_LABEL[ctx.season]} />
            <ContextItem
              icon={<WeatherIcon weather={ctx.weather} size={16} />}
              label={ctx.weather ? WEATHER_LABEL[ctx.weather] : 'Wetter offen'}
            />
            <ContextItem icon={<TimeIcon time={ctx.time} size={16} />} label={TIME_LABEL[ctx.time]} />
            <ContextItem icon={<HabitatIcon habitat={ctx.habitat} size={16} />} label={HABITAT_LABEL[ctx.habitat]} />
          </ul>
        </div>

        {/* ── Spieler ──────────────────────────────────────── */}
        {/* w-0 + min-w-full: Die (evtl. lange, wischbare) Tab-Leiste darf die
            Breite des Bretts nie aufblähen. */}
        {(isShared || game.cards.length > 1) && (
          <div className="mb-1 w-0 min-w-full lg:col-start-2 lg:row-start-2">
            {isShared ? (
              <div className="flex justify-center lg:justify-start">
                <SelfPlayerBadge index={activePlayer} players={game.players} />
              </div>
            ) : (
              <PlayerTabs
                count={game.cards.length}
                active={activePlayer}
                onSelect={selectPlayer}
                counts={counts}
                bingos={bingos}
                className="justify-start sm:justify-center lg:justify-start"
              />
            )}
          </div>
        )}

        {/* ── Brett mit Wingo ──────────────────────────────── */}
        {/* Desktop: Brett passt in die Fensterhöhe (alle 5 Reihen ohne Scrollen). */}
        <div className="relative mx-auto mt-[74px] w-full max-w-[560px] lg:col-start-1 lg:row-span-4 lg:row-start-1 lg:mt-[86px] lg:max-w-[min(600px,calc((100dvh-190px)*0.82))]">
          <div className="pointer-events-none absolute bottom-[calc(100%-13px)] left-0 right-0 z-20 flex items-end gap-1 pl-1 sm:pl-3">
            <div ref={peekRef} className="flex-none">
              <Wingo
                variant="peek"
                mood={say.mood}
                size={wide ? 150 : 118}
                season={ctx.season}
                weather={ctx.weather}
                night={night}
                talking={talking}
                title=""
              />
            </div>
            <div className="mb-[22px] min-w-0 flex-1 pr-1">
              {/* Blase bleibt dasselbe Element (aria-live wird zuverlässig vorgelesen). */}
              <div ref={bubbleRef} className="w-fit max-w-full origin-bottom-left">
                <SpeechBubble tail="left" className="!px-3.5 !py-2 !text-[14px] sm:!text-[15px]">
                  {say.text}
                </SpeechBubble>
              </div>
            </div>
          </div>

          <div
            className={`gb-board relative rounded-[24px] border-2 p-1.5 pt-5 sm:rounded-[32px] sm:p-3 sm:pt-6 ${
              full
                ? 'gb-board-full border-sun-dark pb-7 shadow-[0_6px_0_#b8861a,0_0_0_3px_rgba(255,224,138,.55),0_16px_36px_rgba(15,38,23,.32)] sm:pb-8'
                : 'border-wood-dark shadow-[0_6px_0_#6e4426,0_16px_32px_rgba(15,38,23,.32)]'
            }`}
          >
            <div className="gb-tray rounded-[19px] p-1 sm:rounded-[24px] sm:p-2.5">
              <div
                ref={gridRef}
                aria-busy={busy || undefined}
                className={`relative grid grid-cols-5 gap-[6px] sm:gap-2.5 ${busy ? 'pointer-events-none' : ''}`}
              >
                {card.map((o, idx) => (
                  <Cell
                    key={idx}
                    o={o}
                    idx={idx}
                    found={playerFound.has(idx)}
                    golden={goldenCells.has(idx)}
                    hot={status.hotCells.has(idx)}
                    pop={pop?.idx === idx ? pop.n : 0}
                    season={ctx.season}
                    hasCamera={HAS_CAMERA}
                    infoViaTap={infoViaTap}
                    onToggle={onCellToggle}
                    onPhoto={onCellPhoto}
                    onInfo={onCellInfo}
                  />
                ))}
                <BingoLinesOverlay gridRef={gridRef} lines={full ? [] : shownLines} fresh={freshLines} />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 lg:hidden">{progress}</div>
            {full && <MasterPlaque />}
          </div>
        </div>

        {/* ── Fortschritt (Desktop: Seitenleiste) ──────────── */}
        <div className="hidden lg:col-start-2 lg:row-start-3 lg:block">{progress}</div>

        {/* ── Hinweis + Aktionen ───────────────────────────── */}
        <div className="no-print lg:col-start-2 lg:row-start-4">
          {/* Stupsi gibt Tipps (Figuren-Bibel). */}
          <div className="mx-auto mt-4 flex w-fit max-w-full items-end gap-1 lg:mt-0">
            <div className="-mb-1 flex-none">
              <Friend id="stupsi" size={night ? 46 : 42} mood={night ? 'sleep' : 'idle'} title="" />
            </div>
            <p className="wb-glass-strong min-w-0 rounded-[18px] px-3.5 py-2 font-display text-[13.5px] font-medium leading-snug text-forest-900 shadow-wb1 backdrop-blur-md">
              {hint}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            <GameButton
              variant="secondary"
              size="md"
              icon={<UsersIcon size={20} />}
              onClick={onInvite}
              className="!px-3"
            >
              Einladen
            </GameButton>
            <GameButton
              variant="secondary"
              size="md"
              icon={<PrinterIcon size={20} />}
              onClick={() => onPrint(false)}
              className="!px-3"
            >
              Drucken
            </GameButton>
            <GameButton
              variant="secondary"
              size="md"
              icon={<BookIcon size={20} />}
              onClick={() => onPrint(true)}
              className="!px-3"
            >
              Info-Seite
            </GameButton>
            <GameButton
              variant="secondary"
              size="md"
              icon={<SproutIcon size={20} />}
              onClick={onExit}
              className="!px-3"
            >
              Neues Spiel
            </GameButton>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 lg:justify-start">
            <Badge
              tone="glass"
              icon={<CameraIcon size={15} className="text-forest-600" />}
              title="Felder mit echtem Artenfoto (regionale Live-Arten)"
            >
              {fotoCount > 0 ? `${fotoCount} Foto-Arten` : 'Bilder-Karte'}
            </Badge>
            <Badge tone="glass" icon={<SeedIcon size={15} />} title="Karten-Code (Seed)">
              <span className="font-mono text-[12px]">{game.seedStr}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Overlays liegen per Portal direkt in <body> (siehe fx/Portal). */}
      <Portal>
        {modalIdx !== null && (
          <InfoModal
            o={card[modalIdx]}
            found={playerFound.has(modalIdx)}
            onToggleFound={() => {
              toggle(modalIdx)
              setModalIdx(null)
            }}
            onClose={closeModal}
          />
        )}

        {/* Auswahl-Modal: Foto oder Manuell */}
        {cameraState?.phase === 'choose' && (
          <ChooseModal
            o={card[cameraState.idx]}
            season={ctx.season}
            weather={ctx.weather}
            night={night}
            line={wingoLine('choose', lineCtx, cameraState.idx % 2)}
            onPhoto={() => {
              playSfx('tap')
              setCameraState({ ...cameraState, phase: 'camera' })
            }}
            onManual={() => {
              markFound(cameraState.idx)
              setCameraState(null)
            }}
            onInfo={() => {
              const idx = cameraState.idx
              setCameraState(null)
              setModalIdx(idx)
            }}
            onClose={() => {
              playSfx('close')
              setCameraState(null)
            }}
          />
        )}

        {/* Kamera-Flow */}
        {cameraState?.phase === 'camera' && (
          <CameraCapture
            targetName={card[cameraState.idx].name}
            onCapture={(canvas) => setCameraState({ ...cameraState, phase: 'verify', canvas })}
            onClose={() => setCameraState(null)}
          />
        )}

        {cameraState?.phase === 'verify' && cameraState.canvas && (
          <PhotoVerify
            canvas={cameraState.canvas}
            target={card[cameraState.idx]}
            season={ctx.season}
            weather={ctx.weather}
            night={night}
            onConfirm={() => {
              markFound(cameraState.idx)
              setCameraState(null)
            }}
            onRetry={() => setCameraState({ idx: cameraState.idx, phase: 'camera' })}
            onCancel={() => setCameraState(null)}
          />
        )}

        {party && (
          <Celebration
            key={party.n}
            kind={party.kind}
            line={wingoLine(party.kind, { ...lineCtx, count: playerFound.size }, party.n)}
            season={ctx.season}
            weather={ctx.weather}
            night={night}
            found={playerFound.size}
            lines={status.complete.length}
            onClose={() => {
              playSfx('tap')
              setParty(null)
            }}
          />
        )}
      </Portal>
    </section>
  )
}

/** Volle Karte: goldenes Namensschild mit Eichel-Krone am unteren Brettrand. */
function MasterPlaque() {
  return (
    <div className="gb-plaque pointer-events-none absolute -bottom-[18px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-sun-dark bg-gradient-to-b from-[#fff4c9] to-sun-light py-1 pl-1.5 pr-4 font-display text-[16px] font-semibold text-wood-lip shadow-[0_3px_0_#b8861a,0_8px_16px_rgba(15,38,23,.25)]">
      <svg viewBox="0 0 32 24" width="30" height="22" aria-hidden="true" className="flex-none">
        <path d="M4 20 2.5 7l7 5L16 3l6.5 9 7-5L28 20Z" fill="#f3c44d" stroke="#b8861a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 20h24" stroke="#b8861a" strokeWidth="2" strokeLinecap="round" />
        <g stroke="#6e4426" strokeWidth="1.4">
          <ellipse cx="16" cy="4.6" rx="2.6" ry="3" fill="#b98352" />
          <ellipse cx="2.8" cy="7.4" rx="2.2" ry="2.5" fill="#b98352" />
          <ellipse cx="29.2" cy="7.4" rx="2.2" ry="2.5" fill="#b98352" />
        </g>
        <path d="M13.6 3.4h4.8M0.9 6.4h3.8M27.3 6.4h3.8" stroke="#6e4426" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="15" r="2.2" fill="#e85d75" stroke="#b8861a" strokeWidth="1.2" />
      </svg>
      Waldmeister
    </div>
  )
}

function ContextItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-1 whitespace-nowrap">
      {icon}
      {label}
    </li>
  )
}
