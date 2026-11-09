import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from './useFocusTrap'

interface Props {
  children: ReactNode
  onClose: () => void
  /** Barrierefreier Titel (aria-label), falls keine sichtbare Überschrift verknüpft ist. */
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Schließen-Kreuz anzeigen (Standard: ja). */
  closable?: boolean
  /** Klick auf den Hintergrund schließt (Standard: ja). */
  closeOnBackdrop?: boolean
  className?: string
  /** z-Index-Ebene (Standard 50). */
  z?: number
}

const SIZE = { sm: 'max-w-[360px]', md: 'max-w-[440px]', lg: 'max-w-[560px]' }

/**
 * Einheitliche Modal-Hülle: abgedunkelter, weichgezeichneter Wald im Hintergrund,
 * Papier-Panel federt herein. Escape schließt, Fokus wandert ins Modal und bleibt
 * dort (Fokusfalle), beim Schließen kehrt er zum Auslöser zurück.
 * Wird per Portal direkt in `<body>` gerendert: So kann kein Vorfahre mit
 * `transform` (z. B. Bildschirmübergang) das `position: fixed` verfälschen.
 * Im Druck unsichtbar.
 */
export function Modal({
  children,
  onClose,
  label,
  size = 'md',
  closable = true,
  closeOnBackdrop = true,
  className = '',
  z = 50,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useFocusTrap(ref)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', h)
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', h)
      // Nur zurückgeben, wenn der Auslöser noch existiert und kein anderer
      // Dialog den Fokus inzwischen übernommen hat.
      const now = document.activeElement
      if (prev?.isConnected && (now == null || now === document.body || ref.current?.contains(now))) {
        prev.focus?.({ preventScroll: true })
      }
    }
  }, [])

  const overlay = (
    <div
      className="no-print anim-fade fixed inset-0 flex items-end justify-center bg-[rgba(12,28,20,0.45)] p-3 backdrop-blur-[4px] sm:items-center sm:p-5"
      style={{ zIndex: z }}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`anim-pop-in relative max-h-[calc(100dvh-24px)] w-full overflow-y-auto rounded-2xl border-2 border-cream-line bg-cream p-5 text-ink shadow-panel outline-none sm:p-6 ${SIZE[size]} ${className}`}
      >
        {closable && (
          // Tippfläche 44 × 44 px, sichtbarer Knopf 36 px.
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="focus-ring group absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full transition active:translate-y-px"
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-cream-2 text-[17px] font-bold leading-none text-forest-800 shadow-[0_2px_0_#d9c39d] transition group-hover:bg-cream-3"
            >
              ✕
            </span>
          </button>
        )}
        {children}
      </div>
    </div>
  )
  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body)
}
