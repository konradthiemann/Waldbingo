import { useEffect, useState } from 'react'
import { fetchGameByCode } from '../../lib/api'
import type { GameState } from '../../lib/game-state'
import { gameFromShared } from '../../lib/game-state'
import type { SharedGame } from '../../lib/share'
import { HABITAT_LABEL, SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { Glyph } from '../Svg'

interface Props {
  /** Direkt mitgegebenes Spiel (z. B. aus einem geöffneten Link). */
  initialShared?: SharedGame
  /** Vorbefüllter Code (z. B. aus ?j=CODE). */
  initialCode?: string
  onJoin: (game: GameState) => void
  onCancel: () => void
}

export function JoinView({ initialShared, initialCode, onJoin, onCancel }: Props) {
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
    setLoading(true)
    setError(null)
    try {
      setShared(await fetchGameByCode(clean))
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

  function pick(playerIndex: number) {
    if (!shared) return
    onJoin(gameFromShared(shared, playerIndex))
  }

  // ── Spieler-Auswahl (Spiel ist geladen) ───────────────────────────────────
  if (shared) {
    const pills: Array<{ glyph: string; label: string }> = [
      { glyph: 'season', label: SEASON_LABEL[shared.ctx.season] },
      { glyph: 'weather', label: shared.ctx.weather ? WEATHER_LABEL[shared.ctx.weather] : '–' },
      { glyph: 'clock', label: TIME_LABEL[shared.ctx.time] },
      { glyph: 'habitat', label: HABITAT_LABEL[shared.ctx.habitat] },
    ]
    return (
      <section className="mb-[18px] rounded-xl border border-line bg-white p-5 shadow-wb2">
        <div className="mb-2 flex items-center gap-2.5">
          <Glyph name="users" className="block h-6 w-6 text-forest-600" />
          <h2 className="text-[18px] font-extrabold text-forest-900">Welcher Spieler bist du?</h2>
        </div>
        <p className="mb-3 text-[13px] text-muted">
          Du trittst einem Spiel bei. Sprich dich mit den anderen ab, wer welche Nummer nimmt –
          jede Nummer bekommt eine andere Kartenreihenfolge.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {pills.map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[7px] rounded-full border border-[#cfe6d6] bg-forest-100 px-3 py-[7px] text-[13px] font-semibold text-forest-900"
            >
              <Glyph name={p.glyph} className="block h-[15px] w-[15px] text-forest-600" />
              <b>{p.label}</b>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {Array.from({ length: shared.players }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              className="focus-ring rounded-xl border-[1.5px] border-forest-300 bg-white px-3 py-4 text-[15px] font-bold text-forest-700 shadow-wb1 transition hover:bg-forest-100 active:translate-y-px"
            >
              Spieler {i + 1}
              {i === 0 && <span className="ml-1 text-[11px] font-medium text-muted">(Host)</span>}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="focus-ring mt-5 inline-flex items-center gap-2 text-[13.5px] font-semibold text-muted hover:text-forest-700"
        >
          <Glyph name="back" className="block h-4 w-4" />
          Abbrechen
        </button>
      </section>
    )
  }

  // ── Code-Eingabe (kein Spiel geladen) ──────────────────────────────────────
  return (
    <section className="mb-[18px] rounded-xl border border-line bg-white p-5 shadow-wb2">
      <div className="mb-2 flex items-center gap-2.5">
        <Glyph name="users" className="block h-6 w-6 text-forest-600" />
        <h2 className="text-[18px] font-extrabold text-forest-900">Spiel beitreten</h2>
      </div>
      <p className="mb-3 text-[13px] text-muted">
        Gib den Einladungs-Code ein, den du bekommen hast. Oder öffne den geteilten Link / scanne
        den QR-Code – dann geht es direkt weiter.
      </p>

      <label className="mb-1.5 block text-[12px] font-semibold text-muted" htmlFor="join-code">
        Einladungs-Code
      </label>
      <div className="flex gap-2">
        <input
          id="join-code"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void loadCode(code)
          }}
          placeholder="z. B. K7P2QF"
          className="focus-ring flex-1 rounded-lg border-[1.5px] border-line px-3 py-3 text-center font-mono text-[22px] font-bold tracking-[0.15em] text-forest-900"
        />
      </div>

      {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => void loadCode(code)}
        disabled={loading}
        className="focus-ring mt-4 flex w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-br from-forest-600 to-forest-700 px-6 py-3.5 text-[16px] font-bold text-white shadow-wb2 transition active:translate-y-px disabled:opacity-70"
      >
        <Glyph name="users" className="block h-5 w-5" />
        {loading ? 'Wird geladen…' : 'Beitreten'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="focus-ring mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-muted hover:text-forest-700"
      >
        <Glyph name="back" className="block h-4 w-4" />
        Zurück
      </button>
    </section>
  )
}
