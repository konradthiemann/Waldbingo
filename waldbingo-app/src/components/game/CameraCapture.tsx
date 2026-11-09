import { useCallback, useEffect, useRef, useState } from 'react'
import { Wingo } from '../characters/Wingo'
import { GameButton, IconButton, useFocusTrap } from '../ui'
import { BackIcon, CameraIcon } from './icons'

interface Props {
  onCapture: (canvas: HTMLCanvasElement) => void
  onClose: () => void
  /** Name des gesuchten Feldes (nur Anzeige). */
  targetName?: string
}

/**
 * Kamera-Aufnahme: oeffnet die Rueckkamera, zeigt einen Live-Sucher und
 * nimmt ein Foto auf. Das Foto wird als Canvas an den Parent uebergeben.
 * (Logik unverändert – nur die Darstellung ist im Wald-Look.)
 */
export function CameraCapture({ onCapture, onClose, targetName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const shutterRef = useRef<HTMLButtonElement>(null)
  useFocusTrap(dialogRef)

  // Kamera starten
  useEffect(() => {
    let cancelled = false
    const constraints: MediaStreamConstraints = {
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
      audio: false,
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => {
        if (!cancelled) setError('Die Kamera konnte nicht geöffnet werden. Bitte erlaube den Zugriff.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Stream an video-Element binden wenn beides bereit
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Stream aufraumen
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    // Quadratisch croppen (Mitte)
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = 224 // MobileNet Input-Groesse
    canvas.height = 224
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sx = (video.videoWidth - size) / 2
    const sy = (video.videoHeight - size) / 2
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 224, 224)

    // Stream stoppen bevor Ergebnis uebergeben wird
    stream?.getTracks().forEach((t) => t.stop())
    onCapture(canvas)
  }, [stream, onCapture])

  const handleClose = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    onClose()
  }, [stream, onClose])

  // Fokus in den Kamera-Dialog holen (nicht auf der Kachel dahinter lassen),
  // beim Schließen zurück zum Auslöser. Escape schließt.
  const closeRef = useRef(handleClose)
  closeRef.current = handleClose
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    dialogRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const now = document.activeElement
      if (prev?.isConnected && (now == null || now === document.body)) prev.focus({ preventScroll: true })
    }
  }, [])
  // Sobald der Sucher läuft: Auslöser fokussieren (Tastatur/Schalter).
  useEffect(() => {
    if (ready) shutterRef.current?.focus({ preventScroll: true })
  }, [ready])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={targetName ? `Foto von ${targetName} aufnehmen` : 'Foto aufnehmen'}
      className="anim-fade fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(10,26,17,0.9)] p-4 outline-none backdrop-blur-sm"
    >
      {targetName && !error && (
        <div className="mb-4 rounded-full border-2 border-cream-line bg-cream px-4 py-1.5 font-display text-[16px] font-semibold text-forest-900 shadow-[0_3px_0_#d9c39d]">
          Fotografiere: {targetName}
        </div>
      )}

      <div className="relative w-full max-w-[400px] overflow-hidden rounded-[30px] border-4 border-wood-dark bg-forest-950 shadow-[0_6px_0_#6e4426,0_20px_40px_rgba(0,0,0,.45)]">
        {error ? (
          <div className="flex flex-col items-center gap-3 bg-cream p-7 text-center text-ink">
            <Wingo mood="sad" size={120} title="" />
            <p className="font-display text-[17px] font-medium text-forest-900">{error}</p>
            <GameButton variant="secondary" size="md" onClick={handleClose}>
              Schließen
            </GameButton>
          </div>
        ) : (
          <div className="gb-viewfinder relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => setReady(true)}
              className="aspect-square w-full object-cover"
            />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center bg-forest-950">
                <div className="flex flex-col items-center text-center text-white">
                  <span className="anim-bob mb-2 grid h-14 w-14 place-items-center rounded-full bg-white/10 text-forest-300">
                    <CameraIcon size={30} />
                  </span>
                  <p className="font-display text-[15px] opacity-85">Kamera wird gestartet…</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!error && ready && (
        <div className="mt-6 flex items-center gap-6">
          <IconButton label="Zurück" tone="cream" size={52} onClick={handleClose}>
            <BackIcon size={24} />
          </IconButton>
          <button
            ref={shutterRef}
            type="button"
            onClick={handleCapture}
            className="focus-ring grid h-[82px] w-[82px] place-items-center rounded-full border-[5px] border-cream bg-white/20 shadow-[0_5px_0_rgba(0,0,0,.35)] transition active:translate-y-[3px] active:shadow-[0_2px_0_rgba(0,0,0,.35)]"
            aria-label="Foto aufnehmen"
          >
            <span className="grid h-[60px] w-[60px] place-items-center rounded-full bg-gradient-to-b from-forest-400 to-forest-600 text-white shadow-[inset_0_2px_0_rgba(255,255,255,.35)]">
              <CameraIcon size={28} />
            </span>
          </button>
          <div className="h-[52px] w-[52px]" aria-hidden="true" /> {/* Spacer fuer Symmetrie */}
        </div>
      )}
    </div>
  )
}
