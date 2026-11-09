import { useEffect, useState } from 'react'
import type { Jahreszeit, WaldObjekt, Wetter } from '../../data/types'
import { classifyImage, loadModel, matchesObject, type ClassifyResult } from '../../lib/classifier'
import { catColor } from '../../lib/categories'
import { Wingo } from '../characters/Wingo'
import { GameButton, Modal, SpeechBubble } from '../ui'
import './game.css'
import { CameraIcon, CheckIcon } from './icons'

type Phase = 'loading-model' | 'classifying' | 'result'

interface Props {
  /** Das aufgenommene Foto (224x224 Canvas). */
  canvas: HTMLCanvasElement
  /** Das gesuchte Bingo-Objekt. */
  target: WaldObjekt
  /** Foto als Treffer bestaetigen (Feld abhaken). */
  onConfirm: () => void
  /** Erneut versuchen (Kamera oeffnet sich wieder). */
  onRetry: () => void
  /** Abbrechen. */
  onCancel: () => void
  /** Kontext für Wingos Accessoires (optional, nur Darstellung). */
  season?: Jahreszeit
  weather?: Wetter | null
  night?: boolean
}

/**
 * Zeigt das aufgenommene Foto, laesst das ML-Modell laufen und praesentiert
 * das Ergebnis: automatischer Match oder manuelles Bestaetigen.
 * (Erkennungs-Logik unverändert – Wingo begleitet nur die Darstellung.)
 */
export function PhotoVerify({ canvas, target, onConfirm, onRetry, onCancel, season, weather, night }: Props) {
  const [phase, setPhase] = useState<Phase>('loading-model')
  const [results, setResults] = useState<ClassifyResult[]>([])
  const [matched, setMatched] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [matchLabel, setMatchLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setPhase('loading-model')
        await loadModel()
        if (cancelled) return

        setPhase('classifying')
        const res = await classifyImage(canvas)
        if (cancelled) return

        setResults(res)
        const match = matchesObject(res, target.kategorie)
        setMatched(match.matched)
        setConfidence(match.confidence)
        setMatchLabel(match.label)
        setPhase('result')
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erkennung fehlgeschlagen')
          setPhase('result')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [canvas, target])

  const col = catColor(target.kategorie)
  const pct = Math.round(confidence * 100)
  const photoUrl = canvas.toDataURL('image/jpeg', 0.85)
  const busy = phase !== 'result'
  const mood = busy ? 'think' : error ? 'sad' : matched ? 'cheer' : 'surprised'

  return (
    <Modal onClose={onCancel} label={`Foto-Erkennung: ${target.name}`} size="sm" closeOnBackdrop={false}>
      {/* Foto + Ziel */}
      <div className="flex items-start gap-4 pr-8">
        <div className="relative flex-none">
          <img
            src={photoUrl}
            alt="Aufgenommenes Foto"
            className="h-[92px] w-[92px] rotate-[-3deg] rounded-[18px] border-[3px] border-white object-cover shadow-tile"
          />
        </div>
        <div className="min-w-0 pt-1">
          <div className="font-display text-[12px] font-semibold uppercase tracking-wide text-muted">Gesucht</div>
          <div className="mt-0.5 font-display text-[21px] font-semibold leading-tight text-forest-900">
            {target.name}
          </div>
          <span
            className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 font-display text-[11.5px] font-semibold uppercase tracking-wide text-white"
            style={{ background: col }}
          >
            {target.kategorie}
          </span>
        </div>
      </div>

      {/* Wingo begleitet die Erkennung */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`flex-none ${busy ? 'anim-bob' : ''}`}>
          <Wingo mood={mood} size={88} season={season} weather={weather} night={night} title="" />
        </div>
        <SpeechBubble tail="left" className="min-w-0 flex-1">
          {phase === 'loading-model' && 'Ich hole meine Lupe … einen Moment!'}
          {phase === 'classifying' && 'Ich schaue mir dein Foto ganz genau an …'}
          {phase === 'result' && error && 'Hoppla, das hat nicht geklappt. Du kannst es trotzdem abhaken!'}
          {phase === 'result' && !error && matched && `Das sieht nach ${target.kategorie} aus. Super Foto!`}
          {phase === 'result' && !error && !matched && 'Hmm, da bin ich nicht ganz sicher …'}
        </SpeechBubble>
      </div>

      {/* Status */}
      {busy && (
        <div className="flex flex-col items-center gap-2 pb-1 pt-4">
          <div className="h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-cream-3">
            <div className="gb-indeterminate h-full w-1/2 rounded-full bg-gradient-to-r from-forest-300 to-forest-500" />
          </div>
          <p className="text-[13.5px] font-semibold text-muted">
            {phase === 'loading-model' ? 'ML-Modell wird geladen…' : 'Foto wird analysiert…'}
          </p>
          {phase === 'loading-model' && <p className="text-[12px] text-muted">(Einmalig ~15 MB, danach gecacht)</p>}
        </div>
      )}

      {/* Ergebnis */}
      {phase === 'result' && !error && (
        <>
          {matched ? (
            <div className="mt-4 rounded-[18px] border-2 border-moss bg-moss-light px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-moss-deep text-white">
                  <CheckIcon size={16} />
                </span>
                <span className="font-display text-[16px] font-semibold text-forest-900">
                  Erkannt: {target.kategorie}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] text-forest-800">
                Das sieht aus wie <b>{matchLabel}</b> ({pct}% sicher). Passt zur Kategorie <b>{target.kategorie}</b>.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border-2 border-sun bg-[#fff6dc] px-4 py-3">
              <div className="font-display text-[16px] font-semibold text-wood-dark">Nicht sicher erkannt</div>
              <p className="mt-1 text-[13.5px] text-ink">
                {results.length > 0 && results[0].className
                  ? `Das Modell erkennt eher „${results[0].className}" (${Math.round(results[0].probability * 100)}%).`
                  : 'Das Modell konnte das Objekt nicht zuordnen.'}{' '}
                Du kannst es trotzdem als gefunden markieren.
              </p>
            </div>
          )}

          {/* Top-Erkennungen (Debug-artig, eingeklappt) */}
          {results.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[12.5px] font-semibold text-muted hover:text-forest-700">
                Alle Erkennungen anzeigen
              </summary>
              <div className="mt-2 space-y-1">
                {results.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <div
                      className="h-1.5 rounded-full bg-forest-500"
                      style={{ width: `${Math.max(4, r.probability * 100)}%`, minWidth: '4px' }}
                    />
                    <span className="font-mono text-muted">{Math.round(r.probability * 100)}%</span>
                    <span className="text-ink">{r.className}</span>
                    {r.kategorie && (
                      <span className="rounded-full bg-forest-100 px-1.5 py-0.5 text-[10px] font-bold text-forest-700">
                        {r.kategorie}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="mt-4 flex flex-col gap-2.5">
            <GameButton
              variant={matched ? 'primary' : 'accent'}
              size="lg"
              block
              icon={<CheckIcon size={22} />}
              onClick={onConfirm}
            >
              {matched ? 'Gefunden!' : 'Trotzdem abhaken'}
            </GameButton>
            <GameButton variant="secondary" size="md" block icon={<CameraIcon size={20} />} onClick={onRetry}>
              Neues Foto aufnehmen
            </GameButton>
            <button
              type="button"
              onClick={onCancel}
              className="focus-ring min-h-[44px] rounded-full font-display text-[15px] font-medium text-muted hover:bg-cream-2 hover:text-forest-800"
            >
              Abbrechen
            </button>
          </div>
        </>
      )}

      {/* Fehler */}
      {phase === 'result' && error && (
        <>
          <div className="mt-4 rounded-[18px] border-2 border-berry-light bg-[#fff0f2] px-4 py-3">
            <p className="font-display text-[15px] font-semibold text-berry-dark">Erkennung fehlgeschlagen</p>
            <p className="mt-1 text-[13px] text-berry-dark/90">{error}</p>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <GameButton variant="primary" size="lg" block icon={<CheckIcon size={22} />} onClick={onConfirm}>
              Manuell abhaken
            </GameButton>
            <button
              type="button"
              onClick={onCancel}
              className="focus-ring min-h-[44px] rounded-full font-display text-[15px] font-medium text-muted hover:bg-cream-2 hover:text-forest-800"
            >
              Abbrechen
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
