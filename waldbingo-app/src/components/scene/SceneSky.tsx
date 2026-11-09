// Himmels-Ebenen: Verlauf, Horizont-Glühen, Sonne/Mond (+ Glühen, Strahlen),
// Sterne, driftende Wolken, Wolkendecke und Regenbogen.
import type { CSSProperties } from 'react'
import type { Tageszeit } from '../../data/types'
import type { SceneState } from '../../lib/scene'
import { STARS } from './geometry'
import { mv } from './scene-mixes'

/**
 * Lage von Sonne/Mond je Tageszeit (Prozent der Szene) im Quer-/Breitformat.
 * Morgens Osten (links), abends Westen. Im Hochformat (Seitenverhältnis < 0,8)
 * stehen die Gestirne dagegen immer in einer festen, freien Ecke rechts oben
 * (BODY_POS_TALL, umgesetzt in scene.css per Container-Query) – dort verdecken
 * sie weder Logo noch Überschriften, Spieler-Tabs oder Wingo. Die Tageszeit
 * zeigt sich dann über Farbe von Himmel, Scheibe und Horizont-Glühen.
 */
export const BODY_POS: Record<Tageszeit, { left: number; top: number }> = {
  morgen: { left: 24, top: 21 },
  tag: { left: 72, top: 10 },
  abend: { left: 76, top: 24 },
  daemmerung: { left: 24, top: 15 },
  nacht: { left: 73, top: 10 },
}

/** Feste Lage der Gestirne im Hochformat (scene.css schaltet per Container-Query darauf um). */
export const BODY_POS_TALL = { left: 84, top: 10 } as const

/** Horizont-Glühen: Morgens im Osten (links), abends im Westen (rechts). */
const HORIZON_X: Record<Tageszeit, number> = { morgen: 28, tag: 50, abend: 72, daemmerung: 40, nacht: 50 }

const SUN_DISC: Record<Tageszeit, [string, string]> = {
  morgen: ['#ffe7b0', '#ffc27a'],
  tag: ['#fff4b8', '#ffd45e'],
  abend: ['#ffc67a', '#ff9440'],
  daemmerung: ['#ffc67a', '#ff9440'],
  nacht: ['#fff4b8', '#ffd45e'],
}

/** Durchmesser der Himmelskörper (scene.css: Container-Einheiten mit Rückfall). */
const DISC = 'var(--scx-disc)'

export function SceneSky({ uid, scene }: { uid: string; scene: SceneState }) {
  const pos = BODY_POS[scene.time]
  const dayGlow = !scene.isNight && scene.daylight > 0.4
  const warm = scene.time === 'morgen' || scene.time === 'abend'
  const horizon = warm ? 0.75 : scene.time === 'daemmerung' ? 0.6 : dayGlow ? 0.28 : 0.18
  const overcast = Math.max(0, Math.min(1, (scene.clouds - 0.55) / 0.35))
  // Morgen-/Abendrot bleibt auch bei Regen/Bewölkung als schmaler, warmer
  // Streifen am Horizont sichtbar – sonst sähe „Abend · Regen“ aus wie „Tag · Regen“.
  const dim = warm ? 0.25 : 0.6
  return (
    <>
      <div className="sc-sky absolute inset-0" />
      {/* Horizont-Glühen (Morgen-/Abendrot, tagsüber nur zart) */}
      <div
        className="sc-horizon sc-fade absolute inset-x-0 top-[18%] h-[42%]"
        style={{ opacity: horizon * (1 - overcast * dim), '--hx': `${HORIZON_X[scene.time]}%` } as CSSProperties}
      />
      {warm && (
        <div
          className="sc-horizon-band sc-fade absolute inset-x-0"
          style={{ opacity: overcast * 0.8 }}
        />
      )}
      <Stars visible={scene.stars} />
      <Celestial uid={uid} scene={scene} pos={pos} />
      <Rainbow visible={scene.rainbow} />
      <CloudBank amount={overcast} />
      <Clouds scene={scene} />
    </>
  )
}

function Celestial({ uid, scene, pos }: { uid: string; scene: SceneState; pos: { left: number; top: number } }) {
  const sun = scene.celestial === 'sun'
  const moon = scene.celestial === 'moon'
  // Sonne hinter Wolken/Nebel: nur ein heller, diffuser Fleck.
  const diffuse = scene.celestial === 'none' && !scene.isNight && scene.daylight > 0.3
  const [disc, rim] = SUN_DISC[scene.time]
  // Lage über Variablen: scene.css setzt im Hochformat eine feste Ecke ein.
  const place: CSSProperties = { left: 'var(--bx)', top: 'var(--by)' }
  const rays = sun && scene.clouds < 0.6 && scene.fog < 0.3
  return (
    <div
      className="sc-bodies absolute inset-0"
      style={
        {
          '--bx-wide': `${pos.left}%`,
          '--by-wide': `${pos.top}%`,
          '--bx-tall': `${BODY_POS_TALL.left}%`,
          '--by-tall': `${BODY_POS_TALL.top}%`,
        } as CSSProperties
      }
    >
      {rays && <SunRays />}
      {/* Glühen */}
      <div className="sc-move absolute" style={place}>
        <div
          className="sc-glow absolute left-0 top-0 rounded-full"
          style={{
            width: `calc(${DISC} * ${diffuse ? 7 : moon ? 5 : 6})`,
            height: `calc(${DISC} * ${diffuse ? 7 : moon ? 5 : 6})`,
            background: `radial-gradient(closest-side, ${
              moon ? mv('glowMoon') : diffuse ? mv('glowDiffuse') : mv('glowSun')
            } 0%, ${mv('glowSoft')} 42%, transparent 100%)`,
            opacity: sun || moon ? 1 : diffuse ? 0.75 : 0,
          }}
        />
      </div>
      {/* Sonne */}
      <div
        className="sc-move sc-fade absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...place, width: DISC, height: DISC, opacity: sun ? 1 : 0 }}
      >
        <svg viewBox="0 0 100 100" className="block h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill={rim} />
          <circle cx="50" cy="50" r="40" fill={disc} />
          <circle cx="40" cy="38" r="20" fill="#ffffff" opacity="0.35" />
          <circle cx="34" cy="31" r="6" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>
      {/* Mond (Sichel mit sanften Kratern) */}
      <div
        className="sc-move sc-fade absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...place, width: `calc(${DISC} * 0.9)`, height: `calc(${DISC} * 0.9)`, opacity: moon ? 1 : 0 }}
      >
        <svg viewBox="0 0 100 100" className="block h-full w-full" aria-hidden="true">
          <defs>
            <mask id={`${uid}-moon-cut`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <rect width="100" height="100" fill="#ffffff" />
              <circle cx="66" cy="38" r="38" fill="#000000" />
            </mask>
          </defs>
          <g mask={`url(#${uid}-moon-cut)`}>
            <circle cx="50" cy="50" r="44" fill="#e8d9a8" />
            <circle cx="47" cy="52" r="39" fill="#fff4d2" />
            <circle cx="24" cy="60" r="5" fill="#e8d9a8" opacity="0.8" />
            <circle cx="36" cy="80" r="3.5" fill="#e8d9a8" opacity="0.8" />
            <circle cx="16" cy="42" r="3" fill="#e8d9a8" opacity="0.7" />
          </g>
        </svg>
      </div>
    </div>
  )
}

/** Weiche Lichtstrahlen, die vom Himmelskörper ausgehen. */
function SunRays() {
  const at = 'var(--bx) var(--by)'
  const mask = `radial-gradient(circle at ${at}, #000 0%, rgba(0,0,0,.5) 22%, transparent 48%)`
  return (
    <div
      className="sc-rays absolute inset-0"
      style={{
        background: `repeating-conic-gradient(from 8deg at ${at}, rgba(255,250,225,.1) 0deg 6deg, rgba(255,250,225,0) 6deg 21deg)`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  )
}

function Stars({ visible }: { visible: boolean }) {
  return (
    <div className="sc-fade absolute inset-x-0 top-0 h-[60%]" style={{ opacity: visible ? 1 : 0 }}>
      {([0, 1, 2] as const).map((g) => (
        <div key={g} className={`sc-stars-${g} absolute inset-0`}>
          <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMin slice" className="block h-full w-full">
            <g fill="#fff8e2">
              {STARS.filter((s) => s.g === g).map((s, i) =>
                s.big ? (
                  <path
                    key={i}
                    transform={`translate(${s.x} ${s.y})`}
                    d={`M0 ${-s.r * 3}Q0 0 ${s.r * 3} 0Q0 0 0 ${s.r * 3}Q0 0 ${-s.r * 3} 0Q0 0 0 ${-s.r * 3}Z`}
                  />
                ) : (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={0.55 + (i % 4) * 0.12} />
                ),
              )}
            </g>
          </svg>
        </div>
      ))}
    </div>
  )
}

/** Wolken-Silhouetten (viewBox 200×90): flache Unterkante, runde Puschel. */
const CLOUD_SHAPES: readonly (readonly [number, number, number])[][] = [
  [
    [48, 58, 26],
    [86, 42, 34],
    [128, 50, 28],
    [160, 62, 20],
    [30, 66, 16],
  ],
  [
    [44, 60, 22],
    [76, 48, 28],
    [112, 38, 34],
    [148, 54, 26],
    [174, 66, 14],
  ],
  [
    [56, 56, 28],
    [100, 46, 30],
    [138, 58, 22],
    [32, 66, 14],
  ],
]

/**
 * Feste Wolken-Reihen (Höhe in %, Größe, Grunddauer, Startversatz, Form).
 * `tall` = Höhe im Hochformat: Dort liegen zwischen ca. 13 % und 29 % Spieler-Tabs,
 * Wingo und Sprechblasen – die Wolken ziehen deshalb oberhalb (zwischen den
 * HUD-Knöpfen) oder knapp über den Hügeln, statt als Streifen unter den Tabs.
 */
const CLOUD_ROWS: readonly { top: number; tall: number; s: number; dur: number; off: number; shape: number }[] = [
  { top: 7, tall: 3, s: 1.0, dur: 150, off: 0.62, shape: 0 },
  { top: 18, tall: 31, s: 0.72, dur: 190, off: 0.18, shape: 2 },
  { top: 27, tall: 0.5, s: 0.86, dur: 170, off: 0.85, shape: 1 },
  { top: 3, tall: 0.5, s: 0.62, dur: 210, off: 0.38, shape: 2 },
  { top: 13, tall: 33, s: 1.15, dur: 140, off: 0.05, shape: 1 },
  { top: 33, tall: 4.5, s: 0.66, dur: 200, off: 0.5, shape: 0 },
  { top: 22, tall: 30, s: 1.05, dur: 160, off: 0.3, shape: 0 },
  { top: 9, tall: 5.5, s: 0.8, dur: 180, off: 0.78, shape: 2 },
  { top: 30, tall: 35, s: 0.95, dur: 155, off: 0.95, shape: 1 },
]

function Clouds({ scene }: { scene: SceneState }) {
  const n = Math.round(2 + scene.clouds * 7)
  const speed = 0.55 + scene.wind * 2.2
  return (
    <>
      {CLOUD_ROWS.slice(0, n).map((c, i) => {
        const dur = c.dur / speed
        return (
          <div
            key={i}
            className="sc-cloud-row absolute left-0 w-full"
            style={
              {
                // Höhe über Variablen: scene.css wählt im Hochformat `tall`.
                '--ct': `${c.top}%`,
                '--ct-tall': `${c.tall}%`,
                // Standbild-Lage, falls Animationen aus sind (reduzierte Bewegung): sichtbar verteilt.
                transform: `translateX(${(-8 + 86 * c.off).toFixed(1)}%)`,
                animationDuration: `${dur}s`,
                animationDelay: `${-c.off * dur}s`,
              } as CSSProperties
            }
          >
            {/* Einblenden auf eigenem Element – sonst überschreibt die Kurzform die Drift-Animation. */}
            <div className="anim-fade">
              <Cloud shape={CLOUD_SHAPES[c.shape]} scale={c.s} night={scene.isNight} />
            </div>
          </div>
        )
      })}
    </>
  )
}

function Cloud({
  shape,
  scale,
  night,
}: {
  shape: readonly (readonly [number, number, number])[]
  scale: number
  night: boolean
}) {
  // Sockel nur so breit wie die Puschel (kein überstehender „Riegel“).
  const x0 = Math.min(...shape.map(([cx, , r]) => cx - r * 0.7))
  const x1 = Math.max(...shape.map(([cx, , r]) => cx + r * 0.7))
  const big = shape.reduce((a, b) => (b[2] > a[2] ? b : a))
  return (
    <svg
      viewBox="0 0 200 90"
      className="block"
      style={{ width: `calc(var(--scx-cloud-w) * ${scale})`, aspectRatio: '200 / 90' }}
      aria-hidden="true"
    >
      {/* Unterseite im Schattenton */}
      <g style={{ fill: mv('cloudShade') }}>
        {shape.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
        <rect x={x0} y={58} width={x1 - x0} height={24} rx={12} />
      </g>
      {/* Oberseite in Wolkenfarbe, leicht nach oben versetzt */}
      <g style={{ fill: 'var(--sc-cloud)' }}>
        {shape.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy - 4} r={r * 0.97} />
        ))}
        <rect x={x0 + 4} y={56} width={x1 - x0 - 8} height={20} rx={10} />
      </g>
      <ellipse
        cx={big[0] - big[2] * 0.32}
        cy={big[1] - big[2] * 0.5}
        rx={big[2] * 0.42}
        ry={big[2] * 0.2}
        fill="#ffffff"
        opacity={night ? 0.1 : 0.5}
      />
    </svg>
  )
}

/** Geschlossene Wolkendecke bei starker Bewölkung/Regen/Schnee. */
function CloudBank({ amount }: { amount: number }) {
  const puffs: [number, number, number][] = []
  for (let i = 0; i < 14; i++) puffs.push([i * 80 - 30, 132 + ((i * 37) % 3) * 9, 46 + ((i * 53) % 3) * 9])
  return (
    <div className="sc-fade sc-bank absolute -left-[6%] top-0 h-[27%] w-[112%]" style={{ opacity: amount }}>
      <svg viewBox="0 0 1000 220" preserveAspectRatio="xMidYMax slice" className="block h-full w-full" aria-hidden="true">
        {/* dunklere Unterkante … */}
        <g style={{ fill: mv('bankLow') }}>
          <rect x={-40} y={-200} width={1080} height={330} />
          {puffs.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </g>
        {/* … und hellere Oberseite */}
        <g style={{ fill: mv('bankHigh') }}>
          <rect x={-40} y={-200} width={1080} height={318} />
          {puffs.map(([x, y, r], i) => (
            <circle key={i} cx={x - 4} cy={y - 12} r={r * 0.94} />
          ))}
        </g>
      </svg>
    </div>
  )
}

const RAINBOW = ['#ff9c9c', '#ffc27d', '#ffe98a', '#a6e38f', '#8fd0f2', '#b9a2ee']

function Rainbow({ visible }: { visible: boolean }) {
  return (
    <div
      className="sc-fade absolute -translate-x-1/2"
      style={{
        left: '36%',
        bottom: '45%',
        width: 'var(--scx-rainbow-w)',
        aspectRatio: '2 / 1',
        opacity: visible ? 0.5 : 0,
        WebkitMaskImage: 'linear-gradient(#000 55%, transparent 100%)',
        maskImage: 'linear-gradient(#000 55%, transparent 100%)',
      }}
    >
      <svg viewBox="0 0 200 100" className="block h-full w-full" aria-hidden="true">
        {RAINBOW.map((c, i) => {
          const r = 92 - i * 5.2
          return <path key={c} d={`M${100 - r} 100A${r} ${r} 0 0 1 ${100 + r} 100`} fill="none" stroke={c} strokeWidth={5.6} />
        })}
        <path d="M30 100A70 70 0 0 1 170 100" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
      </svg>
    </div>
  )
}
