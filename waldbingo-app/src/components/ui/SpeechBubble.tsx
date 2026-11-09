import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Richtung des Zipfels – zeigt zum Sprecher. */
  tail?: 'left' | 'right' | 'bottom' | 'top' | 'none'
  className?: string
}

const TAIL: Record<Exclude<Props['tail'], undefined | 'none'>, string> = {
  left: 'left-[-7px] top-1/2 -translate-y-1/2',
  right: 'right-[-7px] top-1/2 -translate-y-1/2',
  bottom: 'bottom-[-7px] left-1/2 -translate-x-1/2',
  top: 'top-[-7px] left-1/2 -translate-x-1/2',
}

/** Sprechblase für Wingo & Freunde. aria-live, damit Hinweise vorgelesen werden. */
export function SpeechBubble({ children, tail = 'left', className = '' }: Props) {
  return (
    <div
      aria-live="polite"
      className={`relative rounded-[20px] border-2 border-cream-line bg-white px-4 py-2.5 font-display text-[15px] font-medium leading-snug text-forest-900 shadow-[0_3px_0_#e6d3b0,0_8px_18px_rgba(15,38,23,.14)] ${className}`}
    >
      {tail !== 'none' && (
        <span
          aria-hidden="true"
          className={`absolute h-3.5 w-3.5 rotate-45 border-cream-line bg-white ${TAIL[tail]} ${
            tail === 'left'
              ? 'border-b-2 border-l-2'
              : tail === 'right'
                ? 'border-r-2 border-t-2'
                : tail === 'bottom'
                  ? 'border-b-2 border-r-2'
                  : 'border-l-2 border-t-2'
          }`}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
