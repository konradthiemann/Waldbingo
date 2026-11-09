import { useEffect, useState } from 'react'
import { uploadGame } from '../../lib/api'
import { type GameState, toShared } from '../../lib/game-state'
import { playSfx } from '../../lib/sfx'
import { buildCodeUrl, buildSelfContainedUrl } from '../../lib/share'
import { PlayerAvatar } from '../characters/Friends'
import { CheckIcon, CopyIcon, LinkIcon } from '../home/ShellIcons'
import { GameButton, Modal, WoodSign } from '../ui'
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
    playSfx('open')
  }, [])

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
      playSfx('tap')
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1800)
    }
  }

  function close() {
    playSfx('close')
    onClose()
  }

  const avatars = Math.min(Math.max(game.players, 3), 5)

  return (
    <Modal onClose={close} label="Mitspieler einladen" size="md" z={70}>
      {/* Kopf: Waldfreunde winken */}
      <div className="flex flex-col items-center pt-1 text-center">
        <div className="flex -space-x-2.5" aria-hidden="true">
          {Array.from({ length: avatars }, (_, i) => (
            <PlayerAvatar key={i} index={i} size={46} className="anim-pop-in ring-2 ring-cream" />
          ))}
        </div>
        <h2 className="mt-2 text-[24px] font-semibold leading-tight text-forest-900">Mitspieler einladen</h2>
        <p className="mt-0.5 text-[13.5px] text-muted">Jeder spielt auf seinem Handy – mit eigener Karte.</p>
      </div>

      {game.players < 2 && (
        <div className="mt-3 rounded-[16px] border-2 border-sun-dark/40 bg-sun-light/70 px-3 py-2 text-[13px] leading-snug text-wood-lip">
          Du hast nur <b>1 Spieler</b> eingestellt. Erstelle ein Spiel mit mehr Spielern, damit alle eine
          eigene Karte bekommen.
        </div>
      )}

      {/* ── Weg 1: kurzer Code ─────────────────────────────────────────── */}
      <section className="relative mt-7 rounded-[22px] border-2 border-cream-line bg-white px-4 pb-4 pt-6">
        <WoodSign className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[14px]">
          1 · Mit Code
        </WoodSign>
        {codeState === 'loading' && (
          <div className="flex items-center justify-center gap-1.5 py-3" aria-live="polite">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="h-12 w-9 animate-pulse rounded-[12px] bg-cream-2" />
            ))}
            <span className="sr-only">Code wird erstellt…</span>
          </div>
        )}
        {codeState === 'ok' && code && (
          <>
            <div className="flex items-center justify-center gap-2">
              <span className="sr-only">Code: {code.split('').join(' ')}</span>
              <div className="flex gap-1.5" aria-hidden="true">
                {code.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="anim-pop-in grid h-12 w-9 place-items-center rounded-[12px] border-2 border-forest-300 bg-forest-100 font-display text-[26px] font-semibold text-forest-900 shadow-[0_3px_0_#8ed3a0] sm:w-10"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void doCopy('code', code)}
                aria-label="Code kopieren"
                className="focus-ring grid h-12 w-12 flex-none place-items-center rounded-full border-2 border-cream-line bg-cream text-forest-700 shadow-[0_3px_0_#d9c39d] transition active:translate-y-[2px]"
              >
                {copied === 'code' ? <CheckIcon size={20} className="text-ok" /> : <CopyIcon />}
              </button>
            </div>
            <p className="mt-2.5 text-center text-[12.5px] text-muted" aria-live="polite">
              {copied === 'code' ? 'Code kopiert!' : 'Die anderen tippen ihn unter „Einem Spiel beitreten“ ein.'}
            </p>
          </>
        )}
        {codeState === 'error' && (
          <p className="py-1 text-center text-[13px] leading-snug text-muted">
            Kein Code verfügbar (offline oder Server nicht erreichbar). Nutze den Link oder QR-Code unten –
            der funktioniert immer.
          </p>
        )}
      </section>

      {/* ── Weg 2: Link / QR ───────────────────────────────────────────── */}
      <section className="relative mt-7 rounded-[22px] border-2 border-cream-line bg-white px-4 pb-4 pt-6">
        <WoodSign className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[14px]">
          2 · Mit Link oder QR-Code
        </WoodSign>
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-[20px] border-[3px] border-wood-dark bg-gradient-to-b from-wood-light to-wood p-2 shadow-[0_4px_0_#6e4426]">
            <div className="rounded-[13px] bg-white p-1.5">
              <QrCode value={qrValue} size={196} />
            </div>
          </div>
          <GameButton
            variant="secondary"
            size="md"
            block
            onClick={() => void doCopy('link', codeUrl ?? selfUrl)}
            icon={copied === 'link' ? <CheckIcon size={18} className="text-ok" /> : <LinkIcon size={18} />}
          >
            {copied === 'link' ? 'Link kopiert' : 'Link kopieren'}
          </GameButton>
          <p className="text-center text-[12.5px] text-muted">
            QR scannen oder Link teilen. Die anderen wählen dann ihre Figur.
          </p>
        </div>
      </section>

      <GameButton variant="primary" size="lg" block className="mt-5" onClick={close}>
        Fertig
      </GameButton>
    </Modal>
  )
}
