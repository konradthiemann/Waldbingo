import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type GameButtonVariant = 'primary' | 'accent' | 'secondary' | 'berry' | 'ghost'
export type GameButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant
  size?: GameButtonSize
  icon?: ReactNode
  /** Volle Breite. */
  block?: boolean
  children?: ReactNode
}

// Dicke „Spiel-Knöpfe“ mit Unterkante (Lippe), die beim Drücken einfedern.
const VARIANT: Record<GameButtonVariant, string> = {
  // Weiße Schrift braucht dunkles Grün: auf forest-600 5,0:1, auf forest-700 8:1.
  primary:
    'bg-gradient-to-b from-forest-600 to-forest-700 text-white [text-shadow:0_1.5px_0_rgba(15,38,23,.35)] shadow-[0_5px_0_#14331f,0_9px_18px_rgba(15,38,23,.28)] active:shadow-[0_2px_0_#14331f,0_4px_10px_rgba(15,38,23,.25)]',
  accent:
    'bg-gradient-to-b from-sun-light to-sun text-wood-lip shadow-[0_5px_0_#b8861a,0_9px_18px_rgba(15,38,23,.25)] active:shadow-[0_2px_0_#b8861a,0_4px_10px_rgba(15,38,23,.22)]',
  secondary:
    'bg-gradient-to-b from-white to-cream-2 text-forest-800 border-2 border-cream-line shadow-[0_4px_0_#d9c39d,0_8px_16px_rgba(15,38,23,.16)] active:shadow-[0_1px_0_#d9c39d,0_3px_8px_rgba(15,38,23,.14)]',
  // Weiß auf berry-dark 5,0:1 (vorher auf hellem Rosa nur ~2,3:1).
  berry:
    'bg-gradient-to-b from-berry-dark to-[#a8344c] text-white [text-shadow:0_1.5px_0_rgba(120,20,40,.35)] shadow-[0_5px_0_#7e2236,0_9px_18px_rgba(15,38,23,.25)] active:shadow-[0_2px_0_#7e2236,0_4px_10px_rgba(15,38,23,.22)]',
  ghost: 'bg-white/15 text-current border-2 border-white/45 backdrop-blur-sm hover:bg-white/25',
}

const SIZE: Record<GameButtonSize, string> = {
  sm: 'h-9 px-4 text-[14px] gap-1.5',
  md: 'h-11 px-5 text-[16px] gap-2',
  lg: 'h-14 px-7 text-[18px] gap-2.5',
  xl: 'h-16 px-8 text-[21px] gap-3',
}

/** Primärer Spiel-Button (Fredoka, Lippe, Federeffekt). */
export function GameButton({
  variant = 'primary',
  size = 'md',
  icon,
  block,
  className = '',
  children,
  type = 'button',
  ...rest
}: Props) {
  const lip = variant !== 'ghost'
  return (
    <button
      type={type}
      {...rest}
      className={`focus-ring group relative inline-flex select-none items-center justify-center rounded-full font-display font-semibold transition-[transform,box-shadow,filter] duration-100 ease-out hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${
        lip ? 'active:translate-y-[3px] disabled:active:translate-y-0' : ''
      } ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
    >
      {/* Glanzkante oben: weicher Verlauf, flach und mit Abstand zur Schrift
          (bei weißer Schrift schwächer, damit der Kontrast nicht leidet). */}
      {lip && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-[12%] top-[2px] h-[24%] max-h-[13px] rounded-full bg-gradient-to-b to-white/0 ${
            variant === 'primary' || variant === 'berry' ? 'from-white/[.18]' : 'from-white/30'
          }`}
        />
      )}
      {icon && <span className="relative flex-none">{icon}</span>}
      {children != null && <span className="relative">{children}</span>}
    </button>
  )
}
