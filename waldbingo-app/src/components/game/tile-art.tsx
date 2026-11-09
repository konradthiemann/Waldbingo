// Eigene Kachelbilder im Wingo-Stil (Override-Tabelle „tile-art“): Objekt-ID →
// Inline-SVG (viewBox 0 0 64 64). Ersetzt OpenMoji-Symbole, die mehrdeutig sind
// (dasselbe Holzstück für Baumstumpf/Rinde/Morsches Holz, dieselbe Nuss für
// Eichel/Kastanie/Nuss, derselbe Baum für Tannenzapfen/-zweig …) oder nicht
// passen (Moos = grüner Kreis, Ameisenhaufen = Berg). Konturen im dunkleren
// Eigenton, nie Schwarz; flach + ein Schattenton + ein Glanzlicht.
// src/data und public/emoji bleiben unberührt.
import type { ReactNode } from 'react'

const R = { strokeLinejoin: 'round', strokeLinecap: 'round' } as const

/** Baumstumpf: Jahresringe oben, Rinde, Wurzelansätze, ein Trieb. */
function Baumstumpf() {
  return (
    <g {...R}>
      <ellipse cx="32" cy="56" rx="26" ry="4" fill="rgba(110,68,38,.18)" />
      <path
        d="M14 23v23c0 3-3 6-7 8 5 1.6 9 .8 12-1 4 2.2 8 3 13 3s9-.8 13-3c3 1.8 7 2.6 12 1-4-2-7-5-7-8V23Z"
        fill="#a06d44"
      />
      <path d="M41 26v21c0 3 2 5 4 6 3 .4 6 0 8-1-3-2-5-4-5-7V25Z" fill="#7a4f2e" />
      <path d="M20 31v12M27 34v15M35 31v10" stroke="#7a4f2e" strokeWidth="2.2" fill="none" />
      <path
        d="M14 23v23c0 3-3 6-7 8 5 1.6 9 .8 12-1 4 2.2 8 3 13 3s9-.8 13-3c3 1.8 7 2.6 12 1-4-2-7-5-7-8V23"
        fill="none"
        stroke="#5c3a22"
        strokeWidth="2.8"
      />
      <ellipse cx="32" cy="23" rx="18" ry="7.5" fill="#e2bb8c" stroke="#5c3a22" strokeWidth="2.8" />
      <ellipse cx="32" cy="23" rx="12" ry="4.8" fill="none" stroke="#b98352" strokeWidth="1.8" />
      <ellipse cx="32" cy="23" rx="6" ry="2.4" fill="none" stroke="#b98352" strokeWidth="1.8" />
      <circle cx="32" cy="23" r="1.2" fill="#b98352" />
      <path d="M33 23.5l9 3.2" stroke="#b98352" strokeWidth="1.6" />
      <path d="M19 19.5c2-1.6 5-2.6 8-3" stroke="#fff4dc" strokeWidth="1.8" fill="none" opacity=".8" />
      {/* kleiner Trieb */}
      <path d="M46 17c0-4 1-7 3-9" stroke="#3f7d3a" strokeWidth="2" fill="none" />
      <path d="M49 8c4-2 8-1 9 1-3 3-7 3-9-1Z" fill="#5fb87c" stroke="#2f7d4f" strokeWidth="1.8" />
    </g>
  )
}

/** Baumrinde: Rindenstück mit tiefen Furchen und etwas Moos. */
function Baumrinde() {
  const outline =
    'M20 7c7-2 17-2 24 1 3 11 2 25 3 38 0 6-3 11-7 12-8 1.4-14 1.4-19-1-4-7-3-19-4-31-1-8 0-15 3-19Z'
  return (
    <g {...R}>
      <path d={outline} fill="#8a5a3b" />
      <path d="M40 9c2.5 1 4 1.4 4 1 2 12 1 24 2 36 0 5-2 9-5 10 2-14 0-31-1-47Z" fill="#6e4426" />
      <path
        d="M25 11c-1 9 2 17 0 27-1 7 1 13 0 17M32 9c1 10-1 18 1 28 1 8-1 14 0 19M39 10c-1 11 2 21 0 33-1 6 1 10 0 13"
        stroke="#4f2f17"
        strokeWidth="2.6"
        fill="none"
      />
      <path d="M22 14c-1 8 0 15-1 23M29 13c0 6-1 11 0 16" stroke="#b3825a" strokeWidth="1.8" fill="none" />
      <path d={outline} fill="none" stroke="#4f2f17" strokeWidth="2.8" />
      {/* Moos-Polster unten */}
      <path
        d="M19 52c0-4 3-6 6-5 1-3 5-3 7-1 2-2 6-1 6 2 1 2 0 4-2 5-5 2-12 2-17-1Z"
        fill="#5fb87c"
        stroke="#2f7d4f"
        strokeWidth="2"
      />
    </g>
  )
}

/** Morsches Holz: liegender, bemooster Ast mit Schnittfläche und Pilzchen. */
function Totholz() {
  return (
    <g {...R}>
      <ellipse cx="33" cy="52" rx="27" ry="4" fill="rgba(110,68,38,.18)" />
      <path d="M12 26h36c6 0 9 6 9 11s-3 11-9 11H12Z" fill="#9a6a45" />
      <path d="M12 41h37c4 0 7-2 8-5 0 6-3 12-9 12H12Z" fill="#7a4f2e" />
      <path d="M22 33h9M36 40h9M27 44h6" stroke="#5c3a22" strokeWidth="2" fill="none" />
      <ellipse cx="40" cy="34" rx="2.4" ry="1.6" fill="#4f2f17" />
      <ellipse cx="25" cy="39" rx="1.8" ry="1.2" fill="#4f2f17" />
      <path d="M12 26h36c6 0 9 6 9 11s-3 11-9 11H12" fill="none" stroke="#4f2f17" strokeWidth="2.8" />
      <ellipse cx="12" cy="37" rx="6.5" ry="11" fill="#d9b48f" stroke="#4f2f17" strokeWidth="2.8" />
      <ellipse cx="12" cy="37" rx="3.6" ry="6.6" fill="none" stroke="#a87449" strokeWidth="1.6" />
      <ellipse cx="12" cy="37" rx="1.4" ry="2.6" fill="#a87449" />
      {/* Moos obenauf */}
      <path
        d="M17 27c1-5 6-6 9-3 2-4 8-4 10 0 2-3 7-3 9 1 1 1 0 3-1 3H18c-1 0-2 0-1-1Z"
        fill="#5fb87c"
        stroke="#2f7d4f"
        strokeWidth="2"
      />
      <path d="M22 25c1-1 3-2 4-1" stroke="#a6e0b4" strokeWidth="1.4" fill="none" />
      {/* zwei Pilzchen */}
      <path d="M47 27v-6M53 28v-4" stroke="#a8916f" strokeWidth="4" fill="none" />
      <path d="M47 27v-6M53 28v-4" stroke="#fbf4e4" strokeWidth="2" fill="none" />
      <path d="M41.5 21c0-4 3-6.5 5.5-6.5s5.5 2.5 5.5 6.5Z" fill="#c9824a" stroke="#6e4426" strokeWidth="2" />
      <path d="M49.5 24c0-3 1.6-4.6 3.5-4.6s3.5 1.6 3.5 4.6Z" fill="#c9824a" stroke="#6e4426" strokeWidth="1.8" />
    </g>
  )
}

/** Kastanie: glänzende Frucht in der aufgeplatzten, stacheligen Schale. */
function Kastanie() {
  const spikes = [
    [9, 40, 3, 41],
    [10, 33, 4, 30],
    [14, 27, 10, 21],
    [21, 49, 17, 55],
    [30, 53, 29, 60],
    [40, 52, 43, 58],
    [49, 47, 55, 51],
    [54, 40, 61, 40],
    [53, 32, 59, 28],
    [49, 26, 53, 20],
  ]
  return (
    <g {...R}>
      {spikes.map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#4f7d2f" strokeWidth="2.4" />
      ))}
      <path d="M8 38c0-9 9-14 24-14s24 5 24 14-10 16-24 16S8 47 8 38Z" fill="#9ccc65" stroke="#4f7d2f" strokeWidth="2.8" />
      <path d="M15 37c3-5 10-7 17-7s14 2 17 7c-3 5-10 8-17 8s-14-3-17-8Z" fill="#f4efd2" stroke="#8fb05a" strokeWidth="1.6" />
      <path d="M20 33c0-11 7-19 13-21 6 2 12 10 12 20 0 9-5 14-12 14-7 0-13-5-13-13Z" fill="#8a3f1e" />
      <path d="M21 36c2 6 7 9 12 9s10-3 11.6-9c-4 2.4-8 3.2-11.6 3.2S25 38.4 21 36Z" fill="#e3c79a" />
      <path d="M20 33c0-11 7-19 13-21 6 2 12 10 12 20 0 9-5 14-12 14-7 0-13-5-13-13Z" fill="none" stroke="#4f1f0c" strokeWidth="2.6" />
      <path d="M26 21c1.6-2.6 3.4-4.2 5-5" stroke="#d98a63" strokeWidth="2.4" fill="none" />
      <path d="M33 12v-2" stroke="#4f1f0c" strokeWidth="2.4" />
    </g>
  )
}

/** Eichel: glatte Frucht mit geschupptem Hütchen und Stiel. */
function Eichel() {
  return (
    <g {...R}>
      <path d="M20 30c0 14 6 24 12 27 6-3 12-13 12-27Z" fill="#d4a35c" />
      <path d="M36 30h8c0 13-6 23-12 27 4-7 5-16 4-27Z" fill="#b98352" />
      <path d="M24 34c0 6 1.6 11 4 15" stroke="#f1d9a8" strokeWidth="2.4" fill="none" />
      <path d="M20 30c0 14 6 24 12 27 6-3 12-13 12-27" fill="none" stroke="#7a4f2e" strokeWidth="2.8" />
      <path d="M15 30c0-10 7-16 17-16s17 6 17 16c-6 3-28 3-34 0Z" fill="#8a5a33" stroke="#4f2f17" strokeWidth="2.8" />
      <path
        d="M20 25l3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3M24 20l3 3 3-3 3 3 3-3 3 3"
        stroke="#5c3a22"
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M32 14c0-4 2-7 5-8" stroke="#4f2f17" strokeWidth="3" fill="none" />
      <path d="M38 8c5-4 12-3 14 0-4 4-10 4-14 0Z" fill="#7cc46a" stroke="#2f7d4f" strokeWidth="1.8" />
    </g>
  )
}

/** Angeknabberte Nuss: Haselnuss mit Nageloch (Eichhörnchen/Maus). */
function Nussschale() {
  return (
    <g {...R}>
      <ellipse cx="32" cy="57" rx="22" ry="3.4" fill="rgba(110,68,38,.18)" />
      <path d="M14 38c0-12 8-20 18-20s18 8 18 20-8 18-18 18-18-6-18-18Z" fill="#b8763e" />
      <path d="M40 22c6 4 10 10 10 16 0 10-6 17-15 18 6-5 9-13 8-22-1-5-2-9-3-12Z" fill="#94592b" />
      <path d="M20 36c1-6 4-11 9-13" stroke="#e0a56c" strokeWidth="2.2" fill="none" />
      <path d="M14 38c0-12 8-20 18-20s18 8 18 20-8 18-18 18-18-6-18-18Z" fill="none" stroke="#5c3a22" strokeWidth="2.8" />
      <ellipse cx="32" cy="21" rx="10" ry="4" fill="#d9b48f" stroke="#5c3a22" strokeWidth="2.4" />
      <path d="M26 21h12M29 19.5l-1 3M34 19.5l1 3" stroke="#b98352" strokeWidth="1.4" />
      {/* Nageloch mit hellem Rand */}
      <path
        d="M29 35c3-4 10-3 12 2 2 5-2 10-7 9.6-5-.4-8-6.6-5-11.6Z"
        fill="#4f2f17"
        stroke="#f1d9a8"
        strokeWidth="2.2"
        strokeDasharray="2 1.4"
      />
      <path d="M12 56l3-3 2 3ZM50 55l3-2 1 3Z" fill="#b8763e" stroke="#5c3a22" strokeWidth="1.4" />
    </g>
  )
}

/** Tannenzapfen: länglicher Zapfen mit Schuppenreihen. */
function Tannenzapfen() {
  const outline = 'M32 6c8 2 14 14 14 28s-6 24-14 24-14-10-14-24 6-26 14-28Z'
  return (
    <g {...R} transform="rotate(-16 32 32)">
      <path d="M31 6V2" stroke="#5c3a22" strokeWidth="3" />
      <path d={outline} fill="#a06d44" />
      <path d="M38 9c5 5 8 14 8 25s-4 20-9 23c3-7 4-15 4-24 0-10-1-18-3-24Z" fill="#7a4f2e" />
      <g stroke="#5c3a22" strokeWidth="2" fill="none">
        <path d="M24 14q4 5 8 0 4 5 8 0" />
        <path d="M20.5 21q3.8 5 7.6 0 3.9 5 7.8 0 3.8 5 7.6 0" />
        <path d="M18.6 29q4.4 5 8.8 0 4.6 5 9.2 0 4.4 5 8.8 0" />
        <path d="M18.4 37q4.4 5 8.8 0 4.6 5 9.2 0 4.4 5 8.8 0" />
        <path d="M19.6 45q4 5 8 0 4.4 5 8.8 0 4 5 8 0" />
        <path d="M23.6 52q4.2 4.4 8.4 0 4.2 4.4 8.4 0" />
      </g>
      <g stroke="#e2bb8c" strokeWidth="1.5" fill="none" opacity=".9">
        <path d="M26 17.5q2 1.4 4 0M22.6 25q2 1.4 4 0M21 33q2 1.4 4 0M21.2 41q2 1.4 4 0" />
      </g>
      <path d={outline} fill="none" stroke="#5c3a22" strokeWidth="2.8" />
    </g>
  )
}

/** Tannenzweig: Ast mit dichten, weichen Nadeln (und einem Seitenzweig). */
function Tannenzweig() {
  // Nadeln entlang des Asts von unten links nach oben rechts.
  const needles: ReactNode[] = []
  const main = { x0: 10, y0: 56, x1: 54, y1: 10 }
  const n = 11
  for (let i = 0; i < n; i++) {
    const t = 0.08 + (i / (n - 1)) * 0.86
    const x = main.x0 + (main.x1 - main.x0) * t
    const y = main.y0 + (main.y1 - main.y0) * t + Math.sin(t * Math.PI) * 3
    const len = 10 - t * 4
    for (const side of [-1, 1]) {
      // schräg nach vorn (zur Spitze) geneigt
      const ang = Math.atan2(main.y1 - main.y0, main.x1 - main.x0) + side * 1.0
      const ex = x + Math.cos(ang) * len
      const ey = y + Math.sin(ang) * len
      needles.push(
        <path key={`${i}${side}`} d={`M${x.toFixed(1)} ${y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`} />,
      )
    }
  }
  return (
    <g {...R}>
      <path d="M10 56c12-12 26-28 44-46M26 40c-2-6-2-11 0-16" stroke="#6e4426" strokeWidth="3.6" fill="none" />
      <path d="M10 56c12-12 26-28 44-46" stroke="#a06d44" strokeWidth="1.6" fill="none" />
      <g stroke="#1f5b38" strokeWidth="4.4" fill="none">
        {needles}
        <path d="M26 30l-6-4M26 30l6-4M26 26l-5-5M26 26l5-5M26 35l-6-3" />
      </g>
      <g stroke="#3f9d63" strokeWidth="2.2" fill="none">
        {needles}
        <path d="M26 30l-6-4M26 30l6-4M26 26l-5-5M26 26l5-5M26 35l-6-3" />
      </g>
      <path d="M52 11l3-3" stroke="#8ed3a0" strokeWidth="3" />
    </g>
  )
}

/** Fliegenpilz: roter Hut mit weißen Tupfen, weißer Stiel mit Manschette. */
function Fliegenpilz() {
  const dots: Array<[number, number, number]> = [
    [20, 24, 3.2],
    [32, 17.5, 3.6],
    [44, 24, 3],
    [26, 31, 2.4],
    [39, 31, 2.2],
    [13.5, 30.5, 1.8],
    [50.5, 30.5, 1.8],
  ]
  return (
    <g {...R}>
      <ellipse cx="32" cy="57" rx="18" ry="3" fill="rgba(110,68,38,.18)" />
      <path d="M26 34c-1 9-2 15-4 21 6 3 14 3 20 0-2-6-3-12-4-21Z" fill="#fbf4e4" stroke="#a8916f" strokeWidth="2.6" />
      <path d="M35 36c1 7 2 13 4 19 1-.2 2-.6 3-1-2-6-3-12-4-18Z" fill="#e8dcc3" />
      <path d="M24 43c4 4 12 4 16 0-2-2.6-14-2.6-16 0Z" fill="#fff" stroke="#a8916f" strokeWidth="2" />
      <path d="M8 34c0-14 11-24 24-24s24 10 24 24c-10 4-38 4-48 0Z" fill="#e8443a" />
      <path d="M9 33c10 3.6 36 3.6 46 0 .6 .4 1 .6 1 1-10 4-38 4-48 0Z" fill="#c2332b" />
      <path d="M14 22c3-5 8-8 13-9" stroke="#ff9a8f" strokeWidth="2.4" fill="none" />
      <path d="M8 34c0-14 11-24 24-24s24 10 24 24c-10 4-38 4-48 0Z" fill="none" stroke="#8e2320" strokeWidth="2.8" />
      {dots.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" stroke="#f1d3cf" strokeWidth=".8" />
      ))}
    </g>
  )
}

/** Pilz (Steinpilz): brauner Hut, helle Poren, dicker, genetzter Stiel. */
function Steinpilz() {
  return (
    <g {...R}>
      <ellipse cx="32" cy="57" rx="18" ry="3" fill="rgba(110,68,38,.18)" />
      <path d="M24 34c-4 8-5 16-1 21 5 3 13 3 19 0 4-5 2-13-2-21Z" fill="#f1e3c6" />
      <path d="M36 35c3 7 5 14 2 20 1.6-.4 3-.8 4-1.4 3-5 2-12-1.6-18.6Z" fill="#dcc89e" />
      <path d="M26 42l4 3 4-3 4 3M25 48l4 3 4-3 4 3 4-3" stroke="#d2bb8c" strokeWidth="1.4" fill="none" />
      <path d="M24 34c-4 8-5 16-1 21 5 3 13 3 19 0 4-5 2-13-2-21" fill="none" stroke="#8a6a44" strokeWidth="2.6" />
      <path d="M9.5 34c9 4.4 36 4.4 45 0l.6 2c-10 5-36 5-46 0Z" fill="#e8d38a" stroke="#8a6a44" strokeWidth="1.6" />
      <path d="M8 34c0-13 11-22 24-22s24 9 24 22c-10 4-38 4-48 0Z" fill="#9a5b2e" />
      <path d="M41 15c8 3 14 10 15 19-4 1.6-9 2.4-14 2.8 3-7 2-15-1-21.8Z" fill="#7a4420" />
      <path d="M15 23c3-5 8-8 14-9" stroke="#c88a52" strokeWidth="2.6" fill="none" />
      <path d="M8 34c0-13 11-22 24-22s24 9 24 22c-10 4-38 4-48 0Z" fill="none" stroke="#4f2f17" strokeWidth="2.8" />
    </g>
  )
}

/** Baumpilz: Konsolen-Pilze, die seitlich aus einem Stamm wachsen. */
function Baumpilz() {
  const shelf = (y: number, w: number, h: number) =>
    `M22 ${y}c${w * 0.35} ${-h * 0.9} ${w * 0.8} ${-h * 0.7} ${w} ${h * 0.25}c${-w * 0.3} ${h * 0.6} ${-w * 0.7} ${h * 0.7} ${-w} ${h * 0.45}Z`
  return (
    <g {...R}>
      <path d="M4 2h18v60H4Z" fill="#8a5a3b" />
      <path d="M9 6c-1 10 1 18 0 28-1 9 1 18 0 26M16 4c1 10-1 20 0 30 1 9-1 18 0 26" stroke="#5c3a22" strokeWidth="2.2" fill="none" />
      <path d="M22 2v60" stroke="#4f2f17" strokeWidth="2.8" />
      {[
        [22, 34, 14],
        [40, 26, 11],
        [13, 18, 8],
      ].map(([y, w, h]) => (
        <g key={y}>
          <path d={shelf(y, w, h)} fill="#c98a4b" stroke="#6e4426" strokeWidth="2.6" />
          <path
            d={`M24 ${y - h * 0.2}c${w * 0.3} ${-h * 0.5} ${w * 0.62} ${-h * 0.4} ${w * 0.78} ${h * 0.12}`}
            stroke="#e9b97c"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d={`M22 ${y + h * 0.45}c${w * 0.3} ${h * 0.2} ${w * 0.7} ${h * 0.1} ${w * 0.97} ${-h * 0.15}`}
            stroke="#f1e3c6"
            strokeWidth="2"
            fill="none"
          />
        </g>
      ))}
    </g>
  )
}

/** Moos: weiches Polster auf einem Stein, mit Sporenkapseln. */
function Moos() {
  return (
    <g {...R}>
      <path d="M4 52c0-6 6-8 12-6h34c6-2 10 2 10 6s-4 6-10 6H12c-6 0-8-2-8-6Z" fill="#b8b2a6" stroke="#6b665e" strokeWidth="2.6" />
      <path d="M24 34c0-8 2-14 3-18M36 30c1-8 2-12 4-16M45 33c0-6 1-10 3-13" stroke="#8a5a3b" strokeWidth="1.6" fill="none" />
      <ellipse cx="27.2" cy="15" rx="1.9" ry="2.7" fill="#c4702f" stroke="#7a4420" strokeWidth="1" />
      <ellipse cx="40.2" cy="13" rx="1.9" ry="2.7" fill="#c4702f" stroke="#7a4420" strokeWidth="1" />
      <ellipse cx="48.2" cy="19" rx="1.7" ry="2.4" fill="#c4702f" stroke="#7a4420" strokeWidth="1" />
      <path
        d="M7 50c-1-8 5-14 12-13 2-7 11-9 16-4 5-5 14-3 16 3 5 0 9 5 7 11-1 3-3 4-6 4H10c-2 0-3-.4-3-1Z"
        fill="#5fb87c"
      />
      <path d="M10 48c4-3 10-3 14 0M28 46c4-3 9-3 13 0M44 47c3-2 7-2 10 1" stroke="#3f9d63" strokeWidth="2" fill="none" />
      <path d="M15 43c3-3 6-3 9-2M33 37c3-2 6-2 8 0" stroke="#a6e0b4" strokeWidth="2" fill="none" />
      <path
        d="M7 50c-1-8 5-14 12-13 2-7 11-9 16-4 5-5 14-3 16 3 5 0 9 5 7 11-1 3-3 4-6 4H10c-2 0-3-.4-3-1Z"
        fill="none"
        stroke="#2f6b45"
        strokeWidth="2.6"
      />
    </g>
  )
}

/** Eine kleine Ameise (dunkelbraun, nicht schwarz). */
function Ant({ x, y, a }: { x: number; y: number; a: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} stroke="#3d2414" strokeWidth="1" fill="none">
      <path d="M-1 0l-2-3M0 0v-3.4M1 0l2-3M-1 0l-2 3M0 0v3.4M1 0l2 3M4.4 0l2-2.4M4.4 0l2 2.4" />
      <circle cx="-3.6" cy="0" r="2.1" fill="#5c3a22" />
      <circle cx="0" cy="0" r="1.4" fill="#5c3a22" />
      <circle cx="3.6" cy="0" r="1.6" fill="#5c3a22" />
    </g>
  )
}

/** Ameisenhaufen: Hügel aus Nadeln mit Eingang und Ameisen. */
function Ameisenhaufen() {
  const twigs: Array<[number, number, number, string]> = [
    [24, 30, 30, '#8a5a33'],
    [34, 26, -20, '#d9b48f'],
    [40, 34, 15, '#8a5a33'],
    [18, 42, -30, '#d9b48f'],
    [28, 40, 60, '#8a5a33'],
    [46, 44, -40, '#d9b48f'],
    [14, 50, 20, '#8a5a33'],
    [24, 50, -10, '#d9b48f'],
    [44, 52, 30, '#8a5a33'],
    [52, 50, -60, '#d9b48f'],
    [32, 33, 80, '#d9b48f'],
  ]
  return (
    <g {...R}>
      <ellipse cx="32" cy="56" rx="29" ry="4" fill="rgba(110,68,38,.2)" />
      <path d="M4 55c6-14 15-33 28-37 13 4 22 23 28 37Z" fill="#b98352" />
      <path d="M38 20c9 6 17 22 22 35H44c0-13-2-25-6-35Z" fill="#9a6a40" />
      {twigs.map(([x, y, r, c], i) => (
        <path key={i} d={`M${x - 3} ${y}h6`} transform={`rotate(${r} ${x} ${y})`} stroke={c} strokeWidth="1.8" />
      ))}
      <path d="M4 55c6-14 15-33 28-37 13 4 22 23 28 37Z" fill="none" stroke="#6e4426" strokeWidth="2.8" />
      <ellipse cx="33" cy="46" rx="4.4" ry="3.2" fill="#4f2f17" />
      <Ant x={22} y={36} a={-55} />
      <Ant x={42} y={30} a={60} />
      <Ant x={54} y={59} a={10} />
    </g>
  )
}

/** Wurzel: Stammfuß, dessen Wurzeln sich in den Boden krallen. */
function Wurzel() {
  return (
    <g {...R}>
      <path d="M2 46h60v12c0 2-2 4-4 4H6c-2 0-4-2-4-4Z" fill="#d9b48f" opacity=".75" />
      <path d="M6 46h52" stroke="#8a6a44" strokeWidth="2" strokeDasharray="1 4" />
      <path
        d="M24 2h16v28c0 6 4 10 12 14 4 2 8 6 8 8h-8c-4-2-8-4-12-5 0 4 2 8 4 11h-8c-1-4-2-7-4-8-2 1-3 4-4 8h-8c2-3 4-7 4-11-4 1-8 3-12 5H4c0-2 4-6 8-8 8-4 12-8 12-14Z"
        fill="#a06d44"
      />
      <path d="M34 2h6v28c0 6 4 10 12 14 4 2 8 6 8 8h-8c-4-2-8-4-12-5-2-1-4-3-5-6 1-10-1-26-1-39Z" fill="#7a4f2e" />
      <path d="M29 6v20M34 10v14M18 46c3-2 5-4 6-7" stroke="#7a4f2e" strokeWidth="2" fill="none" />
      <path d="M27 6v12" stroke="#c99560" strokeWidth="1.8" fill="none" />
      <path
        d="M24 2v28c0 6-4 10-12 14-4 2-8 6-8 8h8c4-2 8-4 12-5 0 4-2 8-4 11h8c1-4 2-7 4-8 2 1 3 4 4 8h8c-2-3-4-7-4-11 4 1 8 3 12 5h8c0-2-4-6-8-8-8-4-12-8-12-14V2"
        fill="none"
        stroke="#5c3a22"
        strokeWidth="2.8"
      />
      <path d="M8 44c0-3 1-5 3-6M54 43c0-3 1-4 2-5" stroke="#3f9d63" strokeWidth="2.4" fill="none" />
    </g>
  )
}

/** Federn am Boden: mehrere Federn verstreut (Rupfung). */
function FedernRupfung() {
  const feather = (fill: string, line: string) => (
    <>
      <path d="M0 0c4-10 14-17 24-18-3 9-11 17-24 18Z" fill={fill} stroke={line} strokeWidth="2.2" />
      <path d="M0 0c7-5 16-12 24-18M9 -4l1 4M15 -9l2 3" stroke={line} strokeWidth="1.4" fill="none" />
    </>
  )
  return (
    <g {...R} transform="translate(-6 -10) scale(1.18)">
      <ellipse cx="32" cy="52" rx="27" ry="7" fill="#d9b48f" opacity=".45" />
      <g transform="translate(9 50)">{feather('#cfd8dc', '#5f7480')}</g>
      <g transform="translate(30 54) rotate(-30) scale(.8)">{feather('#efd9b4', '#8a6a44')}</g>
      <g transform="translate(36 38) rotate(25) scale(.75)">{feather('#9fb4c0', '#4f6470')}</g>
      {/* Daune */}
      <path
        d="M47 48c-2-3 0-6 3-5 1-3 5-3 6 0 3-1 5 2 3 5 2 2 0 5-3 4-1 3-5 3-6 0-3 1-5-2-3-4Z"
        fill="#ffffff"
        stroke="#a39a8c"
        strokeWidth="1.6"
      />
    </g>
  )
}

/** Override-Tabelle: Objekt-ID → Bildinhalt (für viewBox 0 0 64 64). */
export const TILE_ART: Readonly<Record<string, () => JSX.Element>> = {
  baumstumpf: Baumstumpf,
  baumrinde: Baumrinde,
  totholz: Totholz,
  kastanie: Kastanie,
  eichel: Eichel,
  nussschale: Nussschale,
  tannenzapfen: Tannenzapfen,
  tannenzweig: Tannenzweig,
  fliegenpilz: Fliegenpilz,
  pilz: Steinpilz,
  baumpilz: Baumpilz,
  moos: Moos,
  ameisenhaufen: Ameisenhaufen,
  wurzel: Wurzel,
  federn_rupfung: FedernRupfung,
}
