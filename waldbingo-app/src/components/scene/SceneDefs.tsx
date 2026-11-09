// Wiederverwendbare SVG-Bausteine der Waldszene (Tannen, Laubbäume, Birken).
// Liegen einmal in einem unsichtbaren <svg><defs> und werden von allen Ebenen
// per <use href="#…"> referenziert. Die Füllfarbe erbt jeder Baum vom <use>
// (fill = Baumfarbe der Ebene), Akzente nutzen `currentColor`.
import type { Foliage } from '../../lib/scene'
import {
  BARE_BIRCH,
  BARE_OAK,
  BIRCH_BLOSSOMS,
  BIRCH_CROWN,
  type Circle,
  FIR_TIERS,
  firHighlight,
  firRime,
  firShade,
  firSnowBand,
  firSnowCap,
  firTier,
  OAK_BLOSSOMS,
  OAK_CROWN,
  type Pt,
  type Tier,
} from './geometry'
import { mv, SCENE_INK } from './scene-mixes'

/** Dunkler Eigenton für Schatten-Overlays (nie Schwarz). */
export const INK = SCENE_INK
export const SHADE_OPACITY = 0.17
export const HI_OPACITY = 0.2

const TRUNK_DARK = mv('trunkDark')
export const BIRCH_BARK = mv('birchBark')

export interface DefsFlags {
  foliage: Foliage
  snowCover: boolean
  frost: boolean
}

/** Ids aller Bausteine für eine Szenen-Instanz (eindeutig je Instanz). */
export function defIds(uid: string) {
  return {
    firSil: `${uid}-fir-sil`,
    fir: `${uid}-fir`,
    firSnowy: `${uid}-fir-snowy`,
    firRime: `${uid}-fir-rime`,
    oak: `${uid}-oak`,
    oakSil: `${uid}-oak-sil`,
    birch: `${uid}-birch`,
    oakClip: `${uid}-oak-clip`,
    birchClip: `${uid}-birch-clip`,
  }
}

export type DefIds = ReturnType<typeof defIds>

export function SceneDefs({ uid, flags }: { uid: string; flags: DefsFlags }) {
  const ids = defIds(uid)
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <clipPath id={ids.oakClip} clipPathUnits="userSpaceOnUse">
          <Circles c={OAK_CROWN} />
        </clipPath>
        <clipPath id={ids.birchClip} clipPathUnits="userSpaceOnUse">
          <Circles c={BIRCH_CROWN} />
        </clipPath>

        {/* Tanne als reine Silhouette (ferne Reihe). */}
        <g id={ids.firSil}>
          {FIR_TIERS.slice()
            .reverse()
            .map((t, i) => (
              <path key={i} d={firTier(t)} />
            ))}
        </g>

        {/* Tanne mit Stamm, Schattenseite und Glanzlicht (ohne/mit Schnee). */}
        <g id={ids.fir}>
          <FirBody tiers={FIR_TIERS} snow={false} />
        </g>
        <g id={ids.firSnowy}>
          <FirBody tiers={FIR_TIERS} snow />
        </g>

        <g id={ids.firRime} fill="none" style={{ stroke: 'var(--sc-snow)' }} strokeWidth={1.6} strokeLinecap="round">
          {FIR_TIERS.map((t, i) => (
            <path key={i} d={firRime(t)} strokeOpacity={0.85} />
          ))}
        </g>

        {/* Laubbaum (Eiche) – Laubzustand je Jahreszeit. */}
        <g id={ids.oak}>
          {flags.foliage === 'kahl' ? (
            <BareTree branches={BARE_OAK} crown={OAK_CROWN} snow={flags.snowCover} frost={flags.frost} />
          ) : (
            <>
              <path d="M-5.5 0Q-4 -22 -3.4 -50L3.4 -50Q4 -22 5.5 0Z" style={{ fill: 'var(--sc-trunk)' }} />
              <ClumpCrown crown={OAK_CROWN} clip={ids.oakClip} foliage={flags.foliage} snow={flags.snowCover} />
              {flags.foliage === 'bluete' && <Blossoms at={OAK_BLOSSOMS} r={3.6} />}
            </>
          )}
        </g>

        {/* Birke – weißer Stamm mit dunklen Strichen. */}
        <g id={ids.birch}>
          {flags.foliage === 'kahl' ? (
            <BareTree branches={BARE_BIRCH} crown={BIRCH_CROWN} snow={flags.snowCover} frost={flags.frost} birch />
          ) : (
            <>
              <path d="M-3.6 0Q-3 -30 -2.4 -66L2.4 -66Q3 -30 3.6 0Z" style={{ fill: BIRCH_BARK }} />
              <g fill={INK} opacity={0.5}>
                <rect x={-2.6} y={-14} width={3.4} height={1.6} rx={0.8} />
                <rect x={-0.4} y={-27} width={3} height={1.5} rx={0.75} />
                <rect x={-2.4} y={-40} width={3} height={1.5} rx={0.75} />
              </g>
              <ClumpCrown crown={BIRCH_CROWN} clip={ids.birchClip} foliage={flags.foliage} snow={flags.snowCover} />
              {flags.foliage === 'bluete' && <Blossoms at={BIRCH_BLOSSOMS} r={3.2} />}
            </>
          )}
        </g>

        {/* Ferne Laubbaum-Silhouette (nur Krone + Stämmchen). */}
        <g id={ids.oakSil}>
          {flags.foliage === 'kahl' ? (
            <>
              {BARE_OAK.slice(0, 4).map((b, i) => (
                <path key={i} d={b.d} fill="none" stroke="currentColor" strokeWidth={b.w * 1.4} strokeLinecap="round" />
              ))}
              <Circles c={OAK_CROWN} opacity={0.35} fill="currentColor" />
            </>
          ) : (
            <>
              <rect x={-4} y={-50} width={8} height={50} />
              <Circles c={OAK_CROWN} />
            </>
          )}
        </g>
      </defs>
    </svg>
  )
}

export function Circles({ c, ...rest }: { c: readonly Circle[]; opacity?: number; fill?: string }) {
  return (
    <>
      {c.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} {...rest} />
      ))}
    </>
  )
}

/** Tannenkörper: Etagen von unten nach oben, je Etage Schatten, Glanz, ggf. Schnee. */
export function FirBody({
  tiers,
  snow,
  trunk = true,
  outline,
}: {
  tiers: readonly Tier[]
  snow: boolean
  trunk?: boolean
  /** Konturfarbe (nur Vordergrund) – Strich bleibt bei Skalierung gleich dick. */
  outline?: string
}) {
  const order = tiers.map((t, i) => ({ t, i })).reverse()
  return (
    <>
      {trunk && <path d="M-4 0L-3 -15L3 -15L4 0Z" style={{ fill: TRUNK_DARK }} />}
      {order.map(({ t, i }) => (
        <g key={i}>
          <path
            d={firTier(t)}
            style={outline ? { stroke: outline } : undefined}
            strokeWidth={outline ? 3.2 : undefined}
            strokeLinejoin="round"
            vectorEffect={outline ? 'non-scaling-stroke' : undefined}
          />
          <path d={firShade(t)} fill={INK} opacity={SHADE_OPACITY} />
          <path
            d={firHighlight(t)}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={HI_OPACITY}
            strokeWidth={outline ? 3 : 2.2}
            vectorEffect={outline ? 'non-scaling-stroke' : undefined}
            strokeLinecap="round"
          />
          {snow && (
            <path
              d={i === 0 ? firSnowCap(t) : firSnowBand(t, tiers[i - 1][1])}
              style={{ fill: 'var(--sc-snow)' }}
            />
          )}
        </g>
      ))}
    </>
  )
}

/**
 * Laubkrone aus „Klumpen“: jeder Kreis bekommt einen Schatten-Halbmond unten
 * rechts (Kreis dunkel + leicht nach oben links versetzt wieder in Grundfarbe).
 * Herbst: einzelne Klumpen rot/gelb. Glanzpunkte auf den oberen Klumpen.
 */
export function ClumpCrown({
  crown,
  clip,
  foliage,
  snow,
  fill,
}: {
  crown: readonly Circle[]
  clip: string
  foliage: Foliage
  snow: boolean
  /** Grundfarbe; ohne Angabe wird die Füllung vom <use> geerbt. */
  fill?: string
}) {
  const clumpFill = (i: number): string | undefined => {
    if (foliage === 'herbstlaub') {
      // Herbst: ein roter und ein gelber Klumpen im orangen Laub.
      if (i === 1 || i === 4) return 'currentColor'
      if (i === 6) return 'var(--sc-flower)'
    }
    return fill
  }
  const top = crown.reduce((m, c) => Math.min(m, c[1] - c[2]), 0)
  const hiFill = foliage === 'satt' ? 'currentColor' : '#ffffff'
  const hiOpacity = foliage === 'satt' ? 0.7 : 0.2
  return (
    <g clipPath={`url(#${clip})`}>
      {crown.map(([cx, cy, r], i) => {
        const f = clumpFill(i)
        const st = f ? { fill: f } : undefined
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} style={st} />
            <circle cx={cx} cy={cy} r={r} fill={INK} opacity={SHADE_OPACITY - 0.02} />
            <circle cx={cx - r * 0.1} cy={cy - r * 0.13} r={r * 0.95} style={st} />
          </g>
        )
      })}
      {/* Glanz auf den oberen Klumpen */}
      {crown
        .filter((c) => c[1] - c[2] < top + (foliage === 'satt' ? 26 : 12))
        .map(([cx, cy, r], i) => (
          <ellipse
            key={i}
            cx={cx - r * 0.32}
            cy={cy - r * 0.42}
            rx={r * 0.42}
            ry={r * 0.26}
            transform={`rotate(-24 ${cx - r * 0.32} ${cy - r * 0.42})`}
            style={{ fill: hiFill }}
            opacity={hiOpacity}
          />
        ))}
      {snow &&
        crown
          .filter((c) => c[1] - c[2] < top + 40)
          .map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy - r * 0.64} rx={r * 0.86} ry={r * 0.44} style={{ fill: 'var(--sc-snow)' }} />
          ))}
    </g>
  )
}

export function Blossoms({ at, r }: { at: readonly Pt[]; r: number }) {
  return (
    <>
      {at.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="currentColor" />
          <circle cx={x} cy={y} r={r * 0.36} fill="#fff6d6" />
        </g>
      ))}
    </>
  )
}

export function BareTree({
  branches,
  crown,
  snow,
  frost,
  birch,
  outline,
}: {
  branches: readonly { d: string; w: number }[]
  crown: readonly Circle[]
  snow: boolean
  frost: boolean
  birch?: boolean
  /** Konturfarbe für den Vordergrund. */
  outline?: string
}) {
  const bark = birch ? BIRCH_BARK : 'var(--sc-trunk)'
  return (
    <>
      {/* Feiner Zweig-Schleier statt Laub */}
      <g style={{ fill: 'var(--sc-trunk)' }} opacity={0.07}>
        <Circles c={crown} />
      </g>
      {outline && (
        <g fill="none" style={{ stroke: outline }} strokeLinecap="round" strokeLinejoin="round">
          {branches.map((b, i) => (
            <path key={i} d={b.d} strokeWidth={b.w + 1.1} />
          ))}
        </g>
      )}
      <g fill="none" style={{ stroke: bark }} strokeLinecap="round" strokeLinejoin="round">
        {branches.map((b, i) => (
          <path key={i} d={b.d} strokeWidth={b.w} />
        ))}
      </g>
      {(frost || snow) && (
        <g
          fill="none"
          style={{ stroke: 'var(--sc-snow)' }}
          strokeLinecap="round"
          opacity={snow ? 0.95 : 0.75}
          transform={`translate(0 ${snow ? -1.2 : -0.9})`}
        >
          {branches.slice(1).map((b, i) => (
            <path key={i} d={b.d} strokeWidth={Math.max(1, b.w * (snow ? 0.5 : 0.34))} />
          ))}
        </g>
      )}
    </>
  )
}
