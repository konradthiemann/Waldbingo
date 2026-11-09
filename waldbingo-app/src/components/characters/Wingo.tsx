// Wingo – das Waldmonster und Herz von Waldbingo.
// Hochwertige Inline-SVG-Figur nach der Figuren-Bibel (Art Bible Abschnitt 6):
// runder, leicht birnenförmiger Fell-Körper mit Zotteln, Zweig-Hörnchen mit
// jahreszeitlichem Blättchen, Blätter-Flecken, große Augen mit zwei Glanzpunkten,
// rosige Wangen, ein Zähnchen. 8 Stimmungen, Kontext-Accessoires, Idle-Animationen.
//
// Aufbau: Silhouetten werden zweimal gezeichnet (erst dicke Kontur, dann Füllung),
// so entsteht eine saubere gemeinsame Außenlinie um Körper + Zotteln.
// Alle IDs (ClipPath, Mask, Gradient) sind pro Instanz eindeutig (useId).
import { type CSSProperties, type ReactNode, useId } from 'react'
import type { Jahreszeit, Wetter } from '../../data/types'
import './characters.css'

export type WingoMood =
  | 'idle' // atmet ruhig, blinzelt
  | 'happy' // lächelt, Augen ^^
  | 'cheer' // jubelt, Arme hoch, hüpft
  | 'wave' // winkt
  | 'think' // grübelt, Hand am Kinn
  | 'sleep' // schläft (Nacht), Zzz
  | 'surprised' // staunt, O-Mund
  | 'sad' // traurig (z. B. Fehlerseite)

export const WINGO_MOODS: WingoMood[] = ['idle', 'happy', 'cheer', 'wave', 'think', 'sleep', 'surprised', 'sad']

export interface WingoProps {
  mood?: WingoMood
  /** Breite in px (Höhe = Breite; viewBox ist quadratisch 0 0 200 200, Füße unten). */
  size?: number
  /** Jahreszeit → Accessoire (Blütenkranz, Schal, …). */
  season?: Jahreszeit
  /** Wetter → Accessoire (Regenhut, Schal bei Frost/Schnee, …). */
  weather?: Wetter | null
  /** Nacht/Dämmerung → Laterne. */
  night?: boolean
  /**
   * 'full' = ganze Figur. 'peek' = nur Oberkörper mit Händen auf einer Kante
   * (zum „Drüberschauen“ über das Spielbrett); untere Hälfte ist abgeschnitten.
   * 'face' (Erweiterung) = quadratischer Kopf-Ausschnitt für Avatare/Logos (40–64 px).
   */
  variant?: 'full' | 'peek' | 'face'
  /** Idle-Animationen (Atmen, Blinzeln). Standard: an. */
  animated?: boolean
  /** Erweiterung: Wingo spricht gerade (Mund bewegt sich). */
  talking?: boolean
  className?: string
  /** Screenreader-Text. Leerstring = dekorativ (aria-hidden). Standard: „Wingo“. */
  title?: string
}

// ── Farben (Figuren-Bibel) ─────────────────────────────────────────────────

const C = {
  fur: '#5bb88a',
  shade: '#3f9a70',
  line: '#2f6b55',
  belly: '#d8f3dc',
  /** Blatt-Flecken: eine Stufe dunkler als das Bibel-Moos #2f7d63, damit sie auch im Schattenton lesbar sind. */
  spot: '#276d56',
  /** Helle Mittelader der Blatt-Flecken (macht sie als Blätter erkennbar). */
  vein: '#a6e2c2',
  horn: '#8a5a3b',
  hornLine: '#5c3a22',
  hornHi: '#b3825a',
  cheek: '#ff9fb0',
  pupil: '#1c2b27',
  feature: '#234a3e',
  mouth: '#7a2f43',
  tongue: '#ff8fa3',
  tooth: '#ffffff',
}

// ── Kontext → Accessoires ──────────────────────────────────────────────────

export interface WingoGear {
  /** Gelber Südwester (Regen). */
  hat: boolean
  /** Roter Strickschal (Schnee/Frost). */
  scarf: boolean
  /** Schneehäubchen auf den Hörnchen. */
  snowCaps: boolean
  /** Gänseblümchen-Kranz (Frühling). */
  wreath: boolean
  /** Was am Hörnchen sprießt. */
  sprout: 'bloom' | 'leaf' | 'redLeaf' | 'none'
  /** Eichel in der Hand (Herbst, tagsüber). */
  acorn: boolean
  /** Laterne mit warmem Glühen (Nacht/Dämmerung). */
  lantern: boolean
  /** Fell-Zotteln wehen (Wind). */
  windy: boolean
}

/** Leitet die Accessoires aus dem Kontext ab (auch fürs Studio nutzbar). */
export function wingoGear(season?: Jahreszeit, weather?: Wetter | null, night?: boolean): WingoGear {
  const hat = weather === 'regen'
  const scarf = weather === 'schnee' || weather === 'frost'
  return {
    hat,
    scarf,
    snowCaps: scarf || season === 'winter',
    wreath: season === 'fruehling' && !hat,
    sprout:
      season === 'fruehling' ? 'bloom' : season === 'herbst' ? 'redLeaf' : season === 'winter' ? 'none' : 'leaf',
    acorn: season === 'herbst' && !night,
    lantern: !!night,
    windy: weather === 'wind',
  }
}

// ── Geometrie ──────────────────────────────────────────────────────────────

/** Körper: Kopf und Rumpf verschmolzen, leicht birnenförmig (≈ 1 : 1,1). */
const BODY =
  'M100 46C134 46 157 64 160 94C162 110 162 120 166 134C172 158 158 179 100 179C42 179 28 158 34 134C38 120 38 110 40 94C43 64 66 46 100 46Z'
// Zotteln: runde, gewellte Büschel aus Halbkreis-Bögen (keine Zacken) –
// so liest sich die Kontur sofort als „flauschig“.
/** Wangen-Zotteln links (rechts gespiegelt): zwei runde Büschel. */
const CHEEK_TUFT = 'M42 98.5Q36 98.5 33 102.5A5 5 0 0 0 33.5 112A6 6 0 0 0 35.5 123.5Q38.5 125 41.5 124Z'
/** Scheitel-Zotteln: drei runde Büschel, das mittlere am höchsten. */
const SCALP_TUFT =
  'M80 54Q77.5 44 83 39.5A6 6 0 0 1 94 34A7.6 7.6 0 0 1 109 33A6.2 6.2 0 0 1 118 41Q121 47.5 120 54Z'
/** Wind: Zotteln wehen nach rechts – lange Strähnen mit runden, dicken Enden. */
const SCALP_TUFT_WIND =
  'M80 54Q81 42 93 35.5A4.1 4.1 0 0 1 98 42Q93.5 45 96 48.5Q101 35 115 29.5A4 4 0 0 1 119.5 36Q110.5 40.5 110.5 47.5Q117 41 128.5 38A3.6 3.6 0 0 1 131.5 44.5Q124.5 47 122 56Z'
const CHEEK_TUFT_WIND_R =
  'M158 98.5Q166.5 94.5 173.5 96.5A3.8 3.8 0 0 1 174 104Q167.5 105 161.5 107.5Q168.5 107.5 174 110.5A3.6 3.6 0 0 1 172.5 117.5Q166.5 119.5 159 121.5Z'
const CHEEK_TUFT_WIND_L = 'M42 100.5Q37 101.5 35 105A3.3 3.3 0 0 0 37.5 111Q39 111.5 40.5 112Z'
/** Bauchfleck mit flauschiger Oberkante. */
const BELLY =
  'M63 154Q61 138 73 131Q78 125 87 127Q93 121 100 125Q107 121 113 127Q122 125 127 131Q139 138 137 154C137 169 122 178 100 178C78 178 63 169 63 154Z'
/** Schattenseite: alles außerhalb einer nach links oben versetzten Ellipse. */
const SHADE = 'M0 0H200V200H0ZM30 108A62 70 0 1 0 154 108A62 70 0 1 0 30 108Z'
/** Blatt (Flecken, Hörnchen-Blatt). */
const LEAF = 'M0-9C6-5 6 4 0 9C-6 4-6-5 0-9Z'

/** Blätter-Flecken (Markenzeichen): [x, y, Drehung, Größe]. Große Darstellung. */
const SPOTS: [number, number, number, number][] = [
  [60, 70, -38, 1.12],
  [139, 70, 34, 0.95],
  [46, 150, -14, 1.42],
  [154, 149, 22, 1.2],
  [128, 59, 50, 0.7],
]
/**
 * Wenige große Flecken für kleine Darstellungen, Kopf-Ausschnitt und peek:
 * alle im oberen Körper (bleiben beim Drüberschauen sichtbar, nicht unter den Händchen).
 */
const SPOTS_BIG: [number, number, number, number][] = [
  [61, 69, -38, 1.5],
  [140, 69, 34, 1.32],
  [150, 98, 18, 1.1],
]
/** Mittlere Größe (ganze Figur): zusätzlich ein großer Fleck unten an der Flanke. */
const SPOTS_MID: [number, number, number, number][] = [...SPOTS_BIG, [47, 149, -14, 1.55]]

/** Puschel (Schwanz): Kreis mit runden Büscheln. */
function puff(cx: number, cy: number, r: number, n: number, bump: number): string {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const x = (cx + Math.cos(a) * r).toFixed(1)
    const y = (cy + Math.sin(a) * r).toFixed(1)
    d += i === 0 ? `M${x} ${y}` : `A${bump} ${bump} 0 0 1 ${x} ${y}`
  }
  return d + 'Z'
}
const TAIL = puff(165, 165, 12, 7, 6.5)

// Arme: lokales System, Schulter = (0 0), Arm zeigt nach unten (+y).
const SHOULDER_L: [number, number] = [50, 124]
const SHOULDER_R: [number, number] = [150, 124]
type ArmPose = 'rest' | 'out' | 'wide' | 'hang' | 'up' | 'wave' | 'chin' | 'edge'
const POSE_ANGLE: Record<Exclude<ArmPose, 'edge'>, number> = {
  rest: 16,
  out: 30,
  wide: 46,
  hang: 6,
  up: 146,
  wave: 140,
  chin: -126,
}

const ARMS: Record<WingoMood, [ArmPose, ArmPose]> = {
  idle: ['rest', 'rest'],
  happy: ['out', 'out'],
  cheer: ['up', 'up'],
  wave: ['rest', 'wave'],
  think: ['rest', 'chin'],
  sleep: ['rest', 'rest'],
  surprised: ['wide', 'wide'],
  sad: ['hang', 'hang'],
}

/** Punkt im Arm (lokal 0|dy) → Weltkoordinaten (linker Arm). */
function armPoint(pose: ArmPose, dy: number): [number, number] {
  const a = ((pose === 'edge' ? POSE_ANGLE.rest : POSE_ANGLE[pose]) * Math.PI) / 180
  return [SHOULDER_L[0] - Math.sin(a) * dy, SHOULDER_L[1] + Math.cos(a) * dy]
}

/** Kleiner, stabiler Hash (für versetzte Blinzel-Phasen je Instanz). */
function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973
  return h
}

// ── Komponente ─────────────────────────────────────────────────────────────

export function Wingo({
  mood = 'idle',
  size = 160,
  season,
  weather,
  night,
  variant = 'full',
  animated = true,
  talking = false,
  className = '',
  title = 'Wingo',
}: WingoProps) {
  const uid = 'wg' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const deco = title === ''
  const gear = wingoGear(season, weather, night)
  const peek = variant === 'peek'
  const face = variant === 'face'

  // Detailstufe: kleine Darstellungen bekommen kräftigere Konturen und weniger Kleinkram.
  const scale = size / (face ? 132 : peek ? 176 : 200)
  const small = scale < 0.42
  const lw = small ? 5.2 : scale < 0.7 ? 4.2 : 3.6
  // Blatt-Flecken: klein (< ~80 px) höchstens 3 große, mittel 4 große, groß 5 normale.
  // Kopf-Ausschnitt und peek zeigen nur den Oberkörper → immer die großen oben.
  const spots = small || face || peek ? SPOTS_BIG : scale < 0.62 ? SPOTS_MID : SPOTS

  const [armL, armR] = ARMS[mood]
  const poseL: ArmPose = peek && (armL === 'rest' || armL === 'out' || armL === 'wide' || armL === 'hang') ? 'edge' : armL
  const poseR: ArmPose = peek && (armR === 'rest' || armR === 'out' || armR === 'wide' || armR === 'hang') ? 'edge' : armR

  const blinkDelay: CSSProperties = { animationDelay: `-${(hash(uid) % 40) / 10}s` }
  const ids = {
    clip: `${uid}-clip`,
    mask: `${uid}-mask`,
    glow: `${uid}-glow`,
    mouth: `${uid}-mouth`,
    peek: `${uid}-peek`,
  }

  const viewBox = peek ? '0 0 200 120' : face ? '34 12 132 132' : '0 0 200 200'
  const height = peek ? size * 0.6 : size
  const sleeping = mood === 'sleep'

  // Rumpf-Gruppe (atmet). Im peek-Modus skaliert und nach oben versetzt.
  const figure = (
    <g className={animated ? (sleeping ? 'wg-breathe-slow' : 'wg-breathe') : undefined}>
      {/* Hörnchen (hinter dem Kopf) */}
      <Horns lw={lw} />
      {gear.snowCaps && <SnowCaps branch={gear.sprout === 'none'} />}
      {gear.sprout !== 'none' && <Sprout kind={gear.sprout} windy={gear.windy && animated} lw={lw} />}

      {/* Körper-Silhouette: Kontur, dann Füllung */}
      <BodyShape stroke={C.line} strokeWidth={lw * 2} windy={gear.windy} />
      <BodyShape fill={C.fur} windy={gear.windy} />

      {/* Schatten, Glanz, Blätter-Flecken, Bauch – auf den Körper beschnitten */}
      <clipPath id={ids.clip}>
        <path d={BODY} />
        <WindAwareTufts windy={gear.windy} />
      </clipPath>
      <g clipPath={`url(#${ids.clip})`}>
        <path d={SHADE} fill={C.shade} fillRule="evenodd" />
        <path d={BELLY} fill={C.belly} />
        {spots.map(([x, y, r, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
            <path d={LEAF} fill={C.spot} />
            {!small && <path d="M0-5.6V5.8" stroke={C.vein} strokeWidth={1.7 / s} strokeLinecap="round" opacity="0.85" />}
          </g>
        ))}
        <ellipse cx="73" cy="68" rx="14" ry="6.5" transform="rotate(-32 73 68)" fill="#fff" opacity="0.2" />
        {/* feine Fell-Strähnen (nur ab mittlerer Größe) */}
        {!small && (
          <path
            d="M50 82Q46.5 87 47.5 93M153 86Q156 91 154.5 97M44 138Q41 143 43 148.5M157 124Q160.5 130 158.5 136M60 167Q64 171.5 70 172M150 160Q148 166 143 169"
            fill="none"
            stroke={C.shade}
            strokeWidth="2.3"
            strokeLinecap="round"
            opacity="0.85"
          />
        )}
        <ellipse cx="100" cy="138" rx="20" ry="5" fill="#fff" opacity="0.35" />
      </g>

      {gear.scarf && <ScarfBand lw={lw} />}

      <Face mood={mood} talking={talking && !sleeping} lw={lw} small={small} animated={animated} blink={blinkDelay} mouthId={ids.mouth} />

      {gear.wreath && <Wreath />}
      {gear.hat && <RainHat lw={lw} />}
      {gear.scarf && <ScarfTail lw={lw} />}

      {/* Arme vorne */}
      {poseL !== 'edge' && (
        <Arm side="L" pose={poseL} lw={lw} small={small} maskId={ids.mask} animated={animated}>
          {gear.acorn && <Acorn x={0} y={35} rotate={-12} scale={1.45} />}
        </Arm>
      )}
      {poseR !== 'edge' && <Arm side="R" pose={poseR} lw={lw} small={small} maskId={ids.mask} animated={animated} />}
      {!peek && gear.lantern && !sleeping && (
        <Lantern at={armPoint(poseL, 40)} glowId={ids.glow} lw={lw} animated={animated} />
      )}
    </g>
  )

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={height}
      className={`wg-root ${animated ? '' : 'wg-still'} ${className}`}
      role={deco ? undefined : 'img'}
      aria-hidden={deco ? true : undefined}
      aria-label={deco ? undefined : title}
      // Ganze Figur/peek dürfen überstehen (Zzz, Funkeln, Finger über der Kante); der Kopf-Ausschnitt nicht.
      overflow={face ? 'hidden' : 'visible'}
      style={{ overflow: face ? 'hidden' : 'visible' }}
    >
      <defs>
        {/* Schulter-Maske: blendet die Arm-Kontur am Ansatz aus (Arm wächst aus dem Fell). */}
        <mask id={ids.mask} maskUnits="userSpaceOnUse" x="-60" y="-60" width="120" height="120">
          <rect x="-60" y="-60" width="120" height="120" fill="#fff" />
          <ellipse cx="0" cy="-3" rx="12" ry="12.5" fill="#000" />
        </mask>
        <radialGradient id={ids.glow}>
          <stop offset="0" stopColor="#ffe7a3" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffd27a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffc35c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {peek ? (
        <>
          {gear.lantern && <Lantern at={[180, 92]} glowId={ids.glow} lw={lw} animated={animated} standing />}
          {gear.acorn && poseL === 'edge' && <Acorn x={22} y={113} rotate={-70} scale={1.15} />}
          <clipPath id={ids.peek}>
            <rect x="-60" y="-80" width="320" height="200" />
          </clipPath>
          <g clipPath={`url(#${ids.peek})`}>
            <g transform="translate(100 0) scale(0.88) translate(-100 -14)">
              <g key={mood} className={animated ? moodEntryClass(mood) : undefined}>
                {figure}
                <Effects mood={mood} small={small} windy={gear.windy} />
              </g>
            </g>
          </g>
          {poseL === 'edge' && <EdgePaw x={55} lw={lw} small={small} />}
          {poseR === 'edge' && <EdgePaw x={145} lw={lw} small={small} flip />}
        </>
      ) : (
        <>
          {!face && (
            <g opacity="0.18">
              <ellipse
                cx="100"
                cy="192"
                rx="56"
                ry="6"
                fill="#14331f"
                className={animated && mood === 'cheer' ? 'wg-hop-shadow' : undefined}
              />
            </g>
          )}
          {!face && gear.lantern && sleeping && (
            <Lantern at={[24, 165]} glowId={ids.glow} lw={lw} animated={animated} standing dim />
          )}
          <g key={mood} className={animated ? moodEntryClass(mood) : undefined}>
            <g className={animated && mood === 'cheer' ? 'wg-hop' : undefined}>
              {/* Schwanz und Füße hinter dem Körper */}
              {!face && (
                <>
                  <path d={TAIL} fill={C.line} stroke={C.line} strokeWidth={lw * 2} strokeLinejoin="round" />
                  <path d={TAIL} fill={C.shade} />
                  <circle cx="162" cy="161" r="5" fill={C.fur} opacity="0.7" />
                  <Feet lw={lw} small={small} />
                </>
              )}
              {figure}
            </g>
            <Effects mood={mood} small={small} windy={gear.windy} />
          </g>
        </>
      )}
    </svg>
  )
}

function moodEntryClass(mood: WingoMood): string {
  return mood === 'surprised' ? 'wg-startle' : 'wg-boing'
}

// ── Bauteile ───────────────────────────────────────────────────────────────

function BodyShape({
  fill,
  stroke,
  strokeWidth,
  windy,
}: {
  fill?: string
  stroke?: string
  strokeWidth?: number
  windy: boolean
}) {
  const p = {
    fill: fill ?? stroke,
    stroke,
    strokeWidth,
    strokeLinejoin: 'round' as const,
  }
  return (
    <g {...p}>
      <path d={BODY} />
      {windy ? (
        <>
          <g className="wg-sway">
            <path d={SCALP_TUFT_WIND} />
          </g>
          <path d={CHEEK_TUFT_WIND_L} />
          <g className="wg-flutter">
            <path d={CHEEK_TUFT_WIND_R} />
          </g>
        </>
      ) : (
        <>
          <path d={SCALP_TUFT} />
          <path d={CHEEK_TUFT} />
          <path d={CHEEK_TUFT} transform="matrix(-1 0 0 1 200 0)" />
        </>
      )}
    </g>
  )
}

/** Zotteln als Clip-Bestandteile (ohne Animation, Clip braucht nur Formen). */
function WindAwareTufts({ windy }: { windy: boolean }) {
  return windy ? (
    <>
      <path d={SCALP_TUFT_WIND} />
      <path d={CHEEK_TUFT_WIND_L} />
      <path d={CHEEK_TUFT_WIND_R} />
    </>
  ) : (
    <>
      <path d={SCALP_TUFT} />
      <path d={CHEEK_TUFT} />
      <path d={CHEEK_TUFT} transform="matrix(-1 0 0 1 200 0)" />
    </>
  )
}

/** Zweig-Geweih-Hörnchen in Rinde, abgerundet. */
function Horns({ lw }: { lw: number }) {
  const twig = 'M76 60C73 48 67.5 38 63.5 27.5M68.5 42.5C63 39.5 57.5 38.5 53.5 34.5'
  const right = 'M124 60C127 48 132.5 38 136.5 27.5M131.5 42.5C137 39.5 142.5 38.5 146.5 34.5'
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={twig + right} stroke={C.hornLine} strokeWidth={7.8 + lw * 1.5} />
      <path d={twig + right} stroke={C.horn} strokeWidth="7.8" />
      <path d="M66.4 35L64.6 30M133.6 35L135.4 30M59 37.6L56.4 36.4M141 37.6L143.6 36.4" stroke={C.hornHi} strokeWidth="2.2" />
    </g>
  )
}

/** Schneehäubchen auf den Hörnchen-Spitzen. */
function SnowCaps({ branch }: { branch: boolean }) {
  const cap = 'M-6.2 2.2Q-7.4-5.6 0-6.4Q7.4-5.6 6.2 2.2Q4.4 0.4 2.4 2.6Q0.6 0.8-1.4 2.8Q-3.6 0.6-6.2 2.2Z'
  const tips: [number, number, number][] = [
    [63.5, 26, 0.95],
    [136.5, 26, 0.95],
    [53.5, 33.5, 0.7],
    // rechte Astspitze trägt sonst das Blättchen
    ...(branch ? [[146.5, 33.5, 0.7] as [number, number, number]] : []),
  ]
  return (
    <g>
      {tips.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d={cap} fill="#ffffff" stroke="#a9bfd3" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="-2" cy="-3.2" rx="2" ry="1.2" fill="#e6f1fb" />
        </g>
      ))}
    </g>
  )
}

/** Jahreszeitliches Blättchen bzw. Blüte am rechten Hörnchen. */
function Sprout({ kind, windy, lw }: { kind: 'bloom' | 'leaf' | 'redLeaf'; windy: boolean; lw: number }) {
  const sw = Math.min(2.4, lw * 0.6)
  if (kind === 'bloom') {
    return (
      <g transform="translate(147.5 33)">
        <g className={windy ? 'wg-flutter' : undefined}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-4.6"
              rx="3.6"
              ry="4.6"
              transform={`rotate(${a})`}
              fill="#ffc2d6"
              stroke="#d9708f"
              strokeWidth={sw}
            />
          ))}
          <circle r="2.8" fill="#ffd75e" stroke="#d9a21f" strokeWidth="1.2" />
        </g>
      </g>
    )
  }
  const red = kind === 'redLeaf'
  return (
    <g transform={`translate(147 35) rotate(${red ? 78 : 50})`}>
      <g className={windy ? 'wg-flutter' : undefined}>
        <g transform="translate(0 -9.5) scale(1.05)">
          <path d={LEAF} fill={red ? '#e2553a' : '#8fd16a'} stroke={red ? '#a3352a' : '#4f9a3a'} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M0-6V7" stroke={red ? '#b8402e' : '#5fae48'} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </g>
  )
}

function Feet({ lw, small }: { lw: number; small: boolean }) {
  return (
    <g>
      {[76, 124].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="182" rx="19" ry="10" fill={C.shade} stroke={C.line} strokeWidth={lw} />
          {!small && (
            <path
              d={`M${x - 6} 185.5V190M${x + 6} 185.5V190`}
              stroke={C.line}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </g>
  )
}

// ── Gesicht ────────────────────────────────────────────────────────────────

function Face({
  mood,
  talking,
  lw,
  small,
  animated,
  blink,
  mouthId,
}: {
  mood: WingoMood
  talking: boolean
  lw: number
  small: boolean
  animated: boolean
  blink: CSSProperties
  mouthId: string
}) {
  const featureW = Math.max(3.2, lw * 0.95)
  return (
    <g>
      {/* Wangen */}
      <ellipse cx="62" cy="113" rx="10.5" ry="6.5" fill={C.cheek} opacity={mood === 'happy' || mood === 'cheer' ? 0.9 : 0.78} />
      <ellipse cx="138" cy="113" rx="10.5" ry="6.5" fill={C.cheek} opacity={mood === 'happy' || mood === 'cheer' ? 0.9 : 0.78} />

      <Eyes mood={mood} lw={lw} small={small} animated={animated} blink={blink} featureW={featureW} />
      <Brows mood={mood} featureW={featureW} />

      {/* Knubbelnase */}
      <path d="M93.5 106.5Q100 103 106.5 106.5Q106.5 111.5 100 113.5Q93.5 111.5 93.5 106.5Z" fill={C.feature} />
      <ellipse cx="97.6" cy="106.6" rx="2.2" ry="1.2" fill="#fff" opacity="0.55" />

      <Mouth mood={mood} talking={talking} featureW={featureW} clipId={mouthId} animated={animated} />
    </g>
  )
}

function Eyes({
  mood,
  lw,
  small,
  animated,
  blink,
  featureW,
}: {
  mood: WingoMood
  lw: number
  small: boolean
  animated: boolean
  blink: CSSProperties
  featureW: number
}) {
  // Geschlossene / lachende Augen als Bögen.
  if (mood === 'happy' || mood === 'cheer') {
    return (
      <g fill="none" stroke={C.feature} strokeWidth={featureW + 1} strokeLinecap="round">
        <path d="M69 99Q80 84 91 99" />
        <path d="M109 99Q120 84 131 99" />
      </g>
    )
  }
  if (mood === 'sleep') {
    return (
      <g fill="none" stroke={C.feature} strokeWidth={featureW + 0.6} strokeLinecap="round">
        <path d="M70 96Q80 104 90 96" />
        <path d="M110 96Q120 104 130 96" />
      </g>
    )
  }
  const surprised = mood === 'surprised'
  const look: [number, number] = mood === 'think' ? [3, -4.5] : mood === 'sad' ? [0, 3.5] : [0, 1.5]
  const sclera: [number, number] = surprised ? [14, 16.5] : [13, 15]
  const pupil: [number, number] = surprised ? [7, 8] : small ? [10, 11.5] : [9.2, 11]
  return (
    <g>
      {[80, 120].map((cx) => {
        const inward = cx < 100 ? 1.2 : -1.2
        const px = cx + look[0] + (mood === 'think' ? 0 : inward)
        const py = 95 + look[1]
        return (
          <g key={cx} className={animated ? 'wg-blink' : undefined} style={blink}>
            <ellipse cx={cx} cy="95" rx={sclera[0]} ry={sclera[1]} fill="#fff" stroke={C.line} strokeWidth={Math.max(2.4, lw * 0.7)} />
            <ellipse cx={px} cy={py} rx={pupil[0]} ry={pupil[1]} fill={C.pupil} />
            {!small && <path d={`M${px - 6} ${py + 5}Q${px} ${py + 10} ${px + 6} ${py + 5}`} stroke="#3c5b52" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />}
            <circle cx={px - 3.4} cy={py - 4.2} r={surprised ? 2.8 : 3.7} fill="#fff" />
            <circle cx={px + 3.6} cy={py + 3.4} r={surprised ? 1.4 : 1.8} fill="#fff" />
            {/* trauriges Oberlid */}
            {mood === 'sad' && (
              <path
                d={cx < 100 ? `M${cx - 15} 86L${cx + 15} 80.5L${cx + 15} 76L${cx - 15} 76Z` : `M${cx + 15} 86L${cx - 15} 80.5L${cx - 15} 76L${cx + 15} 76Z`}
                fill={C.fur}
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

function Brows({ mood, featureW }: { mood: WingoMood; featureW: number }) {
  const p = { fill: 'none', stroke: C.feature, strokeWidth: featureW, strokeLinecap: 'round' as const }
  switch (mood) {
    case 'think':
      return (
        <g {...p}>
          <path d="M70 76Q78 74 87 76" />
          <path d="M112 72Q121 66 130 70" />
        </g>
      )
    case 'surprised':
      return (
        <g {...p}>
          <path d="M69 70Q78 64 88 69" />
          <path d="M112 69Q122 64 131 70" />
        </g>
      )
    case 'sad':
      return (
        <g {...p}>
          <path d="M70 80Q79 79 88 73" />
          <path d="M112 73Q121 79 130 80" />
        </g>
      )
    default:
      return null
  }
}

function Mouth({
  mood,
  talking,
  featureW,
  clipId,
  animated,
}: {
  mood: WingoMood
  talking: boolean
  featureW: number
  clipId: string
  animated: boolean
}) {
  const line = { fill: 'none', stroke: C.feature, strokeWidth: featureW, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  // Offener Mund mit Zunge und Zähnchen.
  const open = (d: string, tongueY: number, toothX: number, toothY: number, cls?: string) => (
    <g className={cls}>
      <clipPath id={clipId}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={C.mouth} />
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx="100" cy={tongueY} rx="11" ry="6.5" fill={C.tongue} />
        <path d={`M${toothX - 2.6} ${toothY - 2}L${toothX + 2.8} ${toothY - 2}L${toothX + 1.2} ${toothY + 4}Q${toothX} ${toothY + 5.2} ${toothX - 1.2} ${toothY + 4}Z`} fill={C.tooth} />
      </g>
      <path d={d} {...line} />
    </g>
  )

  if (talking) {
    return open('M88 116Q100 120 112 116Q110 129 100 129Q90 129 88 116Z', 129.5, 105, 118.5, animated ? 'wg-talk' : undefined)
  }

  switch (mood) {
    case 'happy':
    case 'wave':
      return open('M87 115.5Q100 120.5 113 115.5Q111.5 130 100 130Q88.5 130 87 115.5Z', 130.5, 105.5, 118.5)
    case 'cheer':
      return open('M84 114Q100 120 116 114Q115.5 133 100 133Q84.5 133 84 114Z', 133, 106, 117.6)
    case 'surprised':
      return open('M100 113C106 113 108.5 117.5 108.5 122C108.5 127 105 130 100 130C95 130 91.5 127 91.5 122C91.5 117.5 94 113 100 113Z', 130, 104, 114.6)
    case 'think':
      return <path d="M86 121Q91 118 96 121Q101 124 106 120.5" {...line} />
    case 'sleep':
      return (
        <g>
          <path d="M95 120.5Q100 124.5 105 120.5" {...line} />
          <ellipse cx="100" cy="126.5" rx="2.6" ry="2" fill={C.mouth} opacity="0.85" />
        </g>
      )
    case 'sad':
      return (
        <g>
          <path d="M90 124Q100 116.5 110 124" {...line} />
        </g>
      )
    default:
      // idle: kleines breites Lächeln mit einem Zähnchen
      return (
        <g>
          <path d="M102.3 121.1L107.4 119.6L105.9 125Q104.9 126.4 103.8 125.1Z" fill={C.tooth} stroke={C.feature} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M88.5 116.5Q100 126.5 111.5 116.5" {...line} />
        </g>
      )
  }
}

// ── Arme & Hände ───────────────────────────────────────────────────────────

/** Arm-Silhouette im lokalen System (Schulter oben bei 0|0). */
function ArmShape(props: { fill?: string; stroke?: string; strokeWidth?: number }) {
  return (
    <g fill={props.fill ?? props.stroke} stroke={props.stroke} strokeWidth={props.strokeWidth} strokeLinejoin="round">
      <rect x="-10" y="-9" width="20" height="38" rx="10" />
      <ellipse cx="0" cy="30" rx="12" ry="10" />
      <circle cx="-7.6" cy="36.4" r="5" />
      <circle cx="0" cy="39" r="5.4" />
      <circle cx="7.6" cy="36.4" r="5" />
      {/* Ellbogen-Büschel: zwei runde Bögen statt Zacke */}
      <path d="M-9 9.5Q-13.5 9.5-15.5 12.5A3.4 3.4 0 0 0-16 19A3.6 3.6 0 0 0-12 23.5Q-10.5 23.5-9 22.5Z" />
    </g>
  )
}

function Arm({
  side,
  pose,
  lw,
  small,
  maskId,
  animated,
  children,
}: {
  side: 'L' | 'R'
  pose: Exclude<ArmPose, 'edge'>
  lw: number
  small: boolean
  maskId: string
  animated: boolean
  children?: ReactNode
}) {
  const [sx, sy] = side === 'L' ? SHOULDER_L : SHOULDER_R
  // Im Jubel sitzen die Schultern etwas höher; beim Grübeln stützt der Ellbogen tiefer.
  const x = pose === 'chin' ? (side === 'R' ? 140 : 60) : sx
  const y = pose === 'up' || pose === 'wave' ? sy - 4 : pose === 'chin' ? 150 : sy
  const t = `translate(${x} ${y})${side === 'R' ? ' scale(-1 1)' : ''} rotate(${POSE_ANGLE[pose]})`
  return (
    <g transform={t}>
      <g className={animated && pose === 'wave' ? 'wg-wave' : undefined}>
        <g mask={`url(#${maskId})`}>
          <ArmShape stroke={C.line} strokeWidth={lw * 2} />
        </g>
        <ArmShape fill={C.fur} />
        {/* Schattenseite des Arms */}
        <path d="M4.5 4C8 12 8.5 20 7 26C10 27.5 11.5 30 11 33C8 31 5 30 3 30C5 22 5.5 12 4.5 4Z" fill={C.shade} opacity="0.55" />
        {!small && (
          <path d="M-3.8 35.3L-3.4 40.6M3.8 35.3L3.4 40.6" stroke={C.line} strokeWidth="1.8" strokeLinecap="round" />
        )}
        {children}
      </g>
    </g>
  )
}

/**
 * Händchen auf der Kante (peek): Handrücken liegt oben auf, die drei runden
 * Fingerchen hängen ein Stück über die Kante (y = 120) – sie dürfen über den
 * SVG-Rand hinaus auf das Brett darunter ragen (overflow: visible).
 */
function EdgePaw({ x, lw, small, flip }: { x: number; lw: number; small: boolean; flip?: boolean }) {
  const shape = (p: { fill?: string; stroke?: string; strokeWidth?: number }) => (
    <g fill={p.fill ?? p.stroke} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round">
      <path d="M-13-9C-13-16-7-18.5 0-18.5C7-18.5 13-16 13-9L13 0L-13 0Z" />
      <ellipse cx="0" cy="-1.5" rx="13.2" ry="7" />
      <circle cx="-7.8" cy="3.6" r="4.8" />
      <circle cx="0" cy="5.2" r="5.2" />
      <circle cx="7.8" cy="3.6" r="4.8" />
    </g>
  )
  return (
    <g transform={`translate(${x} 119)${flip ? ' scale(-1 1)' : ''}`}>
      {shape({ stroke: C.line, strokeWidth: lw * 2 })}
      {shape({ fill: C.fur })}
      <path d="M5-17C9-14 11-9 11-5C8.5-6.5 6-6.5 4-6.5C5.5-10 5.5-14 5-17Z" fill={C.shade} opacity="0.5" />
      {!small && <path d="M-3.9 2.2L-3.6 6.6M3.9 2.2L3.6 6.6" stroke={C.line} strokeWidth="1.7" strokeLinecap="round" />}
    </g>
  )
}

// ── Accessoires ────────────────────────────────────────────────────────────

/**
 * Gelber Südwester-Regenhut: niedrige runde Kappe, breite Krempe, die zu den
 * Seiten weich nach unten hängt (Regen läuft ab). Die Hörnchen schauen seitlich heraus.
 */
function RainHat({ lw }: { lw: number }) {
  const line = '#a8741a'
  const crown = 'M71 55C70 37 83 27 100 27C117 27 130 37 129 55Z'
  const brim =
    'M100 49C122 49 141 52 152 60C159 65 160 73 156 79C153 81 150 80 148 77C141 67 124 62.5 100 62.5C76 62.5 59 67 52 77C50 80 47 81 44 79C40 73 41 65 48 60C59 52 78 49 100 49Z'
  return (
    <g strokeLinejoin="round">
      <path d={crown} fill="#f7c948" stroke={line} strokeWidth={lw} />
      <path d="M114 30C123 35 128 43 128.5 54L119 54C119 44 117.5 36 114 30Z" fill="#e0a92a" opacity="0.65" />
      <path d="M85 34C81 37.5 78.5 42 78 47" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M72 52C84 48.5 116 48.5 128 52" stroke="#d9a21f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={brim} fill="#ffd75e" stroke={line} strokeWidth={lw} />
      {/* Steppnaht auf der Krempe */}
      <path
        d="M49 72C46 68 48 63 54 60C66 54 82 53 100 53C118 53 134 54 146 60C152 63 154 68 151 72"
        fill="none"
        stroke="#d9a21f"
        strokeWidth="1.8"
        strokeDasharray="3.2 3.2"
        strokeLinecap="round"
      />
      <path d="M60 58C72 54 84 52.5 96 52.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* Regentropfen an der Krempe */}
      <path d="M155.5 83Q158.5 88 158.5 90A3 3 0 0 1 152.5 90Q152.5 88 155.5 83Z" fill="#8cc7e8" stroke="#3f8fc4" strokeWidth="1.4" />
    </g>
  )
}

/** Gänseblümchen-Kranz über den Scheitel. */
function Wreath() {
  const flowers: [number, number, number][] = [
    [68, 64, 1.3],
    [83, 53, 1.42],
    [100, 49, 1.55],
    [117, 53, 1.42],
    [132, 64, 1.3],
  ]
  const leaves: [number, number, number][] = [
    [75, 57, -58],
    [91.5, 49.5, -82],
    [108.5, 49.5, 82],
    [125, 57, 58],
  ]
  return (
    <g>
      <path d="M62 70Q100 38 138 70" fill="none" stroke="#4f9a3a" strokeWidth="3.4" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(0.78)`}>
          <path d={LEAF} fill="#8fd16a" stroke="#4f9a3a" strokeWidth="2.4" />
        </g>
      ))}
      {flowers.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <ellipse key={a} cx="0" cy="-4.4" rx="2.3" ry="3.9" transform={`rotate(${a})`} fill="#fff" stroke="#cbbfa5" strokeWidth="0.9" />
          ))}
          <circle r="2.7" fill="#ffd75e" stroke="#d9a21f" strokeWidth="1" />
        </g>
      ))}
    </g>
  )
}

/** Roter Strickschal – Band um den Hals. */
function ScarfBand({ lw }: { lw: number }) {
  const band = 'M33 131Q100 147 167 131L167.5 141Q160 147 152 148.5Q100 160 48 148.5Q40 147 32.5 141Z'
  return (
    <g strokeLinejoin="round">
      <path d={band} fill="#d94b4b" stroke="#8f2a2a" strokeWidth={lw} />
      <path d="M40 136Q100 152 160 136" fill="none" stroke="#ec7a6c" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 5" />
      <path d="M110 151Q140 148 160 140" fill="none" stroke="#b83a3a" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </g>
  )
}

/** Herabhängendes Schal-Ende mit Fransen. */
function ScarfTail({ lw }: { lw: number }) {
  return (
    <g strokeLinejoin="round">
      <path d="M64 142L80 144L76 171L60 168Z" fill="#d94b4b" stroke="#8f2a2a" strokeWidth={lw} />
      <path d="M66 150L77.5 151.5M65 158L76.5 159.5" stroke="#ec7a6c" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M61 169L60 175M66 170L65.5 176M71 170.6L71 176.6M75.5 171.2L76 177" stroke="#d94b4b" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 140Q72 136 84 142Q80 149 70 148Q62 147 60 140Z" fill="#c43f3f" stroke="#8f2a2a" strokeWidth={lw * 0.8} />
    </g>
  )
}

/** Eichel (Herbst) – lokal zentriert. */
function Acorn({ x, y, rotate = 0, scale = 1 }: { x: number; y: number; rotate?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <ellipse cx="0" cy="3" rx="5.6" ry="6.8" fill="#d79a52" stroke="#7a4f2e" strokeWidth="1.8" />
      <ellipse cx="-1.8" cy="2.4" rx="1.4" ry="2.4" fill="#f0c28a" />
      <path d="M-7-0.5Q-7.4-7.6 0-8Q7.4-7.6 7-0.5Q0 1.8-7-0.5Z" fill="#8a5a3b" stroke="#5c3a22" strokeWidth="1.8" />
      <path d="M-4-3.5L-2-1.5M0-5L2-3M3.5-3.5L5-2" stroke="#b3825a" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M0-8L1.6-11.5" stroke="#5c3a22" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

/** Kleine Laterne mit warmem Glühen. `at` = Aufhängepunkt (Weltkoordinaten). */
function Lantern({
  at,
  glowId,
  lw,
  animated,
  standing,
  dim,
}: {
  at: [number, number]
  glowId: string
  lw: number
  animated: boolean
  standing?: boolean
  dim?: boolean
}) {
  const frame = '#6e4426'
  const sw = Math.max(1.8, lw * 0.55)
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)}) scale(1.15)`}>
      <g className={animated && !standing ? 'wg-swing' : undefined}>
        <circle cx="0" cy="18" r={dim ? 22 : 30} fill={`url(#${glowId})`} className={animated ? 'wg-glow' : undefined} />
        <path d="M-6 5Q-6-2 0-2Q6-2 6 5" fill="none" stroke={frame} strokeWidth={sw} strokeLinecap="round" />
        <rect x="-8.5" y="4" width="17" height="5.5" rx="2.5" fill="#8a5a33" stroke={frame} strokeWidth={sw} />
        <rect x="-7" y="9.5" width="14" height="16" rx="4" fill={dim ? '#ffe7a3' : '#fff2c2'} stroke={frame} strokeWidth={sw} />
        <ellipse cx="0" cy="18.5" rx="3.4" ry="5" fill="#ffb347" className={animated ? 'wg-glow' : undefined} />
        <ellipse cx="0" cy="19.5" rx="1.6" ry="2.6" fill="#fff6d6" />
        <path d="M-3.5 10V25M3.5 10V25" stroke={frame} strokeWidth="1.2" opacity="0.55" />
        <rect x="-9" y="25" width="18" height="5" rx="2.5" fill="#8a5a33" stroke={frame} strokeWidth={sw} />
      </g>
    </g>
  )
}

// ── Effekte ────────────────────────────────────────────────────────────────

function Effects({ mood, small, windy }: { mood: WingoMood; small: boolean; windy?: boolean }) {
  const gust =
    windy && !small ? (
      <g fill="none" stroke="#8cc7e8" strokeWidth="3.2" strokeLinecap="round">
        <path className="wg-gust" d="M6 80Q24 73 36 78Q44 82 39 88Q35 91 32 87" />
        <path className="wg-gust" d="M2 104Q18 99 30 102" />
        <path className="wg-gust" d="M170 30Q184 26 196 31" />
      </g>
    ) : null
  const fx = effectFor(mood, small)
  return gust ? (
    <>
      {gust}
      {fx}
    </>
  ) : (
    fx
  )
}

function effectFor(mood: WingoMood, small: boolean) {
  const txt = {
    fontFamily: '"Fredoka Variable", Fredoka, system-ui, sans-serif',
    fontWeight: 700,
    stroke: '#ffffff',
    strokeWidth: small ? 6 : 4,
    paintOrder: 'stroke' as const,
    strokeLinejoin: 'round' as const,
  }
  if (mood === 'sleep') {
    return (
      <g fill="#5d6fc9" {...txt}>
        {small ? (
          <text x="150" y="66" fontSize="40">
            z
          </text>
        ) : (
          <>
            <text className="wg-z" x="152" y="72" fontSize="21">
              z
            </text>
            <text className="wg-z" x="164" y="52" fontSize="26">
              z
            </text>
            <text className="wg-z" x="176" y="28" fontSize="32">
              Z
            </text>
          </>
        )}
      </g>
    )
  }
  if (mood === 'think') {
    return (
      <g className="wg-bob">
        <text x="158" y="70" fontSize={small ? 50 : 38} fill="#3f8fc4" {...txt}>
          ?
        </text>
      </g>
    )
  }
  if (mood === 'cheer' && !small) {
    const star = 'M0-11Q1.6-1.6 11 0Q1.6 1.6 0 11Q-1.6 1.6-11 0Q-1.6-1.6 0-11Z'
    const pos: [number, number, number][] = [
      [22, 54, 1],
      [178, 46, 1.15],
      [12, 100, 0.75],
      [188, 94, 0.85],
    ]
    return (
      <g>
        {pos.map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path className="wg-twinkle" d={star} fill="#ffd75e" stroke="#e0a526" strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        ))}
      </g>
    )
  }
  if (mood === 'surprised' && !small) {
    return (
      <g stroke="#e8913c" strokeWidth="3.6" strokeLinecap="round">
        <path d="M36 62L27 54M31 74L19 72M40 50L36 40" />
        <path d="M164 62L173 54M169 74L181 72M160 50L164 40" />
      </g>
    )
  }
  return null
}
