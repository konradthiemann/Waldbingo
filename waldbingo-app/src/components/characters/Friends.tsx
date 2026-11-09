// Wingos Waldfreunde: Nebenfiguren mit festen Rollen in der App.
// Gleicher Stil wie Wingo (Figuren-Bibel): dicke Kontur im dunkleren Eigenton,
// flach + 1 Schatten + 1 Glanz, große Augen mit zwei Glanzpunkten, rosige Wangen.
// viewBox 0 0 120 120 (Füße unten); `framing="face"` liefert einen Kopf-Ausschnitt
// für Avatare. Alle IDs sind pro Instanz eindeutig (useId).
import { type CSSProperties, type ReactNode, useId } from 'react'
import './characters.css'

export type FriendId = 'olli' | 'flitz' | 'stupsi' | 'pilzi' | 'fine'
export type FriendMood = 'idle' | 'happy' | 'talk' | 'sleep'

export const FRIEND_MOODS: FriendMood[] = ['idle', 'happy', 'talk', 'sleep']

export interface FriendMeta {
  id: FriendId
  name: string
  /** Tierart (Anzeige), z. B. „Eule“. */
  species: string
  /** Rolle in der App (Doku/Studio). */
  role: string
  /** Leitfarbe (Avatar-Ring, Akzente). */
  color: string
}

export const FRIENDS: Record<FriendId, FriendMeta> = {
  olli: { id: 'olli', name: 'Olli', species: 'Eule', role: 'Erklärt Funde („Wusstest du?“)', color: '#a0784f' },
  flitz: { id: 'flitz', name: 'Flitz', species: 'Eichhörnchen', role: 'Schwierigkeit „Mittel“, Sammel-Fortschritt', color: '#d9772f' },
  stupsi: { id: 'stupsi', name: 'Stupsi', species: 'Igel', role: 'Tipps, Leerzustände, Nacht', color: '#8a6d5a' },
  pilzi: { id: 'pilzi', name: 'Pilzi', species: 'Pilzwichtel', role: 'Schwierigkeit „Leicht“', color: '#c98a4a' },
  fine: { id: 'fine', name: 'Fine', species: 'Füchsin', role: 'Schwierigkeit „Experte“', color: '#e8692f' },
}

export const FRIEND_ORDER: FriendId[] = ['olli', 'flitz', 'stupsi', 'pilzi', 'fine']

interface FriendProps {
  id: FriendId
  /** Breite = Höhe in px (viewBox 0 0 120 120). */
  size?: number
  mood?: FriendMood
  animated?: boolean
  className?: string
  /** Leerstring = dekorativ. Standard: Name. */
  title?: string
  /** Erweiterung: 'full' = ganze Figur (Standard), 'face' = Kopf-Ausschnitt (Avatare). */
  framing?: 'full' | 'face'
}

/** Kopf-Ausschnitte (viewBox) je Figur für `framing="face"`. */
const FACE_BOX: Record<FriendId, string> = {
  olli: '12 9 96 96',
  flitz: '6 -1 96 96',
  stupsi: '12 26 96 96',
  pilzi: '6 6 108 108',
  fine: '10 2 100 100',
}

const INK = '#1c2b27'
const CHEEK = '#ff9fb0'
const MOUTH = '#7a2f43'
const TONGUE = '#ff8fa3'

export function Friend({ id, size = 80, mood = 'idle', animated = true, className = '', title, framing = 'full' }: FriendProps) {
  const meta = FRIENDS[id]
  const label = title ?? meta.name
  const uid = 'fr' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const face = framing === 'face'
  const scale = size / (face ? 92 : 120)
  const small = scale < 0.5
  const lw = small ? 4 : scale < 0.8 ? 3.2 : 2.8
  const blink: CSSProperties = { animationDelay: `-${(hashStr(uid + id) % 40) / 10}s` }
  const k: Kit = { uid, mood, animated, lw, small, blink }
  const Art = ART[id]
  return (
    <svg
      viewBox={face ? FACE_BOX[id] : '0 0 120 120'}
      width={size}
      height={size}
      className={`wg-root ${animated ? '' : 'wg-still'} ${className}`}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label || undefined}
      style={{ overflow: face ? 'hidden' : 'visible' }}
    >
      {!face && <ellipse cx="60" cy="114" rx="34" ry="4.5" fill="#14331f" opacity="0.16" />}
      <g key={mood} className={animated ? 'wg-boing' : undefined}>
        <g className={animated ? (mood === 'sleep' ? 'wg-breathe-slow' : 'wg-breathe') : undefined}>
          <Art {...k} />
        </g>
        {mood === 'sleep' && <Zzz small={small} />}
      </g>
    </svg>
  )
}

function hashStr(s: string): number {
  let h = 11
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return h
}

// ── Gemeinsame Bausteine ───────────────────────────────────────────────────

interface Kit {
  uid: string
  mood: FriendMood
  animated: boolean
  lw: number
  small: boolean
  blink: CSSProperties
}

/** Silhouette zweimal: erst Kontur (doppelte Breite), dann Füllung → saubere Außenlinie. */
function Sil({ fill, line, lw, children }: { fill: string; line: string; lw: number; children: ReactNode }) {
  return (
    <>
      <g fill={line} stroke={line} strokeWidth={lw * 2} strokeLinejoin="round">
        {children}
      </g>
      <g fill={fill}>{children}</g>
    </>
  )
}

/** Augen im Wingo-Stil. `look` verschiebt die Pupillen (z. B. schüchtern zur Seite). */
function Eyes({
  k,
  at,
  r,
  line,
  look = [0, 1],
  lashes,
}: {
  k: Kit
  at: [number, number][]
  r: number
  line: string
  look?: [number, number]
  lashes?: boolean
}) {
  const fw = Math.max(2.4, k.lw * 0.95)
  if (k.mood === 'happy') {
    return (
      <g fill="none" stroke={INK} strokeWidth={fw + 0.6} strokeLinecap="round">
        {at.map(([x, y]) => (
          <path key={x} d={`M${x - r * 0.8} ${y + r * 0.35}Q${x} ${y - r * 0.85} ${x + r * 0.8} ${y + r * 0.35}`} />
        ))}
      </g>
    )
  }
  if (k.mood === 'sleep') {
    return (
      <g fill="none" stroke={INK} strokeWidth={fw + 0.2} strokeLinecap="round">
        {at.map(([x, y]) => (
          <path key={x} d={`M${x - r * 0.75} ${y}Q${x} ${y + r * 0.6} ${x + r * 0.75} ${y}`} />
        ))}
      </g>
    )
  }
  const pr = k.small ? r * 0.8 : r * 0.72
  return (
    <g>
      {at.map(([x, y], i) => {
        const px = x + look[0] + (i === 0 ? 0.6 : -0.6)
        const py = y + look[1]
        return (
          <g key={x} className={k.animated ? 'wg-blink' : undefined} style={k.blink}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill="#fff" stroke={line} strokeWidth={Math.max(1.8, k.lw * 0.65)} />
            <ellipse cx={px} cy={py} rx={pr} ry={pr * 1.12} fill={INK} />
            <circle cx={px - pr * 0.36} cy={py - pr * 0.42} r={pr * 0.4} fill="#fff" />
            <circle cx={px + pr * 0.38} cy={py + pr * 0.36} r={pr * 0.2} fill="#fff" />
            {lashes && !k.small && (
              <path
                d={i === 0 ? `M${x - r * 0.75} ${y - r * 0.7}L${x - r * 1.25} ${y - r * 1.05}` : `M${x + r * 0.75} ${y - r * 0.7}L${x + r * 1.25} ${y - r * 1.05}`}
                stroke={INK}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Mund: Lächeln (idle), offen (happy), sprechend (talk), klein (sleep). */
function Mouth({ k, x, y, w = 9, line, tooth }: { k: Kit; x: number; y: number; w?: number; line: string; tooth?: 'one' | 'two' }) {
  const fw = Math.max(2.2, k.lw * 0.85)
  const stroke = { fill: 'none', stroke: line, strokeWidth: fw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const clip = `${k.uid}-m`
  if (k.mood === 'happy' || k.mood === 'talk') {
    const d = `M${x - w} ${y - 1}Q${x} ${y + 2} ${x + w} ${y - 1}Q${x + w * 0.8} ${y + w * 1.05} ${x} ${y + w * 1.05}Q${x - w * 0.8} ${y + w * 1.05} ${x - w} ${y - 1}Z`
    return (
      <g className={k.mood === 'talk' && k.animated ? 'wg-talk' : undefined}>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
        <path d={d} fill={MOUTH} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={x} cy={y + w * 1.05} rx={w * 0.75} ry={w * 0.5} fill={TONGUE} />
          {tooth === 'two' && (
            <path d={`M${x - 3.2} ${y}h6.4v3.4q0 1-1 1h-4.4q-1 0-1-1Z M${x} ${y}v4.4`} fill="#fff" stroke={line} strokeWidth="0.8" />
          )}
        </g>
        <path d={d} {...stroke} />
      </g>
    )
  }
  if (k.mood === 'sleep') {
    return <path d={`M${x - w * 0.4} ${y + 1}Q${x} ${y + 3.5} ${x + w * 0.4} ${y + 1}`} {...stroke} />
  }
  return (
    <g>
      {tooth === 'two' && (
        <path d={`M${x - 3} ${y + 2.2}h6v3.6q0 1-1 1h-4q-1 0-1-1Z M${x} ${y + 2.2}v4.6`} fill="#fff" stroke={line} strokeWidth="1" strokeLinejoin="round" />
      )}
      <path d={`M${x - w * 0.75} ${y}Q${x} ${y + w * 0.7} ${x + w * 0.75} ${y}`} {...stroke} />
    </g>
  )
}

function Cheeks({ at, rx = 5.5, opacity = 0.7 }: { at: [number, number][]; rx?: number; opacity?: number }) {
  return (
    <g fill={CHEEK} opacity={opacity}>
      {at.map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx={rx} ry={rx * 0.62} />
      ))}
    </g>
  )
}

function Zzz({ small }: { small: boolean }) {
  const txt = {
    fontFamily: '"Fredoka Variable", Fredoka, system-ui, sans-serif',
    fontWeight: 700,
    stroke: '#fff',
    strokeWidth: small ? 5 : 3.2,
    paintOrder: 'stroke' as const,
    strokeLinejoin: 'round' as const,
    fill: '#5d6fc9',
  }
  return small ? (
    <text x="102" y="36" fontSize="32" {...txt}>
      z
    </text>
  ) : (
    <g {...txt}>
      <text className="wg-z" x="104" y="48" fontSize="15">
        z
      </text>
      <text className="wg-z" x="111" y="33" fontSize="19">
        z
      </text>
      <text className="wg-z" x="118" y="16" fontSize="23">
        Z
      </text>
    </g>
  )
}

/** Klein-Eichel (Flitz hält sie, Wingo im Herbst). */
function Acorn({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="5.6" ry="6.8" fill="#d79a52" stroke="#7a4f2e" strokeWidth="1.8" />
      <ellipse cx="-1.8" cy="2.4" rx="1.4" ry="2.4" fill="#f0c28a" />
      <path d="M-7-0.5Q-7.4-7.6 0-8Q7.4-7.6 7-0.5Q0 1.8-7-0.5Z" fill="#8a5a3b" stroke="#5c3a22" strokeWidth="1.8" />
      <path d="M-4-3.5L-2-1.5M0-5L2-3M3.5-3.5L5-2" stroke="#b3825a" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M0-8L1.6-11.5" stroke="#5c3a22" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

// ── Olli – Eule mit großer Brille ───────────────────────────────────────────

function Olli(k: Kit) {
  const c = { body: '#b8895b', shade: '#9a6c43', line: '#6b4528', belly: '#f3dfbd', pattern: '#d9b98c', disc: '#efd8b4', glasses: '#4a3426', beak: '#f2b13c', beakLine: '#b8761c' }
  const clip = `${k.uid}-b`
  // Feder-Öhrchen: zweizackiges Federbüschel, nach außen geneigt
  const ear = 'M34 46Q24 36 22.5 24A2.6 2.6 0 0 1 27 22.5Q30 28 33 30Q32 22 34 16A2.6 2.6 0 0 1 38.6 16.6Q40 28 50 36Z'
  const wing = (flip: boolean) => (
    <g transform={flip ? 'matrix(-1 0 0 1 120 0)' : undefined}>
      <Sil fill={c.shade} line={c.line} lw={k.lw}>
        <path d="M30 60Q14 70 17 92Q18 99 24 97Q24 102 30 100Q36 88 35 66Z" />
      </Sil>
      <path d="M22 84Q25 88 24 95M28 80Q31 86 30 97" stroke={c.line} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5" />
    </g>
  )
  return (
    <g>
      {/* Füßchen */}
      <Sil fill={c.beak} line={c.beakLine} lw={k.lw * 0.8}>
        {[44, 49, 54, 66, 71, 76].map((x) => (
          <circle key={x} cx={x} cy="109" r="3.6" />
        ))}
      </Sil>
      <Sil fill={c.body} line={c.line} lw={k.lw}>
        <ellipse cx="60" cy="68" rx="37" ry="40" />
        <path d={ear} />
        <path d={ear} transform="matrix(-1 0 0 1 120 0)" />
      </Sil>
      <clipPath id={clip}>
        <ellipse cx="60" cy="68" rx="37" ry="40" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path d="M0 0H120V120H0ZM20 62A36 40 0 1 0 92 62A36 40 0 1 0 20 62Z" fill={c.shade} fillRule="evenodd" />
        <ellipse cx="60" cy="88" rx="25" ry="22" fill={c.belly} />
        {[
          [51, 80],
          [69, 80],
          [60, 88],
          [49, 96],
          [71, 96],
          [60, 103],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 3.5} ${y}Q${x} ${y + 3.5} ${x + 3.5} ${y}`} stroke={c.pattern} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        ))}
        <ellipse cx="42" cy="38" rx="9" ry="4.5" transform="rotate(-30 42 38)" fill="#fff" opacity="0.22" />
      </g>
      {/* Gesichtsscheibe */}
      <circle cx="46" cy="55" r="17" fill={c.disc} />
      <circle cx="74" cy="55" r="17" fill={c.disc} />
      <Cheeks at={[[33, 70], [87, 70]]} rx={5} />
      <Eyes k={k} at={[[46, 55], [74, 55]]} r={8.6} line={c.line} />
      {/* Brille */}
      <g fill="none" stroke={c.glasses} strokeWidth={Math.max(2.6, k.lw)}>
        <circle cx="46" cy="55" r="13" fill="#fff" fillOpacity="0.16" />
        <circle cx="74" cy="55" r="13" fill="#fff" fillOpacity="0.16" />
        <path d="M58.5 53Q60 50.5 61.5 53" strokeLinecap="round" />
      </g>
      {!k.small && (
        <path d="M37 49Q40 45 44 44.5M65 49Q68 45 72 44.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
      )}
      {/* Schnabel – öffnet sich beim Sprechen/Freuen */}
      {k.mood === 'happy' || k.mood === 'talk' ? (
        <g strokeLinejoin="round">
          <path d="M55.5 66Q60 70 64.5 66Q62.5 75 60 76Q57.5 75 55.5 66Z" fill={MOUTH} className={k.mood === 'talk' && k.animated ? 'wg-talk' : undefined} />
          <path d="M54 64.5Q60 61.5 66 64.5Q63 70 60 70.5Q57 70 54 64.5Z" fill={c.beak} stroke={c.beakLine} strokeWidth="1.6" />
        </g>
      ) : (
        <path d="M54.5 64.5Q60 61.5 65.5 64.5Q62.5 72 60 73.5Q57.5 72 54.5 64.5Z" fill={c.beak} stroke={c.beakLine} strokeWidth="1.6" strokeLinejoin="round" />
      )}
      {wing(false)}
      {wing(true)}
    </g>
  )
}

// ── Flitz – Eichhörnchen mit Riesenpuschelschwanz und Eichel ────────────────

function Flitz(k: Kit) {
  const c = { fur: '#e07a32', shade: '#c4611f', line: '#8a3d15', cream: '#fde6c8', tail: '#ea8a42', tailShade: '#cd6a26', nose: '#5a2c18' }
  const tail: [number, number, number][] = [
    [80, 98, 13],
    [93, 88, 14.5],
    [100, 72, 15],
    [99, 55, 14],
    [93, 40, 12.5],
    [83, 30, 10.5],
    [73, 27, 7.5],
  ]
  const ear = 'M37 34Q27 22 30.5 9.5Q31.5 6.5 34.5 8Q44 15 47 28Z'
  return (
    <g>
      {/* Schwanz hinter dem Körper */}
      <Sil fill={c.tail} line={c.line} lw={k.lw}>
        {tail.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </Sil>
      <path d="M80 100Q100 92 101 70Q102 48 88 38Q80 33 76 38" stroke={c.tailShade} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.65" />
      <ellipse cx="96" cy="52" rx="5" ry="9" transform="rotate(20 96 52)" fill="#fff" opacity="0.2" />
      {/* Füße */}
      <Sil fill={c.shade} line={c.line} lw={k.lw}>
        <ellipse cx="43" cy="108" rx="9" ry="5" />
        <ellipse cx="64" cy="108" rx="9" ry="5" />
      </Sil>
      {/* Körper + Kopf + Ohren */}
      <Sil fill={c.fur} line={c.line} lw={k.lw}>
        <ellipse cx="54" cy="88" rx="22" ry="21" />
        <circle cx="53" cy="47" r="25" />
        <path d={ear} />
        <path d={ear} transform="matrix(-1 0 0 1 106 0)" />
        {/* Wangen-Puschel */}
        <path d="M29 50Q23 52 21.5 57Q26 57.5 30 58Z" />
        <path d="M77 50Q83 52 84.5 57Q80 57.5 76 58Z" />
      </Sil>
      {/* Ohr-Innenseite + Pinsel */}
      <path d="M37.5 29Q32 21 33.5 13.5Q40 18 42.5 26Z" fill="#f4a971" />
      <path d="M68.5 29Q74 21 72.5 13.5Q66 18 63.5 26Z" fill="#f4a971" />
      <path d="M32 9Q30 3 33 0.5M74 9Q76 3 73 0.5" stroke={c.line} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* Bauch, Schnauze, Schatten */}
      <ellipse cx="54" cy="92" rx="14" ry="14" fill={c.cream} />
      <path d="M71 70Q78 78 76 92Q74 102 66 107Q72 96 72 86Q72 78 71 70Z" fill={c.shade} opacity="0.6" />
      <path d="M72 34Q78 44 76 56Q73 64 66 68Q72 58 72 48Q72 40 72 34Z" fill={c.shade} opacity="0.55" />
      <ellipse cx="53" cy="59" rx="14" ry="10" fill={c.cream} />
      <ellipse cx="42" cy="32" rx="6" ry="3" transform="rotate(-30 42 32)" fill="#fff" opacity="0.25" />
      <Cheeks at={[[34, 55], [72, 55]]} rx={5} />
      <Eyes k={k} at={[[43, 45], [63, 45]]} r={7.6} line={c.line} />
      <path d="M49.5 53Q53 51 56.5 53Q55.5 56.5 53 57.2Q50.5 56.5 49.5 53Z" fill={c.nose} />
      <Mouth k={k} x={53} y={60} w={6} line={c.nose} tooth="two" />
      {/* Eichel in beiden Pfötchen */}
      <Acorn x={54} y={82} s={1.15} />
      <Sil fill={c.fur} line={c.line} lw={k.lw * 0.85}>
        <ellipse cx="45.5" cy="84" rx="5" ry="5.5" />
        <ellipse cx="62.5" cy="84" rx="5" ry="5.5" />
      </Sil>
    </g>
  )
}

// ── Stupsi – schüchterner Igel mit weicher Stachelfrisur ────────────────────

/** Weiche, gerundete Stacheln entlang eines Bogens (Kontrollpunkt = Spitze → runde Enden). */
function spikes(cx: number, cy: number, rIn: number, rOut: number, from: number, to: number, n: number): string {
  const pt = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180
    return `${(cx + Math.cos(rad) * r).toFixed(1)} ${(cy + Math.sin(rad) * r).toFixed(1)}`
  }
  const step = (to - from) / n
  let d = `M${pt(from, rIn)}`
  for (let i = 0; i < n; i++) {
    const a0 = from + i * step
    d += `C${pt(a0 + step * 0.2, rOut)} ${pt(a0 + step * 0.8, rOut)} ${pt(a0 + step, rIn)}`
  }
  return d + `L${cx} ${cy}Z`
}

const STUPSI_BACK = spikes(60, 74, 36, 50, 150, 390, 11)
const STUPSI_FRINGE = spikes(60, 36, 20, 27, 25, 155, 5)

function Stupsi(k: Kit) {
  const c = { spike: '#8a6d5a', spikeHi: '#a5846c', line: '#4e3a2e', face: '#f2dcbf', faceShade: '#e0c3a0', nose: '#3a2a22' }
  const clip = `${k.uid}-f`
  return (
    <g>
      <Sil fill={c.spike} line={c.line} lw={k.lw}>
        <path d={STUPSI_BACK} />
        <ellipse cx="60" cy="88" rx="38" ry="22" />
      </Sil>
      <path d="M36 44Q48 32 64 30M80 34Q92 42 98 56" stroke={c.spikeHi} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Füße */}
      <Sil fill={c.faceShade} line={c.line} lw={k.lw}>
        <ellipse cx="44" cy="109" rx="9" ry="5" />
        <ellipse cx="76" cy="109" rx="9" ry="5" />
      </Sil>
      {/* Gesicht */}
      <Sil fill={c.face} line={c.line} lw={k.lw * 0.8}>
        <ellipse cx="60" cy="80" rx="29" ry="26" />
      </Sil>
      <clipPath id={clip}>
        <ellipse cx="60" cy="80" rx="29" ry="26" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path d="M0 0H120V120H0ZM28 76A29 27 0 1 0 86 76A29 27 0 1 0 28 76Z" fill={c.faceShade} fillRule="evenodd" />
      </g>
      {/* Stachel-Pony */}
      <Sil fill={c.spike} line={c.line} lw={k.lw * 0.8}>
        <path d={STUPSI_FRINGE} />
      </Sil>
      <Cheeks at={[[39, 86], [81, 86]]} rx={6.5} opacity={0.85} />
      <Eyes k={k} at={[[48, 74], [72, 74]]} r={7} line={c.line} look={[2, 1.6]} />
      {/* Schnäuzchen mit Knubbelnase */}
      <ellipse cx="60" cy="88" rx="9" ry="6.5" fill={c.face} stroke={c.faceShade} strokeWidth="1.5" />
      <ellipse cx="60" cy="84.5" rx="5.6" ry="4.4" fill={c.nose} />
      <ellipse cx="58.3" cy="83.2" rx="1.8" ry="1.1" fill="#fff" opacity="0.7" />
      <Mouth k={k} x={60} y={92} w={5} line={c.nose} />
      {/* Pfötchen schüchtern vor dem Bauch */}
      <Sil fill={c.face} line={c.line} lw={k.lw * 0.8}>
        <circle cx="53" cy="103" r="5.5" />
        <circle cx="67" cy="103" r="5.5" />
      </Sil>
    </g>
  )
}

// ── Pilzi – Pilzwichtel mit Steinpilz-Hut ──────────────────────────────────

function Pilzi(k: Kit) {
  const c = { cap: '#8a4f2b', capShade: '#6e3c1f', capLine: '#4a2812', capHi: '#b36e3f', pores: '#f0d896', body: '#f6e9d2', bodyShade: '#e3cfab', bodyLine: '#97774f', boot: '#7a4f2e' }
  const capClip = `${k.uid}-c`
  const CAP = 'M13 52C10 28 33 12 60 12C87 12 110 28 107 52C99 58 84 60 60 60C36 60 21 58 13 52Z'
  return (
    <g>
      {/* Stiefelchen */}
      <Sil fill={c.boot} line={c.capLine} lw={k.lw}>
        <ellipse cx="47" cy="108" rx="9.5" ry="5.5" />
        <ellipse cx="73" cy="108" rx="9.5" ry="5.5" />
      </Sil>
      {/* Ärmchen */}
      <Sil fill={c.body} line={c.bodyLine} lw={k.lw}>
        <ellipse cx="33" cy="86" rx="6" ry="9" transform="rotate(25 33 86)" />
        <ellipse cx="87" cy="86" rx="6" ry="9" transform="rotate(-25 87 86)" />
      </Sil>
      {/* Stiel-Körper (bauchig wie ein Steinpilz-Stiel) */}
      <Sil fill={c.body} line={c.bodyLine} lw={k.lw}>
        <path d="M37 56C33 72 28 94 35 104C43 111 77 111 85 104C92 94 87 72 83 56Z" />
      </Sil>
      <path d="M78 64C83 78 86 94 82 102C78 106 72 107 68 107C76 98 79 82 78 64Z" fill={c.bodyShade} />
      {/* feines Netzmuster des Stiels */}
      {!k.small && (
        <path d="M44 98l4-3 4 3 4-3 4 3 4-3 4 3 4-3" stroke={c.bodyShade} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      )}
      <Cheeks at={[[42, 82], [78, 82]]} rx={5.5} />
      <Eyes k={k} at={[[50, 75], [70, 75]]} r={7.4} line={c.bodyLine} />
      <ellipse cx="60" cy="82.5" rx="2.6" ry="2" fill="#e0a77e" />
      <Mouth k={k} x={60} y={87} w={5.5} line="#6b4a2e" />
      {/* Hut: Unterseite (Röhren) + Kappe */}
      <Sil fill={c.pores} line={c.capLine} lw={k.lw * 0.8}>
        <path d="M18 51C30 61 90 61 102 51C99 61 86 66 60 66C34 66 21 61 18 51Z" />
      </Sil>
      <Sil fill={c.cap} line={c.capLine} lw={k.lw}>
        <path d={CAP} />
      </Sil>
      <clipPath id={capClip}>
        <path d={CAP} />
      </clipPath>
      <g clipPath={`url(#${capClip})`}>
        <path d="M0 0H120V120H0ZM8 46A48 36 0 1 0 104 46A48 36 0 1 0 8 46Z" fill={c.capShade} fillRule="evenodd" transform="translate(-2 -6)" />
        <path d="M14 50C24 56 44 58 60 58C76 58 96 56 106 50L108 62L12 62Z" fill={c.capHi} opacity="0.55" />
        <ellipse cx="40" cy="26" rx="13" ry="5.5" transform="rotate(-18 40 26)" fill="#fff" opacity="0.28" />
      </g>
      {/* Moos-Blättchen auf dem Hut */}
      <g transform="translate(74 15) rotate(30)">
        <path d="M0-9C6-5 6 4 0 9C-6 4-6-5 0-9Z" transform="scale(0.75)" fill="#8fd16a" stroke="#4f9a3a" strokeWidth="2.2" />
      </g>
    </g>
  )
}

// ── Fine – schlaue Füchsin mit Halstuch ────────────────────────────────────

function Fine(k: Kit) {
  const c = { fur: '#e8692f', shade: '#c9521f', line: '#8a3214', white: '#fff4e8', whiteShade: '#f1dccb', earIn: '#ffd2b8', dark: '#5a2a18', scarf: '#3f8fc4', scarfLine: '#245f8a', nose: '#3a1f16' }
  const tail: [number, number, number][] = [
    [34, 101, 11],
    [23, 90, 12.5],
    [18, 75, 12],
    [20, 60, 10.5],
  ]
  const HEAD = 'M30 44C30 27 44 19 60 19C76 19 90 27 90 44C90 51 96 57 100 61C91 63 85 69 77 73C70 77 50 77 43 73C35 69 29 63 20 61C24 57 30 51 30 44Z'
  const ear = 'M33 37L27.5 9Q28.5 4.5 33 6.5L52 23Z'
  const mask = 'M20 61C29 56 38 54 48 57Q60 62 72 57C82 54 91 56 100 61C91 63 85 69 77 73C70 77 50 77 43 73C35 69 29 63 20 61Z'
  return (
    <g>
      {/* buschiger Schwanz mit weißer Spitze */}
      <Sil fill={c.fur} line={c.line} lw={k.lw}>
        {tail.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
        <circle cx="25" cy="49" r="8" />
      </Sil>
      <circle cx="20" cy="60" r="10.5" fill={c.white} />
      <circle cx="25" cy="49" r="8" fill={c.white} />
      <path d="M26 100Q16 92 17 76" stroke={c.shade} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Pfoten (dunkle Söckchen) */}
      <Sil fill={c.dark} line={c.line} lw={k.lw}>
        <ellipse cx="50" cy="109" rx="8.5" ry="5" />
        <ellipse cx="70" cy="109" rx="8.5" ry="5" />
      </Sil>
      {/* Körper */}
      <Sil fill={c.fur} line={c.line} lw={k.lw}>
        <path d="M42 74C36 86 36 102 44 107C52 111 68 111 76 107C84 102 84 86 78 74Z" />
      </Sil>
      <path d="M50 84C48 92 49 102 54 106C58 108 62 108 66 106C71 102 72 92 70 84Z" fill={c.white} />
      {/* Kopf + Ohren */}
      <Sil fill={c.fur} line={c.line} lw={k.lw}>
        <path d={HEAD} />
        <path d={ear} />
        <path d={ear} transform="matrix(-1 0 0 1 120 0)" />
      </Sil>
      <path d="M34.5 32L31 13L45 25Z" fill={c.earIn} />
      <path d="M85.5 32L89 13L75 25Z" fill={c.earIn} />
      <path d="M27.8 10.5L28.5 5.6Q29.8 4.6 33 6.5L31 13Z" fill={c.dark} />
      <path d="M92.2 10.5L91.5 5.6Q90.2 4.6 87 6.5L89 13Z" fill={c.dark} />
      <path d="M78 26Q88 32 89 44Q89 50 93 55Q84 52 82 44Q80 34 78 26Z" fill={c.shade} opacity="0.55" />
      <path d={mask} fill={c.white} />
      <ellipse cx="44" cy="30" rx="7" ry="3.2" transform="rotate(-25 44 30)" fill="#fff" opacity="0.28" />
      <Cheeks at={[[35, 61], [85, 61]]} rx={5} opacity={0.75} />
      <Eyes k={k} at={[[47, 46], [73, 46]]} r={8} line={c.line} lashes />
      <path d="M56 59Q60 56.5 64 59Q63 62.5 60 63.3Q57 62.5 56 59Z" fill={c.nose} />
      <ellipse cx="58.6" cy="58.8" rx="1.4" ry="0.8" fill="#fff" opacity="0.6" />
      <Mouth k={k} x={60} y={66} w={5.5} line={c.nose} />
      {/* Halstuch mit Tupfen */}
      <g strokeLinejoin="round">
        <path d="M41 72Q60 82 79 72L77 79Q70 84 66 85L60 96L54 85Q50 84 43 79Z" fill={c.scarf} stroke={c.scarfLine} strokeWidth={Math.max(2, k.lw * 0.8)} />
        {!k.small && (
          <g fill="#fff">
            <circle cx="50" cy="79" r="1.5" />
            <circle cx="60" cy="82" r="1.5" />
            <circle cx="70" cy="79" r="1.5" />
            <circle cx="60" cy="90" r="1.4" />
          </g>
        )}
        <circle cx="72" cy="77.5" r="3.4" fill={c.scarf} stroke={c.scarfLine} strokeWidth="1.6" />
      </g>
    </g>
  )
}

const ART: Record<FriendId, (k: Kit) => JSX.Element> = {
  olli: Olli,
  flitz: Flitz,
  stupsi: Stupsi,
  pilzi: Pilzi,
  fine: Fine,
}

// ── Spieler-Avatare ────────────────────────────────────────────────────────

interface AvatarProps {
  /** 0-basierte Spielernummer (bis 9). */
  index: number
  size?: number
  active?: boolean
  className?: string
}

/** Ring-Farben, damit auch 10 Spieler (5 Freunde × 2) unterscheidbar sind. */
export const AVATAR_RINGS = ['#3f9d63', '#3f8fc4', '#e8913c', '#c2405a', '#7a5cc4']

/** Spieler-Avatar: Freund (zyklisch) im farbigen Ring. Dekorativ (aria-hidden). */
export function PlayerAvatar({ index, size = 44, active, className = '' }: AvatarProps) {
  const safe = Math.max(0, Math.floor(index))
  const id = FRIEND_ORDER[safe % FRIEND_ORDER.length]
  const round = Math.floor(safe / FRIEND_ORDER.length)
  const ring = AVATAR_RINGS[round % AVATAR_RINGS.length]
  const tint = FRIENDS[id].color
  const ringW = Math.max(2, Math.round(size / 18)) + (active ? 1 : 0)
  return (
    <span aria-hidden="true" className={`relative inline-block flex-none ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 grid place-items-center overflow-hidden rounded-full transition-transform duration-200 ease-spring"
        style={{
          background: `radial-gradient(circle at 50% 38%, #fffdf7 0%, #fff8ec 45%, ${tint}38 100%)`,
          boxShadow: `0 0 0 ${ringW}px ${ring}${active ? `, 0 0 0 ${ringW + 3}px ${ring}40` : ''}, 0 2px 4px rgba(15,38,23,.18)`,
          transform: active ? 'scale(1.06)' : undefined,
        }}
      >
        <Friend id={id} size={size} title="" framing="face" animated={false} />
      </span>
      {round > 0 && size >= 32 && (
        <span
          className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full border-2 border-white font-display font-bold leading-none text-white"
          style={{ background: ring, width: size * 0.38, height: size * 0.38, fontSize: Math.max(9, size * 0.22) }}
        >
          {round + 1}
        </span>
      )}
    </span>
  )
}

/** Name des Spieler-Avatars, z. B. „Olli“ (für Tabs/Labels). */
export function playerName(index: number): string {
  const safe = Math.max(0, Math.floor(index))
  const f = FRIENDS[FRIEND_ORDER[safe % FRIEND_ORDER.length]]
  const round = Math.floor(safe / FRIEND_ORDER.length)
  return round === 0 ? f.name : `${f.name} ${round + 1}`
}
