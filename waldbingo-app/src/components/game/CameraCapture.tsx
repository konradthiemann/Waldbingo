import { useCallback, useEffect, useRef, useState } from 'react'
import { Glyph } from '../Svg'

interface Props {
  onCapture: (canvas: HTMLCanvasElement) => void
  onClose: () => void
}

/**
 * Kamera-Aufnahme: oeffnet die Rueckkamera, zeigt einen Live-Sucher und
 * nimmt ein Foto auf. Das Foto wird als Canvas an den Parent uebergeben.
 */
export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

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
        if (!cancelled) setError('Kamera konnte nicht geoeffnet werden. Bitte Zugriff erlauben.')
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

  return (
    <div className="anim-fade fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(20,33,25,0.85)] p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-xl bg-black shadow-wb3">
        {error ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center text-white">
            <span className="text-4xl">📷</span>
            <p className="text-[15px]">{error}</p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-white/20 px-5 py-2.5 font-bold text-white"
            >
              Schliessen
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => setReady(true)}
              className="aspect-square w-full object-cover"
            />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center bg-black">
                <div className="text-center text-white">
                  <div className="mb-2 text-3xl">📷</div>
                  <p className="text-[14px] opacity-80">Kamera wird gestartet…</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!error && ready && (
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur"
          >
            <Glyph name="back" className="block h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            className="grid h-[72px] w-[72px] place-items-center rounded-full border-4 border-white bg-white/30 backdrop-blur transition hover:bg-white/50"
            aria-label="Foto aufnehmen"
          >
            <div className="h-[52px] w-[52px] rounded-full bg-white" />
          </button>
          <div className="h-12 w-12" /> {/* Spacer fuer Symmetrie */}
        </div>
      )}

      {error && null}
    </div>
  )
}
