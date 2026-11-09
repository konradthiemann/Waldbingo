// Kleine, farbige Kontext-Symbole fürs Spielbrett (Jahreszeit, Wetter,
// Tageszeit, Lebensraum) und Bedien-Symbole (Kamera, Häkchen, Pfote …).
// Stil wie die Spielwelt: rund, flach, ein Schattenton. Alle dekorativ.
import type { ReactNode } from 'react'
import type { Habitat, Jahreszeit, Tageszeit, Wetter } from '../../data/types'

interface IconProps {
  size?: number
  className?: string
}

function Svg({ size = 18, className = '', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`block flex-none ${className}`}
    >
      {children}
    </svg>
  )
}

const SUN = (
  <>
    <g stroke="#f3b32d" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </g>
    <circle cx="12" cy="12" r="5.2" fill="#ffd34d" stroke="#e9a91f" strokeWidth="1.4" />
  </>
)

const CLOUD = (
  <path
    d="M7 18.5c-2.5 0-4.3-1.7-4.3-3.9 0-2 1.6-3.7 3.7-3.8.5-2.8 2.9-4.8 5.7-4.8 2.6 0 4.8 1.7 5.5 4.1 2.1.2 3.7 1.9 3.7 4.1 0 2.4-1.9 4.3-4.3 4.3Z"
    fill="#f4f7fa"
    stroke="#9fb0bd"
    strokeWidth="1.5"
  />
)

const FLAKE = (
  <g stroke="#5fa8d8" strokeWidth="2" strokeLinecap="round" fill="none">
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    <path d="M9.6 4.6 12 7l2.4-2.4M9.6 19.4 12 17l2.4 2.4" strokeWidth="1.6" />
  </g>
)

export function SeasonIcon({ season, ...p }: IconProps & { season: Jahreszeit }) {
  switch (season) {
    case 'fruehling':
      return (
        <Svg {...p}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="12"
              cy="6.6"
              rx="3.6"
              ry="4.4"
              fill="#ffb7cf"
              stroke="#e57f9f"
              strokeWidth="1.1"
              transform={`rotate(${a} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="2.9" fill="#ffd34d" stroke="#e9a91f" strokeWidth="1" />
        </Svg>
      )
    case 'sommer':
      return <Svg {...p}>{SUN}</Svg>
    case 'herbst':
      return (
        <Svg {...p}>
          <path
            d="M12 2.5c5.8 2.6 7.6 9.2 0 18.5-7.6-9.3-5.8-15.9 0-18.5Z"
            fill="#e8892f"
            stroke="#b25a1d"
            strokeWidth="1.4"
          />
          <path
            d="M12 6v15M12 11l-3-2.2M12 14.5l3-2.2"
            stroke="#b25a1d"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )
    case 'winter':
      return <Svg {...p}>{FLAKE}</Svg>
  }
}

export function WeatherIcon({ weather, ...p }: IconProps & { weather: Wetter | null }) {
  switch (weather) {
    case null:
      // Wetter offen: Wolke mit Fragezeichen (wie die Wetter-Kachel beim Planen).
      return (
        <Svg {...p}>
          {CLOUD}
          <path
            d="M10.4 11.6a1.75 1.75 0 1 1 2.5 1.6c-.55.27-.9.66-.9 1.25"
            fill="none"
            stroke="#62716a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.4" r=".95" fill="#62716a" />
        </Svg>
      )
    case 'klar':
      return <Svg {...p}>{SUN}</Svg>
    case 'bewoelkt':
      return (
        <Svg {...p}>
          <circle cx="16.5" cy="8" r="3.6" fill="#ffd34d" stroke="#e9a91f" strokeWidth="1.2" />
          {CLOUD}
        </Svg>
      )
    case 'regen':
      return (
        <Svg {...p}>
          <g transform="translate(0 -3)">{CLOUD}</g>
          <path
            d="M8 18.5l-1 2.6M12.2 18.5l-1 2.6M16.4 18.5l-1 2.6"
            stroke="#3f8fc4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      )
    case 'nach_regen':
      return (
        <Svg {...p}>
          <path d="M3 17a9 9 0 0 1 18 0" stroke="#e85d75" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M6 17a6 6 0 0 1 12 0" stroke="#f3c44d" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M9 17a3 3 0 0 1 6 0" stroke="#5fb87c" strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
      )
    case 'schnee':
      return <Svg {...p}>{FLAKE}</Svg>
    case 'frost':
      return (
        <Svg {...p}>
          <path
            d="M12 2.5 19.5 12 12 21.5 4.5 12Z"
            fill="#d4eefc"
            stroke="#5fa8d8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 6.5v11M8 12h8" stroke="#5fa8d8" strokeWidth="1.4" strokeLinecap="round" />
        </Svg>
      )
    case 'wind':
      return (
        <Svg {...p}>
          <g stroke="#6aa3c4" strokeWidth="2.1" strokeLinecap="round" fill="none">
            <path d="M3 9h11.5a2.8 2.8 0 1 0-2.8-2.8" />
            <path d="M3 13.5h15a2.8 2.8 0 1 1-2.8 2.8" />
            <path d="M3 18h7" />
          </g>
        </Svg>
      )
    case 'nebel':
      return (
        <Svg {...p}>
          <g stroke="#8a9aa6" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 8h16M6 12h13M4 16h15M8 20h9" />
          </g>
        </Svg>
      )
  }
}

export function TimeIcon({ time, ...p }: IconProps & { time: Tageszeit }) {
  switch (time) {
    case 'morgen':
      return (
        <Svg {...p}>
          <path
            d="M6.5 17a5.5 5.5 0 0 1 11 0Z"
            fill="#ffc78a"
            stroke="#e08a3c"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 5.5v3M5 9l1.8 1.6M19 9l-1.8 1.6" stroke="#e9a91f" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 18.5h18" stroke="#7a9a6a" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      )
    case 'tag':
      return <Svg {...p}>{SUN}</Svg>
    case 'abend':
      return (
        <Svg {...p}>
          <path
            d="M6.5 17a5.5 5.5 0 0 1 11 0Z"
            fill="#ff9a4d"
            stroke="#d0632a"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M3 18.5h18M6 21h12" stroke="#c86a4a" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      )
    case 'daemmerung':
      return (
        <Svg {...p}>
          <path
            d="M15.5 4.2A7.8 7.8 0 1 0 19.8 15 6.3 6.3 0 0 1 15.5 4.2Z"
            fill="#c9a8e8"
            stroke="#7a5cc4"
            strokeWidth="1.4"
          />
          <circle cx="19" cy="5" r="1.2" fill="#ffd34d" />
        </Svg>
      )
    case 'nacht':
      return (
        <Svg {...p}>
          <path
            d="M14.5 3.5A8.5 8.5 0 1 0 20.5 16 7 7 0 0 1 14.5 3.5Z"
            fill="#ffe08a"
            stroke="#d9a21f"
            strokeWidth="1.4"
          />
          <path d="M19 3.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z" fill="#ffe08a" />
        </Svg>
      )
  }
}

export function HabitatIcon({ habitat, ...p }: IconProps & { habitat: Habitat }) {
  if (habitat === 'gewaesser') {
    return (
      <Svg {...p}>
        <path
          d="M12 3c3.5 4.5 6 7.6 6 10.8a6 6 0 0 1-12 0C6 10.6 8.5 7.5 12 3Z"
          fill="#7cc6f2"
          stroke="#3f8fc4"
          strokeWidth="1.4"
        />
        <path d="M9.3 14.2a2.8 2.8 0 0 0 2.4 2.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </Svg>
    )
  }
  if (habitat === 'gebirge') {
    return (
      <Svg {...p}>
        <path
          d="M2.5 19.5 9 8l3.5 5.5L15 10l6.5 9.5Z"
          fill="#8fa8a0"
          stroke="#4f6b62"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M7.4 10.8 9 8l1.7 2.7-1 .8Z" fill="#fff" />
      </Svg>
    )
  }
  const leafy = habitat === 'laubwald' || habitat === 'park' || habitat === 'feldrand' || habitat === 'lichtung'
  return (
    <Svg {...p}>
      <rect x="10.8" y="14" width="2.4" height="7" rx="1" fill="#8a5a36" />
      {leafy ? (
        <circle cx="12" cy="10" r="7" fill="#5fb87c" stroke="#2f7d4f" strokeWidth="1.4" />
      ) : (
        <path d="M12 2.5 18.5 15h-13Z" fill="#3f9d63" stroke="#1f5b38" strokeWidth="1.4" strokeLinejoin="round" />
      )}
    </Svg>
  )
}

export function CameraIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M4 8.2c0-1.2 1-2.2 2.2-2.2h1.6l1.4-2h5.6l1.4 2h1.6c1.2 0 2.2 1 2.2 2.2v9.6c0 1.2-1 2.2-2.2 2.2H6.2C5 20 4 19 4 17.8Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12.8" r="4" fill="none" stroke="#fff" strokeWidth="2" />
    </Svg>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function InfoIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="7" r="2" fill="currentColor" />
      <rect x="10.2" y="10.2" width="3.6" height="9" rx="1.8" fill="currentColor" />
    </Svg>
  )
}

export function BackIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M14.5 5.5 8 12l6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function PawIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <g fill="currentColor">
        <ellipse cx="12" cy="15.5" rx="4.6" ry="3.9" />
        <ellipse cx="6.2" cy="10.2" rx="1.9" ry="2.4" />
        <ellipse cx="9.6" cy="6.6" rx="1.9" ry="2.5" />
        <ellipse cx="14.4" cy="6.6" rx="1.9" ry="2.5" />
        <ellipse cx="17.8" cy="10.2" rx="1.9" ry="2.4" />
      </g>
    </Svg>
  )
}

export function UsersIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <g fill="currentColor">
        <circle cx="9" cy="8.5" r="3.6" />
        <path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6Z" />
        <circle cx="17" cy="9.5" r="2.8" opacity=".65" />
        <path d="M15.6 13.8c3.3-.6 6 1.5 6 5.7h-4.5c0-2.2-.5-4.1-1.5-5.7Z" opacity=".65" />
      </g>
    </Svg>
  )
}

export function PrinterIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 3.5h10v5H7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="3" y="8.5" width="18" height="8.5" rx="2.2" fill="currentColor" />
      <path d="M7 14h10v6.5H7Z" fill="#fff" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  )
}

export function BookIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M12 6.5C9.6 4.6 6.5 4.2 3.5 4.8v13.4c3-.6 6.1-.2 8.5 1.7 2.4-1.9 5.5-2.3 8.5-1.7V4.8c-3-.6-6.1-.2-8.5 1.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 6.5v13.4" stroke="currentColor" strokeWidth="2" />
    </Svg>
  )
}

export function SproutIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21v-8" stroke="#7a4f2e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 13.5C12 9 9 6 4 6c0 4.6 3.2 7.5 8 7.5Z" fill="#5fb87c" stroke="#2f7d4f" strokeWidth="1.3" />
      <path d="M12 12c0-4.4 3-7.5 8-7.5 0 4.6-3.2 7.5-8 7.5Z" fill="#8ed3a0" stroke="#2f7d4f" strokeWidth="1.3" />
    </Svg>
  )
}

export function SeedIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path
        d="M12 3.5c3.3 2.5 5 5.6 5 9.2a5 5 0 0 1-10 0c0-3.6 1.7-6.7 5-9.2Z"
        fill="#c48d58"
        stroke="#7a4f2e"
        strokeWidth="1.4"
      />
      <path d="M12 8v9" stroke="#7a4f2e" strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  )
}

export function SparkleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.5l2.3 6.9 6.9 2.3-6.9 2.3L12 20.9l-2.3-6.9-6.9-2.3 6.9-2.3Z" fill="currentColor" />
    </Svg>
  )
}
