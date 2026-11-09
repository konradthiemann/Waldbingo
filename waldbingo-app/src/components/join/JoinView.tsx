import { useEffect, useState } from 'react'
import type { SpielKontext } from '../../data/types'
import { fetchGameByCode } from '../../lib/api'
import { gameFromShared, type GameState } from '../../lib/game-state'
import { HABITAT_LABEL, SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { playSfx } from '../../lib/sfx'
import type { SharedGame } from '../../lib/share'
import { wingoLine } from '../../lib/wingo-lines'
import { PlayerAvatar, playerName } from '../characters/Friends'
import { WingoSays } from '../characters/WingoSays'
import { SeasonIcon, TimeIcon, WeatherIcon } from '../dashboard/SceneIcons'
import { HabitatIcon } from '../game/icons'
import { BackIcon, FriendsIcon } from '../home/ShellIcons'
import { Badge, GameButton, IconButton, Panel } from '../ui'

interface Props {
  /** Direkt mitgegebenes Spiel (z. B. aus einem geöffneten Link). */
  initialShared?: SharedGame
  /** Vorbefüllter Code (z. B. aus ?j=CODE). */
  initialCode?: string
  onJoin: (game: GameState) => void
  onCancel: () => void
  /** Meldet den Kontext des geladenen Spiels (Szene wechselt schon bei der Spielerwahl). */
  onContext?: (ctx: SpielKontext) => void
}

const CODE_LEN = 6

export function JoinView({ initialShared, initialCode, onJoin, onCancel, onContext }: Props) {
  const [shared, setShared] = useState<SharedGame | null>(initialShared ?? null)
  const [code, setCode] = useState(initialCode ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadCode(c: string) {
    const clean = c.trim().toUpperCase()
    if (!clean) {
      setError('Bitte gib einen Code ein.')
      return
    }
    playSfx('tap')
    setLoading(true)
    setError(null)
    try {
      setShared(await fetchGameByCode(clean))
      playSfx('whoosh')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Beitreten fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  // Mit vorbefülltem Code (aus URL) automatisch laden.
  useEffect(() => {
    if (initialCode && !initialShared) void loadCode(initialCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Szene an das geladene Spiel anpassen.
  useEffect(() => {
    if (shared) onContext?.(shared.ctx)
  }, [shared, onContext])

  function pick(playerIndex: number) {
    if (!shared) return
    playSfx('tap')
    onJoin(gameFromShared(shared, playerIndex))
  }

  // Einladungs-Codes haben genau 6 Zeichen – „Beitreten“ erst dann aktiv.
  const codeComplete = code.trim().length >= CODE_LEN

  const back = (
    <IconButton label="Zurück" onClick={onCancel}>
      <BackIcon />
    </IconButton>
  )

  // ── Spieler-Auswahl (Spiel ist geladen) ───────────────────────────────────
  if (shared) {
    const { ctx } = shared
    const night = ctx.time === 'nacht' || ctx.time === 'daemmerung'
    return (
      <section className="pb-2">
        <div className="mb-1 flex items-center gap-3">
          {back}
          <h2 className="scene-title text-[27px] font-semibold leading-tight">Spiel gefunden!</h2>
        </div>
        <WingoSays mood="cheer" size={92} season={ctx.season} weather={ctx.weather} night={night}>
          {wingoLine('join', { season: ctx.season, weather: ctx.weather, time: ctx.time })}
        </WingoSays>

        <Panel as="div" sign="Wer bist du?">
          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            <Badge icon={<SeasonIcon season={ctx.season} size={18} />}>{SEASON_LABEL[ctx.season]}</Badge>
            <Badge icon={<WeatherIcon weather={ctx.weather} size={18} />}>
              {ctx.weather ? WEATHER_LABEL[ctx.weather] : 'Wetter offen'}
            </Badge>
            <Badge icon={<TimeIcon time={ctx.time} size={18} />}>{TIME_LABEL[ctx.time]}</Badge>
            <Badge icon={<HabitatIcon habitat={ctx.habitat} size={18} />}>{HABITAT_LABEL[ctx.habitat]}</Badge>
          </div>
          <p className="mb-4 text-center text-[13.5px] leading-snug text-muted">
            Sprecht euch ab, wer welche Figur nimmt – jede Figur bekommt eine eigene Karte.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: shared.players }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className="wb-stagger focus-ring flex w-[calc(50%-6px)] flex-col items-center rounded-[22px] sm:w-[calc(33.333%-8px)] border-2 border-cream-line bg-white px-2 pb-3 pt-3 shadow-[0_4px_0_#ead8b8,0_8px_14px_rgba(15,38,23,.08)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-[0_1px_0_#ead8b8]"
                style={{ ['--d' as string]: `${i * 60}ms` }}
              >
                <PlayerAvatar index={i} size={62} />
                <span className="mt-2 font-display text-[17px] font-semibold leading-tight text-forest-900">
                  {playerName(i)}
                </span>
                <span className="text-[12px] font-semibold text-muted">
                  Spieler {i + 1}
                  {i === 0 && ' · Host'}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    )
  }

  // ── Code-Eingabe (kein Spiel geladen) ──────────────────────────────────────
  return (
    <section className="pb-2">
      <div className="mb-1 flex items-center gap-3">
        {back}
        <h2 className="scene-title text-[27px] font-semibold leading-tight">Spiel beitreten</h2>
      </div>
      <WingoSays mood={loading ? 'think' : 'wave'} size={92}>
        {wingoLine('join')}
      </WingoSays>

      <Panel as="div" sign="Einladungs-Code">
        <p className="mb-3 text-center text-[13.5px] leading-snug text-muted">
          Gib den Code ein, den du bekommen hast. Oder öffne den Link / scanne den QR-Code – dann geht es
          direkt weiter.
        </p>

        <label className="sr-only" htmlFor="join-code">
          Einladungs-Code
        </label>
        <input
          id="join-code"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && codeComplete) void loadCode(code)
          }}
          placeholder="6 Zeichen, z. B. K7P2QF"
          aria-invalid={!!error}
          aria-describedby="join-code-hint"
          className={`focus-ring h-[68px] w-full rounded-[20px] border-[3px] bg-white px-3 text-center font-display text-[32px] font-semibold uppercase tracking-[0.28em] text-forest-900 shadow-[inset_0_3px_0_rgba(110,68,38,.08)] placeholder:text-[16px] placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-muted ${
            error ? 'border-berry' : 'border-cream-line'
          }`}
        />
        <p id="join-code-hint" className="sr-only">
          Der Code hat {CODE_LEN} Zeichen.
        </p>
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: CODE_LEN }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${i < code.length ? 'bg-forest-500' : 'bg-cream-3'}`}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-[14px] bg-berry-light/50 px-3 py-2 text-center text-[13.5px] font-semibold text-berry-dark">
            {error}
          </p>
        )}

        <GameButton
          variant="primary"
          size="lg"
          block
          className="mt-4"
          onClick={() => void loadCode(code)}
          disabled={loading || !codeComplete}
          icon={<FriendsIcon />}
        >
          {loading ? 'Wird geladen…' : 'Beitreten'}
        </GameButton>
        {!codeComplete && !loading && (
          <p className="mt-2 text-center text-[13px] font-medium text-muted">
            Noch {CODE_LEN - code.trim().length} Zeichen – dann kann es losgehen.
          </p>
        )}
      </Panel>
    </section>
  )
}
