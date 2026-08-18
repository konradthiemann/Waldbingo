import { useEffect, useState } from 'react'
import type { WaldObjekt } from '../../data/types'
import { classifyImage, loadModel, matchesObject, type ClassifyResult } from '../../lib/classifier'
import { catColor } from '../../lib/categories'
import { Glyph } from '../Svg'

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
}

/**
 * Zeigt das aufgenommene Foto, laesst das ML-Modell laufen und praesentiert
 * das Ergebnis: automatischer Match oder manuelles Bestaetigen.
 */
export function PhotoVerify({ canvas, target, onConfirm, onRetry, onCancel }: Props) {
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
    return () => { cancelled = true }
  }, [canvas, target])

  const col = catColor(target.kategorie)
  const pct = Math.round(confidence * 100)
  const photoUrl = canvas.toDataURL('image/jpeg', 0.85)

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,33,25,0.5)] p-4 backdrop-blur-[3px]">
      <div className="anim-rise w-full max-w-[400px] rounded-xl bg-white p-5 shadow-wb3">
        {/* Foto + Ziel */}
        <div className="mb-4 flex items-start gap-4">
          <img
            src={photoUrl}
            alt="Aufgenommenes Foto"
            className="h-24 w-24 flex-none rounded-lg object-cover shadow-wb1"
          />
          <div className="min-w-0">
            <div className="text-[11.5px] font-extrabold uppercase tracking-wide text-muted">Gesucht</div>
            <div className="mt-0.5 text-[18px] font-extrabold text-forest-900">{target.name}</div>
            <span
              className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ background: col }}
            >
              {target.kategorie}
            </span>
          </div>
        </div>

        {/* Status */}
        {phase !== 'result' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-forest-200 border-t-forest-600" />
            <p className="text-[14px] font-semibold text-muted">
              {phase === 'loading-model' ? 'ML-Modell wird geladen…' : 'Foto wird analysiert…'}
            </p>
            {phase === 'loading-model' && (
              <p className="text-[12px] text-muted">(Einmalig ~15 MB, danach gecacht)</p>
            )}
          </div>
        )}

        {/* Ergebnis */}
        {phase === 'result' && !error && (
          <>
            {matched ? (
              <div className="mb-4 rounded-lg border border-ok-line bg-ok-bg px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ok text-white">
                    <Glyph name="check" className="block h-4 w-4" />
                  </span>
                  <span className="text-[15px] font-bold text-forest-900">
                    Erkannt: {target.kategorie}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] text-forest-800">
                  Das sieht aus wie <b>{matchLabel}</b> ({pct}% sicher).
                  Passt zur Kategorie <b>{target.kategorie}</b>.
                </p>
              </div>
            ) : (
              <div className="mb-4 rounded-lg border border-amber/40 bg-[#fff7e6] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">🤔</span>
                  <span className="text-[15px] font-bold text-amber-600">Nicht sicher erkannt</span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink">
                  {results.length > 0 && results[0].className
                    ? `Das Modell erkennt eher „${results[0].className}" (${Math.round(results[0].probability * 100)}%).`
                    : 'Das Modell konnte das Objekt nicht zuordnen.'}
                  {' '}Du kannst es trotzdem als gefunden markieren.
                </p>
              </div>
            )}

            {/* Top-Erkennungen (Debug-artig, eingeklappt) */}
            {results.length > 0 && (
              <details className="mb-4">
                <summary className="cursor-pointer text-[12px] font-semibold text-muted hover:text-forest-700">
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

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded bg-gradient-to-br from-forest-600 to-forest-700 px-5 py-3.5 font-bold text-white shadow-wb1"
              >
                <Glyph name="check" className="block h-5 w-5" />
                {matched ? 'Gefunden!' : 'Trotzdem als gefunden markieren'}
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="focus-ring w-full rounded border-[1.5px] border-forest-300 bg-white px-5 py-3 font-bold text-forest-700 hover:bg-forest-100"
              >
                Neues Foto aufnehmen
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="focus-ring w-full rounded border-[1.5px] border-line px-5 py-3 font-bold text-forest-700 hover:bg-line-2"
              >
                Abbrechen
              </button>
            </div>
          </>
        )}

        {/* Fehler */}
        {phase === 'result' && error && (
          <>
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[14px] font-bold text-red-700">Erkennung fehlgeschlagen</p>
              <p className="mt-1 text-[13px] text-red-600">{error}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded bg-gradient-to-br from-forest-600 to-forest-700 px-5 py-3.5 font-bold text-white shadow-wb1"
              >
                <Glyph name="check" className="block h-5 w-5" />
                Manuell als gefunden markieren
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="focus-ring w-full rounded border-[1.5px] border-line px-5 py-3 font-bold text-forest-700 hover:bg-line-2"
              >
                Abbrechen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
