import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  /** Inhalt des QR-Codes (typisch eine Einladungs-URL). */
  value: string
  /** Kantenlänge in px. */
  size?: number
}

/**
 * Rendert einen QR-Code lokal (kein Netz). Sehr lange Inhalte (große
 * selbst-enthaltene Spiele) passen nicht in einen QR-Code – dann wird ein
 * Hinweis statt einer Grafik gezeigt.
 */
export function QrCode({ value, size = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setError(false)
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#14331f', light: '#ffffff' },
    }).catch(() => setError(true))
  }, [value, size])

  if (error) {
    return (
      <div
        className="grid place-items-center rounded-lg border border-dashed border-line bg-line-2 p-4 text-center text-[12.5px] text-muted"
        style={{ width: size, height: size }}
      >
        Dieses Spiel ist zu groß für einen QR-Code. Nutze den Code oder den Link.
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg ring-1 ring-line"
      aria-label="QR-Code zum Beitreten"
    />
  )
}
