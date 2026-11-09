import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  icon?: ReactNode
  tone?: 'cream' | 'glass' | 'forest' | 'sun'
  className?: string
  title?: string
}

const TONE = {
  cream: 'bg-cream/95 text-forest-900 border-cream-line',
  glass: 'wb-glass-strong text-forest-900 border-white/70 backdrop-blur-md',
  forest: 'bg-forest-700 text-white border-forest-800',
  sun: 'bg-sun-light text-wood-lip border-sun-dark/50',
}

/** HUD-Plakette (Kontext, Zähler, Status). */
export function Badge({ children, icon, tone = 'cream', className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-display text-[13px] font-medium leading-none shadow-[0_2px_0_rgba(110,68,38,.15)] ${TONE[tone]} ${className}`}
    >
      {icon && <span className="flex-none">{icon}</span>}
      {children}
    </span>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Pflicht: Screenreader-Beschriftung. */
  label: string
  children: ReactNode
  tone?: 'cream' | 'glass'
  size?: number
}

/** Runder Symbol-Knopf (z. B. Ton an/aus, Zurück). */
export function IconButton({
  label,
  children,
  tone = 'cream',
  size = 44,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      {...rest}
      style={{ width: size, height: size }}
      className={`focus-ring grid flex-none place-items-center rounded-full border-2 transition active:translate-y-[2px] ${
        tone === 'cream'
          ? 'border-cream-line bg-cream text-forest-800 shadow-[0_3px_0_#d9c39d,0_6px_12px_rgba(15,38,23,.18)]'
          : 'wb-glass border-white/60 text-forest-900 shadow-wb2 backdrop-blur-md'
      } ${className}`}
    >
      {children}
    </button>
  )
}
