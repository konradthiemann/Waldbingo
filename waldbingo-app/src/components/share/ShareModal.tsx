import { useEffect, useState } from 'react'
import { uploadGame } from '../../lib/api'
import type { GameState } from '../../lib/game-state'
import { toShared } from '../../lib/game-state'
import { buildCodeUrl, buildSelfContainedUrl } from '../../lib/share'
import { Glyph } from '../Svg'
import { QrCode } from './QrCode'

interface Props {
  game: GameState
  online: boolean
  onClose: () => void
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Host-Einladung: bietet zwei Wege, wie Mitspieler beitreten können.
 *  1) Kurzer Code (über den Server) – zum Eintippen.
 *  2) Selbst-enthaltener Link/QR – funktioniert auch ohne Server/offline.
 */
export function ShareModal({ game, online, onClose }: Props) {
  const [code, setCode] = useState<string | null>(null)
  const [codeState, setCodeState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [copied, setCopied] = useState<string | null>(null)

  const selfUrl = buildSelfContainedUrl(toShared(game))
  const codeUrl = code ? buildCodeUrl(code) : null
  // QR bevorzugt den kurzen Code-Link (passt sicher), sonst den vollen Link.
  const qrValue = codeUrl ?? selfUrl

  useEffect(() => {
    if (!online) {
      setCodeState('error')
      return
    }
    let alive = true
    setCodeState('loading')
    uploadGame(toShared(game))
      .then((c) => {
        if (!alive) return
        setCode(c)
        setCodeState('ok')
      })
      .catch(() => {
        if (alive) setCodeState('error')
      })
    return () => {
      alive = false
    }
  }, [game, online])

  async function doCopy(label: string, text: string) {
    if (await copy(text)) {
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1800)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Mitspieler einladen"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white p-5 shadow-wb2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <Glyph name="users" className="block h-6 w-6 text-forest-600" />
          <h2 className="text-[18px] font-extrabold text-forest-900">Mitspieler einladen</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="focus-ring ml-auto grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-line-2"
          >
            <Glyph name="close" className="block h-4 w-4" />
          </button>
        </div>

        {game.players < 2 && (
          <div className="mb-3 rounded-lg border border-amber/40 bg-[#fff7e6] px-3 py-2 text-[12.5px] text-amber-600">
            Du hast nur <b>1 Spieler</b> eingestellt. Erstelle ein Spiel mit mehr Spielern, damit alle
            eine eigene Karte bekommen.
          </div>
        )}

        {/* ── Weg 1: kurzer Code ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-line bg-forest-100/40 p-4">
          <div className="mb-1.5 text-[12.5px] font-bold uppercase tracking-wide text-forest-700">
            1 · Mit Code beitreten
          </div>
          {codeState === 'loading' && (
            <p className="py-2 text-[14px] text-muted">Code wird erstellt…</p>
          )}
          {codeState === 'ok' && code && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border-[1.5px] border-forest-300 bg-white px-3 py-2.5 text-center font-mono text-[28px] font-extrabold tracking-[0.18em] text-forest-900">
                  {code}
                </div>
                <button
                  type="button"
                  onClick={() => doCopy('code', code)}
                  className="focus-ring grid h-12 w-12 flex-none place-items-center rounded-lg border-[1.5px] border-forest-300 bg-white text-forest-700 hover:bg-forest-100"
                  aria-label="Code kopieren"
                >
                  <Glyph name="copy" className="block h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-[12.5px] text-muted">
                {copied === 'code' ? '✓ Code kopiert!' : 'Die anderen tippen ihn unter „Spiel beitreten" ein.'}
              </p>
            </>
          )}
          {codeState === 'error' && (
            <p className="py-1 text-[13px] text-muted">
              Kein Code verfügbar (offline oder Server nicht erreichbar). Nutze den Link oder QR-Code
              unten – der funktioniert immer.
            </p>
          )}
        </div>

        {/* ── Weg 2: Link / QR ───────────────────────────────────────────── */}
        <div className="mt-3 rounded-xl border border-line p-4">
          <div className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-forest-700">
            2 · Mit Link oder QR-Code
          </div>
          <div className="flex flex-col items-center gap-3">
            <QrCode value={qrValue} size={210} />
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => doCopy('link', codeUrl ?? selfUrl)}
                className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-[1.5px] border-forest-300 bg-white px-4 py-2.5 text-[14px] font-bold text-forest-700 hover:bg-forest-100"
              >
                <Glyph name="link" className="block h-4 w-4" />
                {copied === 'link' ? '✓ Link kopiert' : 'Link kopieren'}
              </button>
            </div>
            <p className="text-center text-[12px] text-muted">
              QR scannen oder Link teilen. Die anderen wählen dann ihre Spielernummer.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-4 w-full rounded-lg bg-gradient-to-br from-forest-600 to-forest-700 px-4 py-3 text-[15px] font-bold text-white"
        >
          Fertig
        </button>
      </div>
    </div>
  )
}
