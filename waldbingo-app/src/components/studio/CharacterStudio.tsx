// Studio-Abschnitt des Charakter-Bereichs (`/?studio=figuren`).
// Werkbank zum Abnehmen der Figuren: Wingo in allen Stimmungen und Größen,
// Accessoire-Matrix, peek-Variante auf einer Brett-Kante, Waldfreunde,
// Spieler-Avatare, Sprechblasen und Dialog-Vorschau. Kontext kommt aus der
// Studio-Szene (Jahreszeit/Wetter/Tageszeit oben im Studio).
import { type ReactNode, useState } from 'react'
import type { Jahreszeit, Wetter } from '../../data/types'
import { SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import type { SceneInput } from '../../lib/scene'
import { WINGO_SITUATIONS, type WingoSituation, wingoLine, wingoLines, wingoMood } from '../../lib/wingo-lines'
import { FRIEND_MOODS, FRIEND_ORDER, FRIENDS, Friend, PlayerAvatar, playerName } from '../characters/Friends'
import { WINGO_MOODS, Wingo, type WingoMood, wingoGear } from '../characters/Wingo'
import { WingoSays } from '../characters/WingoSays'
import { GameButton, Panel } from '../ui'

const MOOD_LABEL: Record<WingoMood, string> = {
  idle: 'idle · ruhig',
  happy: 'happy · froh',
  cheer: 'cheer · Jubel',
  wave: 'wave · winkt',
  think: 'think · grübelt',
  sleep: 'sleep · schläft',
  surprised: 'surprised · staunt',
  sad: 'sad · traurig',
}

const SITUATION_LABEL: Record<WingoSituation, string> = {
  welcome: 'Begrüßung',
  welcomeBack: 'Wiederkommen',
  setup: 'Expedition planen',
  creating: 'Karte entsteht',
  start: 'Spielstart',
  found: 'Fund',
  unfound: 'Abgewählt',
  almost: 'Fast Bingo',
  bingo: 'Bingo',
  full: 'Volle Karte',
  idle: 'Tipp',
  switch: 'Spielerwechsel',
  choose: 'Foto oder abhaken?',
  join: 'Beitreten',
  error: 'Fehler',
}

/** Kontexte für die Accessoire-Matrix. */
const GEAR_CASES: { label: string; season: Jahreszeit; weather: Wetter | null; night?: boolean; mood?: WingoMood }[] = [
  { label: 'Frühling · Kranz + Blüte', season: 'fruehling', weather: 'klar' },
  { label: 'Sommer · frisches Blatt', season: 'sommer', weather: 'klar' },
  { label: 'Herbst · rotes Blatt + Eichel', season: 'herbst', weather: 'bewoelkt' },
  { label: 'Winter · Schneehäubchen', season: 'winter', weather: 'klar' },
  { label: 'Regen · Südwester', season: 'sommer', weather: 'regen', mood: 'happy' },
  { label: 'Frühling + Regen · Hut statt Kranz', season: 'fruehling', weather: 'regen' },
  { label: 'Schnee · Schal', season: 'winter', weather: 'schnee', mood: 'happy' },
  { label: 'Frost · Schal', season: 'herbst', weather: 'frost' },
  { label: 'Wind · Zotteln wehen', season: 'sommer', weather: 'wind', mood: 'surprised' },
  { label: 'Nacht · Laterne', season: 'sommer', weather: 'klar', night: true },
  { label: 'Herbst-Nacht · Laterne', season: 'herbst', weather: 'nebel', night: true, mood: 'think' },
  { label: 'Winternacht · schläft', season: 'winter', weather: 'schnee', night: true, mood: 'sleep' },
]

export function CharacterStudio({ scene }: { scene: SceneInput }) {
  const night = scene.time === 'nacht' || scene.time === 'daemmerung'
  const ctx = { season: scene.season, weather: scene.weather, night }
  const lineCtx = { season: scene.season, weather: scene.weather, time: scene.time }

  const [mood, setMood] = useState<WingoMood>('wave')
  const [variant, setVariant] = useState<'full' | 'peek' | 'face'>('full')
  const [talking, setTalking] = useState(false)
  const [situation, setSituation] = useState<WingoSituation>('welcome')
  const [lineVariant, setLineVariant] = useState(0)

  const gear = wingoGear(scene.season, scene.weather, night)
  const gearList = [
    gear.hat && 'Südwester',
    gear.scarf && 'Schal',
    gear.snowCaps && 'Schneehäubchen',
    gear.wreath && 'Gänseblümchen-Kranz',
    gear.sprout === 'bloom' && 'Blüte am Hörnchen',
    gear.sprout === 'leaf' && 'frisches Blatt',
    gear.sprout === 'redLeaf' && 'rotes Blatt',
    gear.acorn && 'Eichel',
    gear.lantern && 'Laterne',
    gear.windy && 'Wind-Zotteln',
  ].filter(Boolean)

  const line = wingoLine(situation, { ...lineCtx, thing: 'Fliegenpilz', count: 3 }, lineVariant)
  const poolSize = wingoLines(situation, { ...lineCtx, thing: 'Fliegenpilz', count: 3 }).length

  return (
    <div className="space-y-6 pb-4">
      {/* ── Bühne ─────────────────────────────────────────────── */}
      <Panel variant="glass" sign="Wingo · Bühne">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="grid w-full place-items-center sm:w-auto sm:flex-none">
            <div className={variant === 'peek' ? 'w-[260px]' : ''}>
              <Wingo mood={mood} size={260} variant={variant} talking={talking} {...ctx} />
              {variant === 'peek' && <BoardEdge />}
            </div>
          </div>
          <div className="w-full min-w-0 space-y-3">
            <ChipRow label="Stimmung">
              {WINGO_MOODS.map((m) => (
                <Chip key={m} on={m === mood} onClick={() => setMood(m)}>
                  {m}
                </Chip>
              ))}
            </ChipRow>
            <ChipRow label="Variante">
              {(['full', 'peek', 'face'] as const).map((v) => (
                <Chip key={v} on={v === variant} onClick={() => setVariant(v)}>
                  {v}
                </Chip>
              ))}
              <Chip on={talking} onClick={() => setTalking((t) => !t)}>
                spricht
              </Chip>
            </ChipRow>
            <p className="rounded-lg bg-white/70 px-3 py-2 text-[13px] text-forest-900">
              <b className="font-display">Kontext:</b> {SEASON_LABEL[scene.season]} ·{' '}
              {scene.weather ? WEATHER_LABEL[scene.weather] : 'Wetter unbekannt'} · {TIME_LABEL[scene.time]}
              <br />
              <b className="font-display">Accessoires:</b> {gearList.length ? gearList.join(', ') : '–'}
            </p>
          </div>
        </div>
      </Panel>

      {/* ── Stimmungen × Größen ────────────────────────────────── */}
      <Panel sign="Stimmungen × Größen">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
          {WINGO_MOODS.map((m) => (
            <figure key={m} className="flex flex-col items-center gap-1">
              <Wingo mood={m} size={150} {...ctx} />
              <div className="flex items-end gap-2">
                <Wingo mood={m} size={72} {...ctx} className="hidden sm:block" />
                <Wingo mood={m} size={48} {...ctx} />
                <span className="grid h-[44px] w-[44px] place-items-center overflow-hidden rounded-full bg-cream-2 ring-2 ring-moss">
                  <Wingo mood={m} size={44} variant="face" {...ctx} />
                </span>
              </div>
              <figcaption className="font-display text-[13px] font-medium text-muted">{MOOD_LABEL[m]}</figcaption>
            </figure>
          ))}
        </div>
      </Panel>

      {/* ── Accessoire-Matrix ──────────────────────────────────── */}
      <Panel sign="Accessoires nach Kontext">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
          {GEAR_CASES.map((g) => (
            <figure key={g.label} className="flex flex-col items-center gap-1">
              <div className={`grid w-full place-items-center rounded-xl py-2 ${g.night ? 'bg-night' : 'bg-sky-light/60'}`}>
                <Wingo mood={g.mood ?? 'idle'} size={136} season={g.season} weather={g.weather} night={g.night} />
              </div>
              <figcaption className="text-center text-[12.5px] font-semibold leading-tight text-forest-900">{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </Panel>

      {/* ── Peek ───────────────────────────────────────────────── */}
      <Panel sign="peek · über der Brett-Kante">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {(['idle', 'happy', 'wave', 'cheer', 'think', 'surprised', 'sad', 'sleep'] as WingoMood[]).map((m, i) => {
            const c = GEAR_CASES[(i * 3) % GEAR_CASES.length]
            return (
              <figure key={m} className="flex flex-col items-center">
                <div className="w-full max-w-[170px]">
                  <Wingo mood={m} size={170} variant="peek" season={c.season} weather={c.weather} night={c.night} />
                  <BoardEdge />
                </div>
                <figcaption className="mt-2 text-center text-[12px] text-muted">
                  {m} · {c.label.split(' · ')[0]}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </Panel>

      {/* ── Waldfreunde ────────────────────────────────────────── */}
      <Panel sign="Waldfreunde">
        <div className="space-y-5">
          {FRIEND_ORDER.map((id) => (
            <div key={id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="sm:w-[150px] sm:flex-none">
                <div className="font-display text-[18px] font-semibold text-forest-900">{FRIENDS[id].name}</div>
                <div className="text-[12.5px] leading-tight text-muted">
                  {FRIENDS[id].species} · {FRIENDS[id].role}
                </div>
              </div>
              <div className="grid flex-1 grid-cols-4 items-end gap-1">
                {FRIEND_MOODS.map((m) => (
                  <figure key={m} className="flex flex-col items-center">
                    <Friend id={id} mood={m} size={104} className="h-auto w-full max-w-[104px]" />
                    <figcaption className="text-[11.5px] text-muted">{m}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-end gap-3 border-t-2 border-dashed border-cream-line pt-4">
            {FRIEND_ORDER.map((id) => (
              <Friend key={id} id={id} size={48} />
            ))}
            {FRIEND_ORDER.map((id) => (
              <span key={id} className="grid h-[40px] w-[40px] place-items-center overflow-hidden rounded-full bg-cream-2 ring-2 ring-cream-line">
                <Friend id={id} size={40} framing="face" />
              </span>
            ))}
          </div>
        </div>
      </Panel>

      {/* ── Avatare ────────────────────────────────────────────── */}
      <Panel sign="Spieler-Avatare 1–10">
        <div className="grid grid-cols-5 gap-y-4 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <PlayerAvatar index={i} size={48} active={i === 0} />
              <span className="font-display text-[12.5px] font-medium text-forest-900">{playerName(i)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-cream-line pt-4">
          {Array.from({ length: 10 }, (_, i) => (
            <PlayerAvatar key={i} index={i} size={32} active={i === 6} />
          ))}
        </div>
      </Panel>

      {/* ── WingoSays ──────────────────────────────────────────── */}
      <Panel sign="Wingo spricht">
        <div className="space-y-5">
          <ChipRow label="Situation">
            {WINGO_SITUATIONS.map((s) => (
              <Chip
                key={s}
                on={s === situation}
                onClick={() => {
                  setSituation(s)
                  setLineVariant(0)
                }}
              >
                {SITUATION_LABEL[s]}
              </Chip>
            ))}
          </ChipRow>
          <WingoSays mood={wingoMood(situation)} size={112} {...ctx}>
            {line}
          </WingoSays>
          <div className="flex flex-wrap items-center gap-3">
            <GameButton variant="secondary" size="sm" onClick={() => setLineVariant((v) => v + 1)}>
              Nächster Spruch
            </GameButton>
            <span className="text-[12.5px] text-muted">
              Variante {(lineVariant % poolSize) + 1} von {poolSize} · {line.length} Zeichen
            </span>
          </div>
          <div className="grid gap-4 border-t-2 border-dashed border-cream-line pt-4 sm:grid-cols-2">
            <WingoSays mood="happy" size={84} side="right" {...ctx}>
              {wingoLine('found', { ...lineCtx, thing: 'Eichhörnchen', count: 5 })}
            </WingoSays>
            <WingoSays mood="think" size={56} variant="face" {...ctx} bubbleClassName="text-[14px]">
              {wingoLine('idle', lineCtx, 1)}
            </WingoSays>
          </div>
          <WingoSays side="top" mood="cheer" size={150} {...ctx} className="pt-2">
            {wingoLine('bingo', lineCtx)}
          </WingoSays>
        </div>
      </Panel>

      {/* ── Dialog-Vorschau ────────────────────────────────────── */}
      <Panel sign="Dialog im aktuellen Kontext">
        <ul className="divide-y divide-cream-line">
          {WINGO_SITUATIONS.map((s) => (
            <li key={s} className="flex gap-3 py-2 text-[13.5px]">
              <span className="w-[120px] flex-none font-display font-semibold text-forest-800">{SITUATION_LABEL[s]}</span>
              <span className="min-w-0 text-ink">
                {wingoLine(s, { ...lineCtx, thing: 'Fliegenpilz', count: 1 })}
                <span className="ml-1 text-[11.5px] text-muted">
                  (+{wingoLines(s, { ...lineCtx, thing: 'Fliegenpilz', count: 1 }).length - 1})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* ── App-Icon ───────────────────────────────────────────── */}
      <Panel sign="App-Icon (public/wingo-face.svg)">
        <div className="flex flex-wrap items-end gap-4">
          {[180, 96, 64, 48, 32, 16].map((s) => (
            <img key={s} src="/wingo-face.svg" width={s} height={s} alt={s === 180 ? 'Wingo-App-Icon' : ''} />
          ))}
        </div>
      </Panel>
    </div>
  )
}

/** Holzkante als Prüf-Untergrund für die peek-Variante. */
function BoardEdge() {
  return (
    <div
      aria-hidden="true"
      className="h-6 rounded-t-[10px] border-2 border-b-0 border-wood-dark bg-gradient-to-b from-wood-light to-wood shadow-[inset_0_3px_0_rgba(255,255,255,.35)]"
    />
  )
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-forest-800/70">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`focus-ring min-h-[34px] rounded-full border px-3 py-1 font-display text-[13px] font-medium transition ${
        on ? 'border-forest-700 bg-forest-600 text-white' : 'border-cream-line bg-white/80 text-forest-900 hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}
