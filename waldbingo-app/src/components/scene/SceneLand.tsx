// Landschafts-Ebenen von hinten nach vorn: ferne Hügel + Baumreihe, mittlere
// Bäume (wiegen im Wind), Nebelbänder, Vordergrund-Wiese mit Deko, Gräser,
// rahmende Bäume links/rechts. Alle Ebenen teilen das Koordinatensystem aus
// geometry.ts (2000×600, `xMidYMax slice`) – damit passen sie aufeinander.
import { type CSSProperties, Fragment, type ReactNode } from 'react'
import { mix, type SceneState } from '../../lib/scene'
import {
  BACK_TREES,
  BIG_FIR_TIERS,
  FRAME_SIDE_CLUMPS,
  BUSHES,
  DRIFTS,
  FAR_TREES,
  FERNS,
  firRime,
  firSnowCap,
  FLOWERS,
  GROUND_LEAVES,
  HILLS_FAR,
  HILLS_NEAR,
  MEADOW_EDGE,
  MEADOW_FRONT,
  MID_BASE,
  MID_TREES,
  MUSHROOMS,
  OAK_BLOSSOMS,
  OAK_CROWN,
  BARE_OAK,
  PUDDLES,
  RIDGE_FAR,
  ROCKS,
  smoothArea,
  smoothLine,
  tuftPath,
  TUFTS_EDGE,
  TUFTS_FRONT,
  VIEW_H,
  VIEW_W,
  yAt,
  type Prop,
} from './geometry'
import { BareTree, Blossoms, Circles, ClumpCrown, type DefIds, FirBody, INK, SHADE_OPACITY } from './SceneDefs'
import { mv } from './scene-mixes'

const LAND_BOX = 'absolute inset-x-0 bottom-0 h-[64%] w-full'
const VB = `0 0 ${VIEW_W} ${VIEW_H}`

function Land({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className={`${LAND_BOX} ${className}`} aria-hidden="true">
      {children}
    </svg>
  )
}

const tr = (x: number, y: number, s: number, flip?: boolean) =>
  `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`

// ── Ferne Ebene (statisch) ───────────────────────────────────────────────────

export function FarLayer({ ids, scene }: { ids: DefIds; scene: SceneState }) {
  const bare = scene.foliage === 'kahl'
  return (
    <Land>
      <path d={smoothArea(HILLS_FAR)} style={{ fill: 'var(--sc-hill-far)' }} />
      {/* zarte Lichtkante auf dem Bergkamm */}
      <path d={smoothLine(HILLS_FAR)} fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={3} />
      <path d={smoothArea(RIDGE_FAR.map(([x, y]) => [x, y + 6] as const))} style={{ fill: 'var(--sc-tree-far)' }} />
      <g
        style={{
          fill: 'var(--sc-tree-far)',
          color: bare ? mv('farOakBare') : mv('farOak'),
        }}
      >
        {FAR_TREES.map((t, i) => (
          <use
            key={i}
            href={`#${t.kind === 'fir' ? ids.firSil : ids.oakSil}`}
            transform={tr(t.x, t.y, t.s)}
            style={t.kind === 'fir' ? undefined : { fill: 'currentColor' }}
          />
        ))}
      </g>
      {scene.snowCover && (
        <g style={{ fill: 'var(--sc-snow)' }} opacity={0.8}>
          {FAR_TREES.filter((t) => t.kind === 'fir').map((t, i) => (
            <path key={i} d={firSnowCap([-100, -63, 17])} transform={tr(t.x, t.y, t.s)} />
          ))}
        </g>
      )}
      <path d={smoothArea(HILLS_NEAR)} style={{ fill: 'var(--sc-hill-near)' }} />
      <path d={smoothLine(HILLS_NEAR)} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={3} />
      {/* hintere Waldreihe: dichter Wald zwischen Hügel und mittleren Bäumen */}
      <g
        style={{
          fill: mv('backFir'),
          color: bare ? mv('backOakBare') : mv('backOak'),
        }}
      >
        {BACK_TREES.map((t, i) => (
          <use
            key={i}
            href={`#${t.kind === 'fir' ? ids.firSil : ids.oakSil}`}
            transform={tr(t.x, t.y, t.s)}
            style={t.kind === 'fir' ? undefined : { fill: 'currentColor' }}
          />
        ))}
      </g>
      {scene.snowCover && (
        <g style={{ fill: 'var(--sc-snow)' }} opacity={0.9}>
          {BACK_TREES.filter((t) => t.kind === 'fir').map((t, i) => (
            <path key={i} d={firSnowCap([-100, -63, 17])} transform={tr(t.x, t.y, t.s)} />
          ))}
        </g>
      )}
    </Land>
  )
}

// ── Mittlere Baumreihe (wiegt im Wind) ───────────────────────────────────────

export function MidLayer({ ids, scene }: { ids: DefIds; scene: SceneState }) {
  const leafFill: CSSProperties = {
    fill: mv('midLeaf'),
    color: 'var(--sc-foliage-accent)',
  }
  return (
    <Land className="sc-sway-mid">
      <path
        d={smoothArea(MID_BASE.map(([x, y]) => [x, y - 4] as const))}
        style={{ fill: mv('midBase') }}
      />
      {MID_TREES.map((t, i) => {
        const y = yAt(MID_BASE, t.x) + 4
        const t1 = tr(t.x, y, t.s)
        if (t.kind === 'fir')
          return (
            <Fragment key={i}>
              <use
                href={`#${scene.snowCover ? ids.firSnowy : ids.fir}`}
                transform={t1}
                style={{ fill: 'var(--sc-tree-mid)' }}
              />
              {scene.frost && !scene.snowCover && <use href={`#${ids.firRime}`} transform={t1} />}
            </Fragment>
          )
        // Abwechslung ohne zweites Symbol: jede zweite Krone gespiegelt, leicht gestaucht/gestreckt.
        const v = i % 3
        const tv = `translate(${t.x} ${y}) scale(${(i % 2 ? -1 : 1) * t.s * (v === 0 ? 1 : v === 1 ? 0.9 : 1.08)} ${t.s * (v === 1 ? 1.06 : 1)})`
        return <use key={i} href={`#${t.kind === 'oak' ? ids.oak : ids.birch}`} transform={tv} style={leafFill} />
      })}
    </Land>
  )
}

// ── Nebelbänder (HTML, driften langsam) ─────────────────────────────────────

export function FogBand({ scene, top, height, strength, slow }: {
  scene: SceneState
  top: string
  height: string
  strength: number
  slow?: boolean
}) {
  const c = scene.isNight ? mix(scene.palette.skyBottom, '#7d88a8', 0.5) : mix(scene.palette.skyBottom, '#ffffff', 0.55)
  const a = (v: number) => {
    const n = parseInt(c.slice(1), 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${v})`
  }
  return (
    <div
      className={`sc-fog-band sc-fade absolute -left-[25%] w-[150%] ${slow ? 'sc-slow' : ''}`}
      style={{
        top,
        height,
        opacity: Math.min(1, scene.fog * strength),
        background: `radial-gradient(38% 50% at 28% 55%, ${a(0.95)}, ${a(0)}), radial-gradient(42% 55% at 70% 45%, ${a(0.9)}, ${a(0)}), linear-gradient(${a(0)}, ${a(0.75)} 45%, ${a(0.75)} 60%, ${a(0)})`,
      }}
    />
  )
}

// ── Vordergrund-Wiese (statisch) ─────────────────────────────────────────────

export function FrontLayer({ uid, scene }: { uid: string; scene: SceneState }) {
  const lush = (scene.foliage === 'bluete' || scene.foliage === 'satt') && !scene.snowCover
  const mushrooms = (scene.foliage === 'herbstlaub' || (scene.wet && scene.foliage === 'satt')) && !scene.snowCover
  const ferns = !scene.snowCover
  const leaves = scene.foliage === 'herbstlaub' && !scene.snowCover
  const bushClip = bushClipId(uid)
  const shadeGrad = `${uid}-front-shade`
  return (
    <Land>
      <defs>
        <clipPath id={bushClip} clipPathUnits="userSpaceOnUse">
          {BUSH_CIRCLES.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </clipPath>
        <linearGradient id={shadeGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sc-ground-shade)' }} stopOpacity="0" />
          <stop offset="1" style={{ stopColor: 'var(--sc-ground-shade)' }} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path d={smoothArea(MEADOW_EDGE)} style={{ fill: 'var(--sc-ground)' }} />
      <path d={smoothLine(MEADOW_EDGE)} fill="none" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={3} />

      {BUSHES.map((b, i) => (
        <Bush
          key={i}
          p={b}
          clip={bushClip}
          snow={scene.snowCover}
          night={scene.isNight}
          berries={scene.foliage !== 'bluete' || i % 2 === 0}
        />
      ))}
      {ferns && FERNS.map((f, i) => <Fern key={i} p={f} />)}
      {ROCKS.map((r, i) => (
        <Rock key={i} p={r} snow={scene.snowCover} />
      ))}
      {scene.snowCover && DRIFTS.map((d, i) => <Drift key={i} {...d} />)}

      {/* vordere Wiesenwelle */}
      <path
        d={smoothArea(MEADOW_FRONT)}
        style={{ fill: mv('meadowFront') }}
      />
      <path d={smoothLine(MEADOW_FRONT)} fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={2.5} />

      {scene.wet && PUDDLES.map((p, i) => <Puddle key={i} {...p} />)}
      {leaves &&
        GROUND_LEAVES.map((l, i) => (
          <path
            key={i}
            d="M0 -6Q5 -1 0 6Q-5 -1 0 -6Z"
            transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}
            style={{
              fill: l.tone === 0 ? 'var(--sc-foliage)' : l.tone === 1 ? 'var(--sc-foliage-accent)' : 'var(--sc-flower)',
            }}
          />
        ))}
      {lush && FLOWERS.map((f, i) => <Flower key={i} p={f} daisy={i % 3 === 0} />)}
      {mushrooms && MUSHROOMS.map((m, i) => <Mushroom key={i} p={m} />)}

      {/* Bodenschatten ganz vorne – rahmt und beruhigt die Unterkante */}
      <rect x={0} y={505} width={VIEW_W} height={95} fill={`url(#${shadeGrad})`} />
    </Land>
  )
}

const bushClipId = (uid: string) => `${uid}-bush-clip`

const BUSH_CIRCLES: readonly (readonly [number, number, number])[] = [
  [-24, -15, 16],
  [0, -26, 21],
  [23, -15, 16],
  [-11, -10, 14],
  [12, -9, 14],
]

const BUSH_BERRIES: readonly (readonly [number, number])[] = [
  [-20, -20],
  [-4, -34],
  [10, -24],
  [24, -14],
  [-8, -12],
  [4, -40],
]

function Bush({
  p,
  clip,
  snow,
  berries,
  night,
  outlineWidth = 3.2,
}: {
  p: Prop
  clip: string
  snow: boolean
  berries: boolean
  night: boolean
  outlineWidth?: number
}) {
  const fill = mv('bush')
  return (
    <g transform={tr(p.x, p.y, p.s, p.flip)}>
      <g style={{ fill, stroke: mv('bushLine') }} strokeWidth={outlineWidth}>
        <Circles c={BUSH_CIRCLES} />
      </g>
      <g style={{ color: mv('bushHi') }}>
        <ClumpCrown crown={BUSH_CIRCLES} clip={clip} foliage="satt" snow={snow} fill={fill} />
      </g>
      {berries &&
        BUSH_BERRIES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3.4} style={{ fill: 'var(--sc-flower)' }} />
            {!night && <circle cx={x - 1.1} cy={y - 1.1} r={1} fill="#ffffff" opacity={0.75} />}
          </g>
        ))}
    </g>
  )
}

/** Farnwedel: Fiederblättchen links/rechts entlang eines gebogenen Stiels. */
const FROND = (() => {
  let d = ''
  const len = 40
  for (let i = 0; i < 8; i++) {
    const t = 0.14 + i * 0.11
    const y = -len * t
    const x = t * t * 6
    const l = 11 * (1 - t * 0.75)
    for (const side of [-1, 1]) {
      const tx = x + side * l
      const ty = y - l * 0.45
      d += `M${x.toFixed(1)} ${y.toFixed(1)}Q${(x + side * l * 0.5).toFixed(1)} ${(y - l * 0.62).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(x + side * l * 0.45).toFixed(1)} ${(y + 1.2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`
    }
  }
  d += `M-1.2 0Q0 ${-len * 0.6} ${(6).toFixed(1)} ${-len}Q1.2 ${-len * 0.6} 1.2 0Z`
  return d
})()

function Fern({ p }: { p: Prop }) {
  return (
    <g transform={tr(p.x, p.y, p.s, p.flip)} style={{ fill: mv('fern') }}>
      <path d={FROND} transform="rotate(-38)" />
      <path d={FROND} transform="rotate(34) scale(-0.92 0.92)" />
      <path d={FROND} transform="rotate(-6) scale(1.1)" />
    </g>
  )
}

function Rock({ p, snow }: { p: Prop; snow: boolean }) {
  return (
    <g transform={tr(p.x, p.y, p.s, p.flip)}>
      <path
        d="M-24 0Q-27 -16 -10 -22Q8 -28 20 -14Q27 -4 22 0Z"
        style={{ fill: mv('rock'), stroke: mv('rockLine') }}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <path d="M2 -24Q18 -22 21 -10Q22 -2 18 0L6 0Q12 -12 2 -24Z" fill={INK} opacity={SHADE_OPACITY} />
      <path
        d={snow ? 'M-20 -12Q-14 -26 4 -25Q16 -22 20 -14Q8 -18 -4 -15Q-14 -12 -20 -12Z' : 'M-18 -12Q-12 -22 2 -23Q-6 -17 -18 -12Z'}
        style={{ fill: snow ? 'var(--sc-snow)' : mv('rockMoss') }}
      />
    </g>
  )
}

function Drift({ x, w, h }: { x: number; w: number; h: number }) {
  const y = yAt(MEADOW_EDGE, x) + 6
  return (
    <g>
      <path
        d={`M${x - w / 2} ${y + 4}C${x - w * 0.3} ${y - h} ${x + w * 0.2} ${y - h * 1.15} ${x + w / 2} ${y + 4}Z`}
        style={{ fill: 'var(--sc-snow)' }}
      />
      <path
        d={`M${x - w * 0.1} ${y + 4}C${x + w * 0.12} ${y - h * 0.5} ${x + w * 0.32} ${y - h * 0.4} ${x + w / 2} ${y + 4}Z`}
        style={{ fill: 'var(--sc-ground-shade)' }}
        opacity={0.35}
      />
    </g>
  )
}

function Puddle({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 1.5} rx={rx + 3} ry={ry + 2.5} style={{ fill: 'var(--sc-ground-shade)' }} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} style={{ fill: mv('puddle') }} />
      <path
        d={`M${x - rx * 0.55} ${y - ry * 0.25}L${x - rx * 0.2} ${y - ry * 0.25}M${x + rx * 0.05} ${y + ry * 0.2}L${x + rx * 0.35} ${y + ry * 0.2}`}
        stroke="#ffffff"
        strokeOpacity={0.6}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  )
}

function Flower({ p, daisy }: { p: Prop; daisy: boolean }) {
  const petal = daisy ? mv('daisy') : 'var(--sc-flower)'
  return (
    <g transform={tr(p.x, p.y, p.s * 0.9, p.flip)}>
      <path d="M0 0Q-1 -6 0 -11" fill="none" style={{ stroke: 'var(--sc-ground-shade)' }} strokeWidth={1.6} strokeLinecap="round" />
      <g transform="translate(0 -13)">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={0} cy={-3.6} r={3.1} transform={`rotate(${a})`} style={{ fill: petal }} />
        ))}
        <circle r={2.4} fill="#f5b041" />
      </g>
    </g>
  )
}

function Mushroom({ p }: { p: Prop }) {
  return (
    <g transform={tr(p.x, p.y, p.s, p.flip)}>
      <ellipse cx={0} cy={0} rx={12} ry={2.6} fill={INK} opacity={0.18} />
      <path
        d="M-5 0Q-6.5 -8 -4 -13L4 -13Q6.5 -8 5 0Z"
        style={{ fill: mv('mushStem'), stroke: mv('mushStemLine') }}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path
        d="M-13 -11Q-13 -25 0 -26Q13 -25 13 -11Q0 -8 -13 -11Z"
        style={{ fill: mv('mushCap'), stroke: mv('mushCapLine') }}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <ellipse cx={-4.5} cy={-21} rx={4} ry={2.2} fill="#ffffff" opacity={0.35} />
    </g>
  )
}

// ── Gräser (wiegen im Wind) ──────────────────────────────────────────────────

const TUFT_D = [tuftPath(3, 5), tuftPath(5, 4), tuftPath(8, 6), tuftPath(13, 3)]

export function GrassEdge({ uid, scene }: { uid: string; scene: SceneState }) {
  const dry = scene.snowCover
  const fill = dry ? mv('grassEdgeDry') : scene.frost ? mv('grassEdgeFrost') : mv('grassEdge')
  return (
    <Land className="sc-sway-grass">
      <defs>
        {TUFT_D.map((d, i) => (
          <path key={i} id={`${uid}-tuft-${i}`} d={d} />
        ))}
      </defs>
      <g style={{ fill }}>
        {TUFTS_EDGE.filter((_, i) => !dry || i % 3 === 0).map((t, i) => (
          <use key={i} href={`#${uid}-tuft-${i % TUFT_D.length}`} transform={tr(t.x, t.y, t.s * 1.1, t.flip)} />
        ))}
      </g>
    </Land>
  )
}

export function GrassFront({ uid, scene }: { uid: string; scene: SceneState }) {
  const dry = scene.snowCover
  const fill = dry ? mv('grassFrontDry') : scene.frost ? mv('grassFrontFrost') : mv('grassFront')
  return (
    <Land className="sc-sway-front">
      <g style={{ fill }}>
        {TUFTS_FRONT.filter((_, i) => !dry || i % 2 === 0).map((t, i) => (
          <use key={i} href={`#${uid}-tuft-${(i + 1) % TUFT_D.length}`} transform={tr(t.x, t.y, t.s * 1.5, t.flip)} />
        ))}
      </g>
    </Land>
  )
}

// ── Rahmende Bäume (links Laubbaum, rechts große Tanne) ──────────────────────
// Eigenes Koordinatensystem 360×900, Stammmitte bei x = 180. Größe und Lage
// steuert scene.css (.sc-frame-*): am Handy nur am Rand, am Desktop breiter.

const FRAME_VB = '0 0 360 900'

export function FrameLeft({ uid, scene }: { uid: string; scene: SceneState }) {
  const bare = scene.foliage === 'kahl'
  const crownFill = mv('crown')
  const crownLine = mv('crownLine')
  const trunkLine = mv('trunkLine')
  const clip = `${uid}-frame-crown`
  const sideClip = `${uid}-frame-side`
  const k = 3.5
  return (
    <div className="sc-frame sc-frame-left sc-rock-left">
      <svg viewBox={FRAME_VB} preserveAspectRatio="xMidYMax meet" overflow="visible" className="block h-full w-full" aria-hidden="true">
        {bare ? (
          <g transform="translate(180 900) scale(5.6)">
            <BareTree
              branches={BARE_OAK}
              crown={OAK_CROWN}
              snow={scene.snowCover}
              frost={scene.frost}
              outline={trunkLine}
            />
          </g>
        ) : (
          <>
            <defs>
              <clipPath id={clip} clipPathUnits="userSpaceOnUse">
                <Circles c={OAK_CROWN} />
              </clipPath>
              <clipPath id={sideClip} clipPathUnits="userSpaceOnUse">
                <Circles c={FRAME_SIDE_CLUMPS} />
              </clipPath>
            </defs>
            {/* Äste zu den seitlichen Laub-Klumpen */}
            <g fill="none" strokeLinecap="round">
              <path d="M168 720Q130 690 92 650M196 790Q240 760 282 724" style={{ stroke: trunkLine }} strokeWidth={17} />
              <path d="M168 720Q130 690 92 650M196 790Q240 760 282 724" style={{ stroke: 'var(--sc-trunk)' }} strokeWidth={11} />
            </g>
            {/* Kräftiger Stamm mit Wurzelansatz, verschwindet in der Krone */}
            <path
              d="M120 902Q148 880 154 836Q162 680 162 470L198 470Q198 680 206 836Q212 880 242 902Z"
              style={{ fill: 'var(--sc-trunk)', stroke: trunkLine }}
              strokeWidth={3.2}
              strokeLinejoin="round"
            />
            <path d="M186 480Q190 680 198 836Q204 878 230 902L208 902Q194 876 190 836Q186 680 180 480Z" fill={INK} opacity={0.2} />
            <path d="M170 520Q166 620 170 720" fill="none" stroke="#ffffff" strokeOpacity={0.16} strokeWidth={5} strokeLinecap="round" />
            {/* seitliche Klumpen */}
            <g style={{ fill: crownFill, stroke: crownLine, color: 'var(--sc-foliage-accent)' }} strokeWidth={3.4}>
              <Circles c={FRAME_SIDE_CLUMPS} />
            </g>
            <g style={{ color: 'var(--sc-foliage-accent)' }}>
              <ClumpCrown crown={FRAME_SIDE_CLUMPS} clip={sideClip} foliage={scene.foliage} snow={scene.snowCover} fill={crownFill} />
            </g>
            {/* große Krone */}
            <g transform={`translate(180 600) scale(${k})`} style={{ color: 'var(--sc-foliage-accent)' }}>
              <g style={{ fill: crownFill, stroke: crownLine }} strokeWidth={3.4 / k}>
                <Circles c={OAK_CROWN} />
              </g>
              <ClumpCrown crown={OAK_CROWN} clip={clip} foliage={scene.foliage} snow={scene.snowCover} fill={crownFill} />
              {scene.foliage === 'bluete' && <Blossoms at={OAK_BLOSSOMS} r={3} />}
            </g>
          </>
        )}
        <CornerGreens uid={uid} scene={scene} side="left" />
      </svg>
    </div>
  )
}

/** Büsche und Farne am Fuß der Rahmen-Bäume (zur Bildmitte hin). */
function CornerGreens({ uid, scene, side }: { uid: string; scene: SceneState; side: 'left' | 'right' }) {
  const inner = side === 'left' ? 1 : -1
  const bushX = 180 + inner * 128
  return (
    <g>
      {!scene.snowCover && (
        <>
          <Fern p={{ x: 180 + inner * 60, y: 902, s: 2.3, flip: side === 'right' }} />
          <Fern p={{ x: 180 + inner * 205, y: 904, s: 1.9, flip: side === 'left' }} />
        </>
      )}
      <Bush
        p={{ x: bushX, y: 906, s: 2.3, flip: side === 'right' }}
        clip={bushClipId(uid)}
        snow={scene.snowCover}
        berries={scene.foliage !== 'bluete'}
        night={scene.isNight}
        outlineWidth={1.5}
      />
    </g>
  )
}

export function FrameRight({ uid, scene }: { uid: string; scene: SceneState }) {
  const fill = 'var(--sc-tree-near)'
  const sx = 4.9
  const sy = 8.7
  return (
    <div className="sc-frame sc-frame-right sc-rock-right">
      <svg viewBox={FRAME_VB} preserveAspectRatio="xMidYMax meet" overflow="visible" className="block h-full w-full" aria-hidden="true">
        <rect x={168} y={862} width={24} height={40} rx={4} style={{ fill: 'var(--sc-trunk)', stroke: mv('trunkLine') }} strokeWidth={3} />
        <g transform={`translate(180 ${900 - 0.04 * sy}) scale(${sx} ${sy})`} style={{ fill }}>
          <FirBody tiers={BIG_FIR_TIERS} snow={scene.snowCover} trunk={false} outline={mv('firLine')} />
          {scene.frost && !scene.snowCover && (
            <g fill="none" style={{ stroke: 'var(--sc-snow)' }} strokeLinecap="round">
              {BIG_FIR_TIERS.map((t, i) => (
                <path key={i} d={firRime(t)} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}
        </g>
        <CornerGreens uid={uid} scene={scene} side="right" />
      </svg>
    </div>
  )
}
