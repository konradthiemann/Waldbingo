// Illustrierte Mini-Symbole für Jahreszeit, Wetter und Tageszeit (Expedition planen).
// Stil wie die Spielwelt: flache Formen, 1 Schatten-/Glanzton, dicke Kontur im
// dunkleren Eigenton (nie Schwarz). viewBox 48×48, dekorativ (aria-hidden).
import { useId, type ReactNode } from 'react'
import type { Jahreszeit, Tageszeit, Wetter } from '../../data/types'

interface Props {
  size?: number
  className?: string
}

function Frame({ size = 44, className, children }: Props & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

// ── Bausteine ────────────────────────────────────────────────────────────────

/** Sonne mit freundlichem Gesicht. */
function Sun({ cx = 24, cy = 24, r = 10, face = true }: { cx?: number; cy?: number; r?: number; face?: boolean }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    const r1 = r + 3.5
    const r2 = r + 7.5
    return (
      <line
        key={i}
        x1={cx + Math.cos(a) * r1}
        y1={cy + Math.sin(a) * r1}
        x2={cx + Math.cos(a) * r2}
        y2={cy + Math.sin(a) * r2}
        stroke="#f0ac2c"
        strokeWidth={3.4}
        strokeLinecap="round"
      />
    )
  })
  return (
    <g>
      {rays}
      <circle cx={cx} cy={cy} r={r} fill="#ffd45e" stroke="#d9951f" strokeWidth={2.4} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.45} rx={r * 0.35} ry={r * 0.2} fill="#fff4c4" opacity={0.9} />
      {face && (
        <g>
          <circle cx={cx - r * 0.33} cy={cy + r * 0.02} r={1.2} fill="#7a4f2e" />
          <circle cx={cx + r * 0.33} cy={cy + r * 0.02} r={1.2} fill="#7a4f2e" />
          <path
            d={`M${cx - r * 0.25} ${cy + r * 0.32} q${r * 0.25} ${r * 0.24} ${r * 0.5} 0`}
            stroke="#7a4f2e"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={cx - r * 0.58} cy={cy + r * 0.3} r={1.5} fill="#ff9fb0" opacity={0.7} />
          <circle cx={cx + r * 0.58} cy={cy + r * 0.3} r={1.5} fill="#ff9fb0" opacity={0.7} />
        </g>
      )}
    </g>
  )
}

/** Wolke als Vereinigung von Kreisen: erst Kontur-Pass, dann Füll-Pass. */
function Cloud({
  dx = 0,
  dy = 0,
  s = 1,
  fill = '#ffffff',
  line = '#8aa0b4',
  shade = '#e2ebf3',
}: {
  dx?: number
  dy?: number
  s?: number
  fill?: string
  line?: string
  shade?: string
}) {
  const parts = (
    <>
      <circle cx={16} cy={28} r={6.5} />
      <circle cx={24.5} cy={22} r={9} />
      <circle cx={32.5} cy={27} r={7} />
      <rect x={10} y={26} width={29} height={9.5} rx={4.75} />
    </>
  )
  return (
    <g transform={`translate(${dx} ${dy}) translate(24 28) scale(${s}) translate(-24 -28)`}>
      <g fill={line} stroke={line} strokeWidth={5} strokeLinejoin="round">
        {parts}
      </g>
      <g fill={fill}>{parts}</g>
      <rect x={12} y={31} width={25} height={4} rx={2} fill={shade} />
      <ellipse cx={21.5} cy={17.5} rx={3.2} ry={1.6} fill="#ffffff" opacity={0.85} />
    </g>
  )
}

function Drop({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 4.2} q3.4 4.2 3.4 6.4 a3.4 3.4 0 0 1 -6.8 0 q0 -2.2 3.4 -6.4z`}
      fill="#6cc0f0"
      stroke="#3f8fc4"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  )
}

function Flake({ x, y, r = 3.2 }: { x: number; y: number; r?: number }) {
  return (
    <g stroke="#7fa6c8" strokeWidth={1.6} strokeLinecap="round">
      <line x1={x - r} y1={y} x2={x + r} y2={y} />
      <line x1={x - r * 0.5} y1={y - r * 0.87} x2={x + r * 0.5} y2={y + r * 0.87} />
      <line x1={x - r * 0.5} y1={y + r * 0.87} x2={x + r * 0.5} y2={y - r * 0.87} />
      <circle cx={x} cy={y} r={1.4} fill="#ffffff" />
    </g>
  )
}

/** Zweitönige Linie (Kontur + heller Kern), z. B. für Wind & Nebel. */
function TwoTone({ d, outer = '#7d93a8', inner = '#ffffff', w = 3 }: { d: string; outer?: string; inner?: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={outer} strokeWidth={w + 2.6} />
      <path d={d} stroke={inner} strokeWidth={w} />
    </g>
  )
}

function Leaf({ fill, line, vein, transform }: { fill: string; line: string; vein: string; transform?: string }) {
  return (
    <g transform={transform}>
      <path
        d="M11 37 C 9 22, 20 11, 38 10 C 39 26, 28 38, 11 37 Z"
        fill={fill}
        stroke={line}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <path d="M13 35 C 20 27, 26 21, 34 14" stroke={vein} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M8 40 L 13 35" stroke={line} strokeWidth={2.8} strokeLinecap="round" />
      <ellipse cx={30} cy={17} rx={3.5} ry={1.8} transform="rotate(-40 30 17)" fill="#ffffff" opacity={0.45} />
    </g>
  )
}

// ── Wetter ───────────────────────────────────────────────────────────────────

export function WeatherIcon({ weather, ...p }: Props & { weather: Wetter | null }) {
  switch (weather) {
    case 'klar':
      return (
        <Frame {...p}>
          <Sun r={11} />
        </Frame>
      )
    case 'bewoelkt':
      return (
        <Frame {...p}>
          <Sun cx={31} cy={17} r={7.5} face={false} />
          <Cloud dx={-3} dy={3} />
        </Frame>
      )
    case 'regen':
      return (
        <Frame {...p}>
          <Cloud dy={-6} fill="#eef3f7" line="#71879c" shade="#d5e0ea" />
          <Drop x={16} y={39} />
          <Drop x={25} y={43} />
          <Drop x={34} y={39} />
        </Frame>
      )
    case 'nach_regen':
      return (
        <Frame {...p}>
          <g fill="none" strokeLinecap="round">
            <path d="M7 35 a17 17 0 0 1 34 0" stroke="#e85d75" strokeWidth={4} />
            <path d="M11.5 35 a12.5 12.5 0 0 1 25 0" stroke="#ffd45e" strokeWidth={4} />
            <path d="M16 35 a8 8 0 0 1 16 0" stroke="#5fb87c" strokeWidth={4} />
          </g>
          <Cloud dx={10} dy={7} s={0.55} />
          <Cloud dx={-11} dy={7} s={0.5} />
        </Frame>
      )
    case 'schnee':
      return (
        <Frame {...p}>
          <Cloud dy={-6} fill="#ffffff" line="#8fa9c4" shade="#e6eef6" />
          <Flake x={15} y={40} />
          <Flake x={25} y={44} r={2.8} />
          <Flake x={34} y={40} />
        </Frame>
      )
    case 'frost': {
      const arms = [0, 60, 120]
      return (
        <Frame {...p}>
          <g strokeLinecap="round" fill="none">
            {arms.map((a) => (
              <g key={a} transform={`rotate(${a} 24 24)`}>
                <path d="M24 6 V42 M19 10 L24 15 L29 10 M19 38 L24 33 L29 38" stroke="#3f8fc4" strokeWidth={5.2} />
              </g>
            ))}
            {arms.map((a) => (
              <g key={`i${a}`} transform={`rotate(${a} 24 24)`}>
                <path d="M24 6 V42 M19 10 L24 15 L29 10 M19 38 L24 33 L29 38" stroke="#d4eefc" strokeWidth={2.4} />
              </g>
            ))}
          </g>
          <circle cx={24} cy={24} r={3.4} fill="#ffffff" stroke="#3f8fc4" strokeWidth={1.8} />
        </Frame>
      )
    }
    case 'wind':
      return (
        <Frame {...p}>
          <TwoTone d="M5 17 H27 a5 5 0 1 0 -5 -5" />
          <TwoTone d="M5 26 H35 a5.5 5.5 0 1 1 -5.5 5.5" />
          <TwoTone d="M9 35 H20" />
          <Leaf fill="#8ed3a0" line="#2f7d4f" vein="#2f7d4f" transform="translate(30 3) scale(.42) rotate(20 24 24)" />
        </Frame>
      )
    case 'nebel':
      return (
        <Frame {...p}>
          <Sun cx={24} cy={17} r={8} face={false} />
          <rect x={4} y={19} width={40} height={30} fill="#ffffff" opacity={0.35} />
          <TwoTone d="M8 24 H40" outer="#9aa9b6" inner="#f2f5f7" w={3.4} />
          <TwoTone d="M13 32 H36" outer="#9aa9b6" inner="#f2f5f7" w={3.4} />
          <TwoTone d="M8 40 H30" outer="#9aa9b6" inner="#f2f5f7" w={3.4} />
        </Frame>
      )
    default:
      // Unbekannt: Wolke mit Fragezeichen.
      return (
        <Frame {...p}>
          <Cloud dy={-2} fill="#fff8ec" line="#b9a27f" shade="#f3e2c4" />
          <text
            x={24.5}
            y={33}
            textAnchor="middle"
            fontFamily="'Fredoka Variable', Fredoka, sans-serif"
            fontWeight={700}
            fontSize={15}
            fill="#8a5a33"
          >
            ?
          </text>
        </Frame>
      )
  }
}

// ── Jahreszeit ───────────────────────────────────────────────────────────────

export function SeasonIcon({ season, ...p }: Props & { season: Jahreszeit }) {
  switch (season) {
    case 'fruehling': {
      const petals = [0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180
        return { x: 24 + Math.cos(rad) * 8.5, y: 23 + Math.sin(rad) * 8.5 }
      })
      return (
        <Frame {...p}>
          <path d="M24 32 C 24 38, 22 42, 19 45" stroke="#2f7d4f" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M22 40 C 16 40, 12 37, 11 33 C 16 32, 20 35, 22 40 Z" fill="#8ed3a0" stroke="#2f7d4f" strokeWidth={2} strokeLinejoin="round" />
          <g fill="#e0708a" stroke="#e0708a" strokeWidth={4.6}>
            {petals.map((q, i) => (
              <circle key={i} cx={q.x} cy={q.y} r={7} />
            ))}
          </g>
          <g fill="#ffc2cd">
            {petals.map((q, i) => (
              <circle key={i} cx={q.x} cy={q.y} r={7} />
            ))}
          </g>
          {petals.map((q, i) => (
            <circle key={i} cx={q.x - 1.6} cy={q.y - 1.8} r={1.8} fill="#ffffff" opacity={0.6} />
          ))}
          <circle cx={24} cy={23} r={5.2} fill="#ffd45e" stroke="#d9951f" strokeWidth={2} />
        </Frame>
      )
    }
    case 'sommer':
      return (
        <Frame {...p}>
          <Sun cx={14} cy={14} r={6} face={false} />
          <Leaf fill="#5fb87c" line="#1f5b38" vein="#2f7d4f" transform="translate(3 3)" />
        </Frame>
      )
    case 'herbst':
      return (
        <Frame {...p}>
          <Leaf fill="#f0913a" line="#a8431f" vein="#c4582a" transform="translate(-2 0)" />
          {/* Eichel */}
          <g transform="translate(29 28)">
            <ellipse cx={7} cy={10} rx={5.6} ry={6.6} fill="#c98a4a" stroke="#7a4f2e" strokeWidth={2} />
            <path d="M0.6 7 C 1 2, 13 2, 13.4 7 Z" fill="#8a5a33" stroke="#6e4426" strokeWidth={2} strokeLinejoin="round" />
            <path d="M7 3 V0" stroke="#6e4426" strokeWidth={2} strokeLinecap="round" />
            <ellipse cx={5} cy={11} rx={1.4} ry={2.4} fill="#e8b47c" />
          </g>
        </Frame>
      )
    case 'winter':
      return (
        <Frame {...p}>
          <rect x={21.5} y={37} width={5} height={7} rx={1.5} fill="#7a4f2e" />
          <g stroke="#1f5b38" strokeWidth={2.4} strokeLinejoin="round">
            <path d="M24 5 L34 18 H14 Z" fill="#3f8f5a" />
            <path d="M24 12 L37 28 H11 Z" fill="#2f7a4a" />
            <path d="M24 20 L40 39 H8 Z" fill="#2f7a4a" />
          </g>
          <g fill="#ffffff" stroke="#b8cfe6" strokeWidth={1.2} strokeLinejoin="round">
            <path d="M24 5 L29.5 12 C 27 13.5, 21 13.5, 18.5 12 Z" />
            <path d="M15 24 C 20 26.5, 28 26.5, 33 24 L 37 28 H11 Z" />
            <path d="M12 35 C 19 38, 29 38, 36 35 L 40 39 H8 Z" />
          </g>
          <circle cx={7} cy={10} r={1.8} fill="#ffffff" stroke="#b8cfe6" strokeWidth={1} />
          <circle cx={41} cy={14} r={1.5} fill="#ffffff" stroke="#b8cfe6" strokeWidth={1} />
        </Frame>
      )
  }
}

// ── Tageszeit ────────────────────────────────────────────────────────────────

const TIME_SKY: Record<Tageszeit, { sky: string; ring: string; hill: string; hillLine: string }> = {
  morgen: { sky: '#ffd9b8', ring: '#e89a6a', hill: '#6fcb8c', hillLine: '#2f7d4f' },
  tag: { sky: '#8fd0f5', ring: '#3f8fc4', hill: '#5fb87c', hillLine: '#2f7d4f' },
  abend: { sky: '#ffb36b', ring: '#d9772f', hill: '#3f9d63', hillLine: '#1f5b38' },
  daemmerung: { sky: '#7a6aa8', ring: '#4a3d7a', hill: '#2f6b55', hillLine: '#173a2c' },
  nacht: { sky: '#26306a', ring: '#141b45', hill: '#1f4a3a', hillLine: '#0f2617' },
}

export function TimeIcon({ time, ...p }: Props & { time: Tageszeit }) {
  const clip = `ti-${useId().replace(/:/g, '')}`
  const c = TIME_SKY[time]
  const moon = (cx: number, cy: number, r: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#ffe9a8" />
      <circle cx={cx + r * 0.55} cy={cy - r * 0.4} r={r * 0.85} fill={c.sky} />
    </g>
  )
  const star = (x: number, y: number, s = 1) => (
    <path
      d={`M${x} ${y - 2.6 * s} l${0.8 * s} ${1.8 * s} ${1.8 * s} ${0.8 * s} -${1.8 * s} ${0.8 * s} -${0.8 * s} ${1.8 * s} -${0.8 * s} -${1.8 * s} -${1.8 * s} -${0.8 * s} ${1.8 * s} -${0.8 * s}z`}
      fill="#fff4c4"
    />
  )
  return (
    <Frame {...p}>
      <defs>
        <clipPath id={clip}>
          <circle cx={24} cy={24} r={19} />
        </clipPath>
      </defs>
      <circle cx={24} cy={24} r={19} fill={c.sky} />
      <g clipPath={`url(#${clip})`}>
        {time === 'morgen' && <Sun cx={17} cy={31} r={7} face={false} />}
        {time === 'tag' && <Sun cx={24} cy={19} r={7.5} face={false} />}
        {time === 'abend' && (
          <g>
            <circle cx={30} cy={31} r={9} fill="#ff8a4d" stroke="#d9572f" strokeWidth={2.2} />
            <ellipse cx={27} cy={27} rx={3} ry={1.6} fill="#ffc29a" />
          </g>
        )}
        {time === 'daemmerung' && (
          <g>
            {moon(29, 17, 6)}
            {star(14, 15, 0.9)}
          </g>
        )}
        {time === 'nacht' && (
          <g>
            {moon(27, 18, 7)}
            {star(13, 13)}
            {star(17, 24, 0.7)}
            {star(38, 29, 0.8)}
          </g>
        )}
        <path d="M2 36 C 12 29, 22 30, 30 34 C 36 31, 42 31, 48 33 V48 H0 Z" fill={c.hill} stroke={c.hillLine} strokeWidth={2.2} />
      </g>
      <circle cx={24} cy={24} r={19} fill="none" stroke={c.ring} strokeWidth={2.6} />
    </Frame>
  )
}
