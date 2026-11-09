// Kleine, runde Symbole für Rahmen & Setup (Ton, Zurück, Spielen …).
// Dicke, abgerundete Striche passend zum „Cozy Woodland“-Stil. Dekorativ.

interface IconProps {
  size?: number
  className?: string
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function SoundOnIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <path {...base} d="M15.5 9.2a4 4 0 0 1 0 5.6" />
      <path {...base} d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
    </svg>
  )
}

export function SoundOffIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <path {...base} d="M16 9.5l5 5M21 9.5l-5 5" />
    </svg>
  )
}

export function BackIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path {...base} strokeWidth={3} d="M14.5 5.5L8 12l6.5 6.5" />
    </svg>
  )
}

export function PlayIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M8 5.2c0-.9 1-1.5 1.8-1L19 10.6c.8.5.8 1.7 0 2.2L9.8 19.2c-.8.5-1.8-.1-1.8-1z" fill="currentColor" />
    </svg>
  )
}

/** Kompass-Blatt: „Neues Abenteuer“. */
export function SproutIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path {...base} d="M12 21v-8" />
      <path d="M12 13C12 8 8.5 5 3.5 5c0 5 3.5 8 8.5 8z" fill="currentColor" />
      <path d="M12 11c0-4 3-6.5 8.5-6.5 0 4.2-3 6.5-8.5 6.5z" fill="currentColor" opacity={0.85} />
    </svg>
  )
}

/** Zwei Köpfchen: „Beitreten / Mitspieler“. */
export function FriendsIcon({ size = 22, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="9" cy="8.5" r="3.6" fill="currentColor" />
      <path d="M2.8 19.5c0-3.6 2.8-6 6.2-6s6.2 2.4 6.2 6z" fill="currentColor" />
      <circle cx="16.6" cy="9.4" r="3" fill="currentColor" opacity={0.75} />
      <path d="M14.6 14.1c.6-.2 1.3-.3 2-.3 2.9 0 5.2 2.1 5.2 5.2h-5" fill="currentColor" opacity={0.75} />
    </svg>
  )
}

export function CloudOffIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.6 4.5 4.5 0 0 0 7 18.5z"
        fill="currentColor"
        opacity={0.9}
      />
      <path d="M4 4l16 16" stroke="#fff8ec" strokeWidth={4.4} strokeLinecap="round" />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  )
}

export function ChevronIcon({ size = 16, className, open }: IconProps & { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      <path {...base} strokeWidth={3} d="M6 9.5l6 6 6-6" />
    </svg>
  )
}

export function CheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path {...base} strokeWidth={3.4} d="M5.5 12.5l4.2 4.2L18.5 7.8" />
    </svg>
  )
}

export function PinIcon({ size = 18, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 22s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12z" fill="currentColor" />
      <circle cx="12" cy="10" r="2.8" fill="#fff8ec" />
    </svg>
  )
}

export function CopyIcon({ size = 20, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <rect {...base} x="8.5" y="8.5" width="11" height="11" rx="2.8" />
      <path {...base} d="M15.5 5.6V5a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5V13a2 2 0 0 0 2 2h.6" />
    </svg>
  )
}

export function LinkIcon({ size = 20, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path {...base} d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path {...base} d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  )
}
