/* Waldbingo – Vektor-Piktogramme (SVG)
 *
 * Ein zusammenhängender, flacher Icon-Satz für alle 55 Objekte der Datenbank
 * (gemappt über `iconId`, identisch mit `id`) plus ein kleiner Satz UI-Glyphen.
 * Ersetzt die Emoji-Platzhalter des Prototyps (siehe NAECHSTE-SCHRITTE.md, AP 3).
 *
 * Stil: viewBox 0 0 64 64, transparenter Hintergrund, flächige Formen,
 * begrenzte Wald-Palette, runde Geometrie. Funktioniert in App UND Druck.
 *
 * Nutzung:
 *   WB_ICON(iconId, cssClass)  -> '<svg ...>…</svg>'  (oder '' wenn unbekannt)
 *   WB_HAS_ICON(iconId)        -> boolean
 *   WB_UI(name, cssClass)      -> '<svg ...>…</svg>'  (UI-Glyphen)
 */
/* Auto-portiert aus pictograms.js – Wald-Vektor-Piktogramme (viewBox 0 0 64 64). */
/* prettier-ignore-start */


  // ── Palette ────────────────────────────────────────────────────────────
  // grün  #57a76a #2f7d4f #8ed3a0 #d8efdf
  // braun #a06d44 #6f4a2c #c89b6e #e6cba3
  // rot   #d8564c #b23b34   gelb #f3c44d   orange #e8913c #c4702f
  // blau  #5aa8e0 #bfe2f5 #3f7fb8   grau #9aa4a9 #6e787d #c7ced2
  // ink   #34433a   weiß #ffffff   rosa #e7a9ba   erde #7d6a51

export const ICONS: Record<string, string> = {

    /* ─── Tiere ─── */
    eichhoernchen:
      '<path d="M41 14c11 1 16 13 11 24-3 8-10 11-10 11 5-13 1-23-8-26-4-1-1-10 7-9z" fill="#c4702f"/>' +
      '<ellipse cx="29" cy="41" rx="13" ry="15" fill="#e8913c"/>' +
      '<circle cx="25" cy="23" r="9" fill="#e8913c"/>' +
      '<path d="M19 16l-2-7 8 3z" fill="#c4702f"/>' +
      '<circle cx="22" cy="22" r="1.7" fill="#34433a"/>' +
      '<circle cx="28" cy="24" r="1.3" fill="#34433a"/>' +
      '<ellipse cx="33" cy="48" rx="6" ry="5" fill="#7d5a32"/>',
    igel:
      '<path d="M10 44c0-13 10-21 22-21s22 8 22 21z" fill="#a06d44"/>' +
      '<g fill="#6f4a2c">' +
      '<polygon points="14,40 11,24 19,38"/><polygon points="22,38 21,20 28,37"/>' +
      '<polygon points="32,36 33,18 39,36"/><polygon points="42,37 46,21 47,38"/>' +
      '<polygon points="50,40 55,27 53,41"/></g>' +
      '<path d="M44 44c6 0 10 3 10 3s-5 4-12 4z" fill="#e6cba3"/>' +
      '<circle cx="52" cy="46" r="1.6" fill="#34433a"/><circle cx="55" cy="47" r="1.4" fill="#34433a"/>',
    reh:
      '<path d="M40 18l3-9 3 9zM48 18l5-7 1 9z" fill="#6f4a2c"/>' +
      '<path d="M44 16c5 0 9 4 9 10v4c5 1 6 6 5 11l-3-1c-1 6-7 11-15 11-10 0-17-7-17-16 0-3 1-6 3-8-3-1-5-4-5-7l5 2c1-7 9-13 13-13z" fill="#c89b6e"/>' +
      '<path d="M27 46c0 5 3 8 3 8M40 48v8M50 46l1 8" stroke="#a06d44" stroke-width="3" stroke-linecap="round" fill="none"/>' +
      '<circle cx="49" cy="24" r="1.7" fill="#34433a"/>',
    fuchs:
      '<path d="M14 18l8 14-9-2zM50 18l-8 14 9-2z" fill="#c4702f"/>' +
      '<path d="M32 20c10 0 17 8 17 18 0 9-8 14-17 14s-17-5-17-14c0-10 7-18 17-18z" fill="#e8913c"/>' +
      '<path d="M22 34c4 5 16 5 20 0 0 0-3 12-10 12s-10-12-10-12z" fill="#ffffff"/>' +
      '<circle cx="25" cy="31" r="2" fill="#34433a"/><circle cx="39" cy="31" r="2" fill="#34433a"/>' +
      '<path d="M32 38l-3 3h6z" fill="#34433a"/>',
    maus:
      '<circle cx="22" cy="24" r="8" fill="#b6bcc0"/><circle cx="40" cy="24" r="8" fill="#b6bcc0"/>' +
      '<circle cx="22" cy="24" r="4" fill="#e7a9ba"/><circle cx="40" cy="24" r="4" fill="#e7a9ba"/>' +
      '<ellipse cx="31" cy="38" rx="15" ry="12" fill="#9aa4a9"/>' +
      '<path d="M46 40c10-2 8 10 0 9" stroke="#9aa4a9" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="27" cy="38" r="1.7" fill="#34433a"/><circle cx="35" cy="38" r="1.7" fill="#34433a"/>' +
      '<circle cx="31" cy="44" r="2" fill="#e7a9ba"/>',

    /* ─── Vögel ─── */
    specht:
      '<rect x="12" y="10" width="11" height="44" rx="3" fill="#a06d44"/>' +
      '<path d="M14 20h7M14 32h7M14 44h7" stroke="#6f4a2c" stroke-width="2"/>' +
      '<path d="M44 18c8 2 12 10 10 19-2 9-9 14-17 12-7-2-10-9-8-16 1-5 5-8 5-8l-12-3 13-3c2-2 5-3 9-1z" fill="#2b2f33"/>' +
      '<path d="M37 28c4-1 8 1 9 6-5 2-10 0-9-6z" fill="#ffffff"/>' +
      '<path d="M44 14c5-1 8 3 7 7-4-1-9 0-7-7z" fill="#d8564c"/>' +
      '<path d="M24 27l-10 2 10 2z" fill="#f3c44d"/>' +
      '<circle cx="45" cy="26" r="1.6" fill="#ffffff"/>',
    amsel:
      '<path d="M40 16c9 0 16 8 16 18 0 4-2 7-2 7l-9 4c-1 0-3 1-6 1-11 0-20-6-20-15 0-2 1-4 1-4l-6-6 9-1c3-3 9-9 17-4z" fill="#2b2f33"/>' +
      '<path d="M14 30l-8 1 8 4z" fill="#e8913c"/>' +
      '<circle cx="20" cy="27" r="2.4" fill="#f3c44d"/><circle cx="20" cy="27" r="1.1" fill="#2b2f33"/>' +
      '<path d="M40 46l-2 9 5-8z" fill="#1f2225"/>',
    eule:
      '<ellipse cx="32" cy="38" rx="18" ry="20" fill="#a06d44"/>' +
      '<polygon points="16,20 22,12 26,22" fill="#a06d44"/><polygon points="48,20 42,12 38,22" fill="#a06d44"/>' +
      '<path d="M20 50c0 6 24 6 24 0z" fill="#c89b6e"/>' +
      '<circle cx="24" cy="32" r="9" fill="#ffffff"/><circle cx="40" cy="32" r="9" fill="#ffffff"/>' +
      '<circle cx="24" cy="32" r="4" fill="#34433a"/><circle cx="40" cy="32" r="4" fill="#34433a"/>' +
      '<polygon points="32,34 28,40 36,40" fill="#f3c44d"/>' +
      '<path d="M26 56l-3 5M38 56l3 5" stroke="#e8913c" stroke-width="3" stroke-linecap="round"/>',
    vogelnest:
      '<path d="M8 38c0-2 4-3 8-3 4-12 28-12 32 0 4 0 8 1 8 3 0 9-12 16-24 16S8 47 8 38z" fill="#a06d44"/>' +
      '<path d="M10 40c8-3 36-3 44 0M12 44c8-2 32-2 40 0" stroke="#6f4a2c" stroke-width="2" fill="none"/>' +
      '<ellipse cx="26" cy="36" rx="6" ry="7" fill="#bfe2f5"/><ellipse cx="38" cy="36" rx="6" ry="7" fill="#d8efdf"/>',
    feder:
      '<path d="M46 12c4 10-1 26-13 35-4 3-9 5-13 5 1-4 2-7 4-10 0 0-5 1-8 0 3-3 5-6 8-8-2 0-5-1-7-2 9-9 22-19 29-20z" fill="#bfe2f5"/>' +
      '<path d="M44 15C34 22 24 33 16 47" stroke="#3f7fb8" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M40 19l-7 3M36 25l-7 4M31 32l-6 5M26 39l-5 5" stroke="#5aa8e0" stroke-width="1.6"/>',

    /* ─── Insekten / Kleintiere ─── */
    ameise:
      '<circle cx="18" cy="32" r="6" fill="#34433a"/><circle cx="31" cy="32" r="5" fill="#34433a"/><circle cx="45" cy="32" r="8" fill="#34433a"/>' +
      '<path d="M31 32l-9 9M31 32l-2 12M31 32l8 10M24 32l-8-7M24 30l-9 0M24 31l-8 6" stroke="#34433a" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M14 28l-5-6M14 28l-7-2" stroke="#34433a" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="15" cy="30" r="1.2" fill="#ffffff"/>',
    ameisenhaufen:
      '<rect x="40" y="40" width="8" height="14" fill="#6f4a2c"/>' +
      '<path d="M10 54c2-18 12-30 22-30s20 12 22 30z" fill="#a06d44"/>' +
      '<path d="M18 50l4-7M26 52l3-9M34 51l4-8M42 53l3-7M14 53l3-5" stroke="#7d6a51" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="24" cy="46" r="1.4" fill="#34433a"/><circle cx="33" cy="49" r="1.4" fill="#34433a"/><circle cx="40" cy="45" r="1.4" fill="#34433a"/>',
    biene:
      '<ellipse cx="20" cy="24" rx="9" ry="7" fill="#ffffff" opacity=".9"/><ellipse cx="40" cy="24" rx="9" ry="7" fill="#bfe2f5" opacity=".85"/>' +
      '<ellipse cx="32" cy="38" rx="13" ry="11" fill="#f3c44d"/>' +
      '<path d="M27 28c4 18 4 18 0 21M37 28c-3 19-3 19 0 21" fill="none"/>' +
      '<path d="M24 30q8 16 0 18zM40 30q-8 16 0 18z" fill="#34433a"/>' +
      '<path d="M32 27v22" stroke="#34433a" stroke-width="0"/>' +
      '<circle cx="26" cy="34" r="1.6" fill="#34433a"/>' +
      '<polygon points="32,49 29,55 35,55" fill="#34433a"/>',
    schmetterling:
      '<path d="M32 22v22" stroke="#34433a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M30 22c-2-4-8-7-14-5s-7 9-3 13c-4 1-6 6-3 9 4 4 14 1 20-6z" fill="#e8913c"/>' +
      '<path d="M34 22c2-4 8-7 14-5s7 9 3 13c4 1 6 6 3 9-4 4-14 1-20-6z" fill="#5aa8e0"/>' +
      '<circle cx="20" cy="24" r="2" fill="#f3c44d"/><circle cx="44" cy="24" r="2" fill="#bfe2f5"/>' +
      '<circle cx="22" cy="38" r="2" fill="#f3c44d"/><circle cx="42" cy="38" r="2" fill="#bfe2f5"/>' +
      '<path d="M31 20c-2-4-5-6-8-6M33 20c2-4 5-6 8-6" stroke="#34433a" stroke-width="2" fill="none" stroke-linecap="round"/>',
    marienkaefer:
      '<path d="M10 48c0-13 10-22 22-22s22 9 22 22z" fill="#d8564c"/>' +
      '<circle cx="32" cy="22" r="7" fill="#2b2f33"/>' +
      '<path d="M32 28v20" stroke="#2b2f33" stroke-width="3"/>' +
      '<circle cx="22" cy="38" r="3" fill="#2b2f33"/><circle cx="42" cy="38" r="3" fill="#2b2f33"/>' +
      '<circle cx="26" cy="46" r="2.4" fill="#2b2f33"/><circle cx="38" cy="46" r="2.4" fill="#2b2f33"/>' +
      '<circle cx="28" cy="20" r="1.4" fill="#ffffff"/><circle cx="36" cy="20" r="1.4" fill="#ffffff"/>',
    kaefer:
      '<ellipse cx="32" cy="38" rx="15" ry="18" fill="#2f7d4f"/>' +
      '<path d="M32 22v34" stroke="#1b4a30" stroke-width="2.5"/>' +
      '<ellipse cx="32" cy="18" rx="8" ry="6" fill="#1b4a30"/>' +
      '<path d="M28 14l-5-6M36 14l5-6" stroke="#34433a" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M18 30l-9-3M18 40h-10M20 50l-9 4M46 30l9-3M46 40h10M44 50l9 4" stroke="#34433a" stroke-width="2.4" stroke-linecap="round"/>' +
      '<ellipse cx="26" cy="30" rx="3" ry="5" fill="#8ed3a0" opacity=".6"/>',
    spinnennetz:
      '<g stroke="#9aa4a9" stroke-width="1.6" fill="none">' +
      '<path d="M32 6V58M6 32H58M13 13l38 38M51 13L13 51"/>' +
      '<path d="M32 14a18 18 0 0 1 13 5M45 19a18 18 0 0 1 5 13"/>' +
      '<path d="M32 22a10 10 0 0 1 7 3M39 25a10 10 0 0 1 3 7"/>' +
      '<path d="M50 32a18 18 0 0 1-5 13M45 45a18 18 0 0 1-13 5"/>' +
      '<path d="M42 32a10 10 0 0 1-3 7M39 39a10 10 0 0 1-7 3"/></g>' +
      '<circle cx="32" cy="32" r="3" fill="#34433a"/>',
    schnecke:
      '<path d="M8 50c0-6 6-9 12-9h14c2 0 4-1 4-3l-1-4" fill="#e6cba3"/>' +
      '<path d="M8 50c0-6 6-9 12-9h16" fill="none" stroke="#c89b6e" stroke-width="2"/>' +
      '<circle cx="42" cy="34" r="16" fill="#c89b6e"/>' +
      '<path d="M42 34m0 0a8 8 0 1 1 0 1 5 5 0 1 0 0 -3" fill="none" stroke="#6f4a2c" stroke-width="3"/>' +
      '<circle cx="42" cy="34" r="16" fill="none" stroke="#a06d44" stroke-width="3"/>' +
      '<path d="M14 41V31M20 41V29" stroke="#e6cba3" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="14" cy="30" r="2" fill="#34433a"/><circle cx="20" cy="28" r="2" fill="#34433a"/>',
    regenwurm:
      '<path d="M14 18c8 0 8 8 0 8s-8 9 0 9 10 8 18 8 12-8 18-8" fill="none" stroke="#e7a9ba" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M14 18c8 0 8 8 0 8s-8 9 0 9 10 8 18 8 12-8 18-8" fill="none" stroke="#d68aa0" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 7"/>' +
      '<circle cx="55" cy="37" r="1.4" fill="#34433a"/>',
    'glühwürmchen':
      '<circle cx="38" cy="40" r="16" fill="#f3c44d" opacity=".28"/>' +
      '<circle cx="38" cy="40" r="9" fill="#f3c44d" opacity=".55"/>' +
      '<ellipse cx="26" cy="26" rx="7" ry="5" fill="#34433a" transform="rotate(35 26 26)"/>' +
      '<ellipse cx="36" cy="38" rx="9" ry="6" fill="#f6d96e" transform="rotate(35 36 38)"/>' +
      '<path d="M22 22l-5-4M26 19l-2-6" stroke="#34433a" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M50 28l5-3M52 36l6 0M50 44l5 4" stroke="#f3c44d" stroke-width="2" stroke-linecap="round"/>',

    /* ─── Pflanzen ─── */
    eichel:
      '<path d="M22 28h20l-2 6c0 9-5 18-8 18s-8-9-8-18z" fill="#c89b6e"/>' +
      '<path d="M22 28c-1 9 4 24 10 24s11-15 10-24" fill="none" stroke="#a06d44" stroke-width="2"/>' +
      '<path d="M18 24c0-5 6-8 14-8s14 3 14 8c0 3-6 5-14 5s-14-2-14-5z" fill="#6f4a2c"/>' +
      '<path d="M32 16v-6" stroke="#6f4a2c" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M23 22h18M21 25h22" stroke="#5a3c22" stroke-width="1.4"/>',
    kastanie:
      '<path d="M14 40l-6-2 4 5-6 1 6 3-3 5 6-1M50 40l6-2-4 5 6 1-6 3 3 5-6-1" fill="#8ed3a0"/>' +
      '<circle cx="32" cy="38" r="17" fill="#6f4a2c"/>' +
      '<circle cx="32" cy="38" r="17" fill="none" stroke="#5a3c22" stroke-width="2"/>' +
      '<path d="M22 46c0-8 8-13 12-12 0 0-9 2-9 12z" fill="#e6cba3"/>' +
      '<circle cx="38" cy="30" r="4" fill="#c89b6e" opacity=".7"/>',
    tannenzapfen:
      '<path d="M32 8c3 0 6 3 6 3s5-1 6 1-2 5-2 5 4 2 3 5-5 3-5 3 3 4 1 6-6 1-6 1 1 5-2 6-6-3-6-3-3 5-6 3-2-6-2-6-4 1-6-1 1-6 1-6-5-1-5-4 4-5 4-5-3-3-1-5 6-1 6-1-1-4 2-5 6 3 6 3 1-4 4-4z" fill="#a06d44"/>' +
      '<path d="M26 14l6 5 6-5M22 24l10 6 10-6M22 36l10 6 10-6M27 47l5 4 5-4" fill="none" stroke="#6f4a2c" stroke-width="2"/>',
    tannenzweig:
      '<path d="M32 8v48" stroke="#6f4a2c" stroke-width="3" stroke-linecap="round"/>' +
      '<g stroke="#2f7d4f" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M32 14l-12-4M32 14l12-4M32 22l-15-3M32 22l15-3M32 31l-16-1M32 31l16-1M32 40l-15 2M32 40l15 2M32 49l-12 4M32 49l12 4"/></g>',
    blatt:
      '<path d="M32 10C16 18 14 44 30 54c2-12 8-24 18-32-7 0-13 3-17 8 1-8 4-15 1-20z" fill="#57a76a"/>' +
      '<path d="M30 54C30 38 38 26 48 20" fill="none" stroke="#2f7d4f" stroke-width="2"/>' +
      '<path d="M30 40l9-7M29 47l8-7" stroke="#2f7d4f" stroke-width="1.6"/>',
    buntes_blatt:
      '<path d="M32 6l4 9 8-5-2 9 9 1-7 6 7 6-9 1 2 9-8-5-4 9-4-9-8 5 2-9-9-1 7-6-7-6 9-1-2-9 8 5z" fill="#e8913c"/>' +
      '<path d="M32 14v40" stroke="#b23b34" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M32 26l8 4M32 26l-8 4M32 36l9 5M32 36l-9 5" stroke="#c4702f" stroke-width="1.6"/>',
    blume:
      '<path d="M32 50V34" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32 44c-7 1-12-3-12-3 5-4 12-1 12-1M32 40c4 0 9-4 9-4-5-3-9 1-9 1" fill="#57a76a"/>' +
      '<g fill="#e7a9ba">' +
      '<ellipse cx="32" cy="16" rx="5" ry="7"/><ellipse cx="32" cy="32" rx="5" ry="7"/>' +
      '<ellipse cx="24" cy="24" rx="7" ry="5"/><ellipse cx="40" cy="24" rx="7" ry="5"/>' +
      '<ellipse cx="26" cy="18" rx="6" ry="5" transform="rotate(-45 26 18)"/><ellipse cx="38" cy="18" rx="6" ry="5" transform="rotate(45 38 18)"/></g>' +
      '<circle cx="32" cy="24" r="6" fill="#f3c44d"/>',
    loewenzahn:
      '<path d="M32 52V30" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32 44c-6 0-10-4-10-4 5-3 10 0 10 0" fill="#57a76a"/>' +
      '<circle cx="32" cy="22" r="11" fill="#f3c44d"/>' +
      '<g stroke="#e8913c" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M32 22V7M32 22l11-9M32 22l-11-9M32 22l14 4M32 22l-14 4M32 22l9 12M32 22l-9 12"/></g>' +
      '<circle cx="32" cy="22" r="5" fill="#e8913c"/>',
    farn:
      '<path d="M48 12C26 18 16 38 16 54" fill="none" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="#57a76a">' +
      '<ellipse cx="42" cy="15" rx="6" ry="2.5" transform="rotate(-25 42 15)"/>' +
      '<ellipse cx="34" cy="21" rx="7" ry="3" transform="rotate(-30 34 21)"/>' +
      '<ellipse cx="27" cy="29" rx="8" ry="3.4" transform="rotate(-38 27 29)"/>' +
      '<ellipse cx="22" cy="39" rx="8" ry="3.6" transform="rotate(-50 22 39)"/>' +
      '<ellipse cx="18" cy="49" rx="7" ry="3.4" transform="rotate(-62 18 49)"/>' +
      '<ellipse cx="49" cy="20" rx="5" ry="2.4" transform="rotate(35 49 20)"/>' +
      '<ellipse cx="41" cy="27" rx="6" ry="2.8" transform="rotate(28 41 27)"/>' +
      '<ellipse cx="33" cy="37" rx="6.5" ry="3" transform="rotate(20 33 37)"/>' +
      '<ellipse cx="28" cy="48" rx="6" ry="3" transform="rotate(8 28 48)"/></g>',
    klee:
      '<path d="M32 54V36" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32 34c0-9-13-12-13-3 0 6 9 8 13 3z" fill="#57a76a"/>' +
      '<path d="M32 34c0-9 13-12 13-3 0 6-9 8-13 3z" fill="#57a76a"/>' +
      '<path d="M32 36c-6-6-6-19 0-19s6 13 0 19z" fill="#3f9d63"/>' +
      '<circle cx="32" cy="30" r="2" fill="#2f7d4f"/>',
    brennnessel:
      '<path d="M32 56V18" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M30 30c-12-2-18-12-18-12 8-2 12 0 12 0-3-4-2-9-2-9 6 3 8 8 8 13z" fill="#57a76a"/>' +
      '<path d="M34 38c12-2 18-12 18-12-8-2-12 0-12 0 3-4 2-9 2-9-6 3-8 8-8 13z" fill="#3f9d63"/>' +
      '<path d="M16 22l4-1 1 4M44 30l-4-1-1 4" stroke="#2f7d4f" stroke-width="1.6" fill="none"/>',
    moos:
      '<path d="M8 52c0-6 4-9 9-9 1-7 8-11 14-9 3-6 12-6 15 1 6-1 11 3 11 9 0 4-3 7-3 7z" fill="#3f9d63"/>' +
      '<path d="M8 52c4-3 44-3 48 0z" fill="#2f7d4f"/>' +
      '<g stroke="#2f7d4f" stroke-width="2" stroke-linecap="round"><path d="M20 44v-7M28 40v-9M38 41v-8M46 45v-6"/></g>' +
      '<circle cx="20" cy="36" r="2.2" fill="#8ed3a0"/><circle cx="28" cy="30" r="2.2" fill="#8ed3a0"/>' +
      '<circle cx="38" cy="32" r="2.2" fill="#8ed3a0"/><circle cx="46" cy="38" r="2.2" fill="#8ed3a0"/>',
    gras:
      '<g fill="none" stroke="#57a76a" stroke-width="3" stroke-linecap="round">' +
      '<path d="M16 54c0-12-4-18-4-18M24 54c0-16 2-24 2-24M32 54c0-12 4-20 4-20"/>' +
      '<path d="M40 54c0-16-1-22-1-22M48 54c0-12 4-16 4-16"/></g>' +
      '<g fill="none" stroke="#3f9d63" stroke-width="3" stroke-linecap="round">' +
      '<path d="M20 54c0-10 5-16 5-16M36 54c0-12-3-18-3-18M44 54c0-10-3-14-3-14"/></g>',
    beeren:
      '<path d="M40 12c-2 8-8 14-8 14M44 16c0 8-5 14-5 14" fill="none" stroke="#2f7d4f" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M30 18c8-2 14 2 14 2-4 6-12 5-14-2z" fill="#57a76a"/>' +
      '<circle cx="24" cy="40" r="8" fill="#3f7fb8"/><circle cx="40" cy="42" r="8" fill="#5aa8e0"/>' +
      '<circle cx="32" cy="30" r="7" fill="#3f7fb8"/>' +
      '<circle cx="22" cy="37" r="1.8" fill="#bfe2f5"/><circle cx="38" cy="39" r="1.8" fill="#bfe2f5"/><circle cx="30" cy="28" r="1.6" fill="#bfe2f5"/>',

    /* ─── Bäume / Holz ─── */
    baumrinde:
      '<rect x="16" y="8" width="32" height="48" rx="6" fill="#a06d44"/>' +
      '<g stroke="#6f4a2c" stroke-width="2.6" fill="none" stroke-linecap="round">' +
      '<path d="M24 10c-2 8 2 14-1 22s1 14-1 22M34 10c2 10-2 16 1 24s-2 12 0 22M44 12c-2 8 1 16-2 22"/></g>' +
      '<g stroke="#7d5a32" stroke-width="1.4"><path d="M28 20l4 3M40 34l-4 3M26 40l5 2"/></g>',
    baumstumpf:
      '<path d="M16 26h32v22c0 4-7 7-16 7s-16-3-16-7z" fill="#a06d44"/>' +
      '<path d="M16 48c0 4 7 7 16 7s16-3 16-7" fill="none" stroke="#6f4a2c" stroke-width="2"/>' +
      '<ellipse cx="32" cy="26" rx="16" ry="7" fill="#c89b6e"/>' +
      '<ellipse cx="32" cy="26" rx="11" ry="4.6" fill="none" stroke="#a06d44" stroke-width="2"/>' +
      '<ellipse cx="32" cy="26" rx="6" ry="2.6" fill="none" stroke="#a06d44" stroke-width="2"/>' +
      '<ellipse cx="32" cy="26" rx="2" ry="1" fill="#6f4a2c"/>',
    wurzel:
      '<path d="M26 10h12v22h-12z" fill="#a06d44"/>' +
      '<path d="M32 30c0 0-2 10-12 14-6 2-12 2-12 2M32 30c0 0 2 12 14 16 4 1 8 0 8 0M32 32c0 0 0 14-2 20M32 32c-4 6-12 8-12 8" fill="none" stroke="#6f4a2c" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M6 50c12-2 52-2 52 0" stroke="#7d6a51" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M26 12h12M26 20h12" stroke="#6f4a2c" stroke-width="1.6"/>',
    totholz:
      '<path d="M8 34h44c4 0 4 12 0 12H8c-4 0-4-12 0-12z" fill="#a06d44"/>' +
      '<ellipse cx="8" cy="40" rx="4" ry="6" fill="#6f4a2c"/>' +
      '<circle cx="14" cy="40" r="2" fill="#5a3c22"/><circle cx="20" cy="38" r="1.6" fill="#5a3c22"/>' +
      '<path d="M30 35c8-2 16 2 22 1M28 45c8 1 14-2 22-1" stroke="#7d5a32" stroke-width="1.6" fill="none"/>' +
      '<path d="M22 34c0-5 5-7 5-7 1 4-1 7-1 7M30 34c0-6 6-8 6-8 1 5-1 8-1 8" fill="#d8564c"/>' +
      '<path d="M22 34h6M30 34h6" stroke="#ffffff" stroke-width="2"/>' +
      '<path d="M40 46c4 1 8 0 8 0" stroke="#3f9d63" stroke-width="3" stroke-linecap="round"/>',

    /* ─── Pilze ─── */
    pilz:
      '<path d="M26 36h12c0 0 2 16-6 16s-6-16-6-16z" fill="#e6cba3"/>' +
      '<path d="M10 36c0-12 10-20 22-20s22 8 22 20z" fill="#a06d44"/>' +
      '<path d="M10 36c0-12 10-20 22-20s22 8 22 20" fill="none" stroke="#8a5a36" stroke-width="2"/>' +
      '<ellipse cx="22" cy="28" rx="4" ry="2.4" fill="#c89b6e" opacity=".7"/><ellipse cx="38" cy="26" rx="3" ry="2" fill="#c89b6e" opacity=".7"/>',
    fliegenpilz:
      '<path d="M26 36h12c0 0 2 16-6 16s-6-16-6-16z" fill="#f3ead4"/>' +
      '<path d="M27 40c4 1 6 1 10 0" stroke="#e6cba3" stroke-width="2"/>' +
      '<path d="M10 36c0-12 10-20 22-20s22 8 22 20z" fill="#d8564c"/>' +
      '<circle cx="22" cy="26" r="3" fill="#ffffff"/><circle cx="34" cy="22" r="3.4" fill="#ffffff"/>' +
      '<circle cx="44" cy="30" r="2.6" fill="#ffffff"/><circle cx="30" cy="32" r="2.4" fill="#ffffff"/><circle cx="14" cy="32" r="2.2" fill="#ffffff"/>',
    baumpilz:
      '<rect x="12" y="8" width="14" height="48" rx="3" fill="#a06d44"/>' +
      '<path d="M12 22h6M12 36h6M12 48h6" stroke="#6f4a2c" stroke-width="2"/>' +
      '<path d="M26 22c14-3 22 3 22 6 0 4-12 5-22 2z" fill="#c89b6e"/>' +
      '<path d="M26 38c12-3 20 2 20 5 0 3-10 4-20 2z" fill="#c89b6e"/>' +
      '<path d="M28 23c10-1 17 3 18 5M28 39c9-1 15 2 16 4" fill="none" stroke="#a06d44" stroke-width="1.6"/>',

    /* ─── Spuren / Funde ─── */
    pfotenabdruck:
      '<path d="M22 44c0-8 4-12 10-12s10 4 10 12c0 6-4 8-10 8s-10-2-10-8z" fill="#34433a"/>' +
      '<ellipse cx="16" cy="32" rx="4" ry="6" fill="#34433a"/><ellipse cx="26" cy="24" rx="4.4" ry="6.5" fill="#34433a"/>' +
      '<ellipse cx="38" cy="24" rx="4.4" ry="6.5" fill="#34433a"/><ellipse cx="48" cy="32" rx="4" ry="6" fill="#34433a"/>',
    federn_rupfung:
      '<path d="M28 8c3 7 0 18-8 24-3 2-6 3-9 3 1-3 1-5 3-7 0 0-4 1-6 0 2-2 4-4 6-5-2 0-4-1-5-2 6-6 16-13 19-13z" fill="#bfe2f5"/>' +
      '<path d="M26 11c-7 5-13 12-18 21" stroke="#3f7fb8" stroke-width="1.6" fill="none"/>' +
      '<path d="M56 30c1 6-2 14-9 18-3 2-6 2-8 2 1-3 2-4 3-6 0 0-3 1-5 0 2-2 3-3 5-4-2 0-3-1-4-2 5-4 14-8 18-8z" fill="#d8efdf"/>' +
      '<path d="M53 33c-6 3-11 8-15 14" stroke="#57a76a" stroke-width="1.4" fill="none"/>' +
      '<path d="M10 52c14-3 30-3 44 0" stroke="#7d6a51" stroke-width="2.4" stroke-linecap="round"/>',
    nussschale:
      '<path d="M10 30c0-8 10-12 22-12s22 4 22 12c0 3-3 5-3 5l-7-3-6 4-6-4-6 3-7-3s-3-2-3-5z" fill="#6f4a2c"/>' +
      '<path d="M14 33c4 11 11 19 18 19s14-8 18-19c0 0-8 5-18 5s-18-5-18-5z" fill="#c89b6e"/>' +
      '<path d="M22 40l5 6M30 38l-3 8M38 40l-4 7" stroke="#8a5a36" stroke-width="1.6"/>' +
      '<path d="M44 30l6-3M46 35l7-1" stroke="#a06d44" stroke-width="2" stroke-linecap="round"/>',
    schneckenhaus:
      '<circle cx="32" cy="32" r="22" fill="#e6cba3"/>' +
      '<circle cx="32" cy="32" r="22" fill="none" stroke="#c89b6e" stroke-width="2"/>' +
      '<path d="M32 32m0 0a10 10 0 1 1 0 1 7 7 0 1 0 0 -4 4 4 0 1 1 0 2" fill="none" stroke="#a06d44" stroke-width="3.4"/>' +
      '<path d="M32 10a22 22 0 0 1 20 14" fill="none" stroke="#d8c19a" stroke-width="3"/>',

    /* ─── Landschaft ─── */
    steine:
      '<ellipse cx="40" cy="44" rx="18" ry="11" fill="#9aa4a9"/>' +
      '<ellipse cx="40" cy="42" rx="18" ry="9" fill="#b3bcc0"/>' +
      '<path d="M14 40c0-8 7-13 13-13s12 5 12 12c0 3-1 5-1 5H15s-1-2-1-4z" fill="#6e787d"/>' +
      '<path d="M14 40c0-8 7-13 13-13s12 5 12 11" fill="none" stroke="#7e878c" stroke-width="2"/>' +
      '<path d="M20 33l5-2 3 4" stroke="#9aa4a9" stroke-width="1.6" fill="none"/>',
    pfuetze:
      '<ellipse cx="32" cy="42" rx="24" ry="10" fill="#bfe2f5"/>' +
      '<ellipse cx="32" cy="42" rx="24" ry="10" fill="none" stroke="#5aa8e0" stroke-width="2"/>' +
      '<ellipse cx="30" cy="42" rx="11" ry="4.4" fill="none" stroke="#5aa8e0" stroke-width="1.6"/>' +
      '<ellipse cx="30" cy="42" rx="5" ry="2" fill="none" stroke="#5aa8e0" stroke-width="1.4"/>' +
      '<path d="M40 12c4 6 4 11 0 11s-4-5 0-11z" fill="#5aa8e0"/>',
    bach:
      '<path d="M6 16c10 0 6 8 14 10 8 2 10-6 18-4 8 2 6 10 14 10v18c-8 0-6-8-14-10-8-2-10 6-18 4-8-2-4-10-14-10z" fill="#5aa8e0"/>' +
      '<path d="M10 22c8 1 8 7 16 8M22 38c8 2 12-4 18-3" stroke="#bfe2f5" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="16" cy="50" rx="6" ry="3" fill="#9aa4a9"/><ellipse cx="46" cy="18" rx="6" ry="3" fill="#9aa4a9"/>' +
      '<path d="M52 16c0-4 6-4 6 0s-6 4-6 0z" fill="#57a76a"/>',
    bank:
      '<rect x="10" y="28" width="44" height="6" rx="2" fill="#a06d44"/>' +
      '<rect x="12" y="18" width="40" height="5" rx="2" fill="#c89b6e"/>' +
      '<path d="M12 23v5M22 23v5M32 23v5M42 23v5M52 23v5" stroke="#a06d44" stroke-width="2"/>' +
      '<rect x="14" y="34" width="5" height="16" rx="2" fill="#6f4a2c"/><rect x="45" y="34" width="5" height="16" rx="2" fill="#6f4a2c"/>',
    aussichtsturm:
      '<path d="M24 12h16l6 42H18z" fill="#c89b6e"/>' +
      '<path d="M16 50h32v5H16z" fill="#a06d44"/>' +
      '<path d="M14 46h36l-3-6H17z" fill="#6f4a2c"/>' +
      '<path d="M25 18h14M24 28h16M22 40h20" stroke="#a06d44" stroke-width="2.4"/>' +
      '<path d="M28 18l8 28M36 18l-8 28" stroke="#a06d44" stroke-width="1.6"/>' +
      '<path d="M32 12V6l8 4z" fill="#d8564c"/>',
    wegweiser:
      '<rect x="29" y="14" width="6" height="42" rx="2" fill="#8a5a36"/>' +
      '<path d="M35 18h17l5 5-5 5H35z" fill="#c89b6e"/>' +
      '<path d="M29 30H12l-5 5 5 5h17z" fill="#a06d44"/>' +
      '<path d="M35 18h17l5 5-5 5H35z" fill="none" stroke="#8a5a36" stroke-width="1.6"/>' +
      '<circle cx="32" cy="12" r="4" fill="#d8564c"/>',
    eiszapfen:
      '<path d="M8 12h48v6H8z" fill="#9aa4a9"/>' +
      '<path d="M16 18l4 26 4-26zM30 18l3 32 3-32zM44 18l4 22 4-22z" fill="#bfe2f5"/>' +
      '<path d="M16 18l4 26 4-26zM30 18l3 32 3-32zM44 18l4 22 4-22z" fill="none" stroke="#5aa8e0" stroke-width="1.4"/>' +
      '<path d="M19 24v10M33 26v14M47 24v8" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>',
    raureif:
      '<path d="M14 52C14 34 14 22 14 14" stroke="#6f4a2c" stroke-width="3" stroke-linecap="round"/>' +
      '<g stroke="#bfe2f5" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M14 20l10-6M14 20l-8-4M14 30l11-5M14 30l-9-3M14 40l10-6M14 40l-8-3"/></g>' +
      '<g fill="#ffffff"><circle cx="26" cy="13" r="2.4"/><circle cx="27" cy="24" r="2.4"/><circle cx="26" cy="33" r="2.4"/>' +
      '<circle cx="5" cy="15" r="2"/><circle cx="4" cy="26" r="2"/><circle cx="5" cy="36" r="2"/></g>' +
      '<path d="M40 50c0-10 4-16 4-16s4 6 4 16M48 44h8M48 44l6-4M48 48l6 2" stroke="#bfe2f5" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    schneeflocke:
      '<g stroke="#5aa8e0" stroke-width="3" stroke-linecap="round">' +
      '<path d="M32 6V58M9 19l46 26M55 19L9 45"/>' +
      '<path d="M32 16l-6-6M32 16l6-6M32 48l-6 6M32 48l6 6"/>' +
      '<path d="M14 24l-8-1M14 24l-1-8M50 40l8 1M50 40l1 8"/>' +
      '<path d="M50 24l8-1M50 24l1-8M14 40l-8 1M14 40l-1 8"/></g>' +
      '<circle cx="32" cy="32" r="3.4" fill="#bfe2f5"/>',
    wolke:
      '<path d="M20 44c-8 0-13-5-13-12 0-6 5-11 11-11 2-7 9-12 16-12 9 0 16 7 16 16 0 1 0 2-1 3 4 1 7 4 7 9 0 6-5 9-11 9z" fill="#c7ced2"/>' +
      '<path d="M16 40c-5 0-8-4-8-8 0-5 4-8 8-8 1-6 7-10 13-10 7 0 13 5 13 13 0 6-5 11-12 11z" fill="#eef2f4"/>'
  };

  // ── UI-Glyphen (Bedienoberfläche) ───────────────────────────────────────
export const UI: Record<string, string> = {
    leaf:
      '<path d="M50 10C26 12 12 28 12 46c0 3 1 6 1 6s3 1 6 1c18 0 34-14 36-38 0-2 0-4-1-5-1-1-3-1-4-0z" fill="#8ed3a0"/>' +
      '<path d="M16 50C24 36 36 24 48 16" fill="none" stroke="#2f7d4f" stroke-width="3" stroke-linecap="round"/>',
    pin:
      '<path d="M32 6c11 0 20 9 20 20 0 14-20 32-20 32S12 40 12 26c0-11 9-20 20-20z" fill="currentColor"/>' +
      '<circle cx="32" cy="26" r="8" fill="#ffffff"/>',
    dice:
      '<rect x="11" y="11" width="42" height="42" rx="11" fill="none" stroke="currentColor" stroke-width="4.5"/>' +
      '<g fill="currentColor"><circle cx="23" cy="23" r="3.7"/><circle cx="41" cy="23" r="3.7"/><circle cx="32" cy="32" r="3.7"/><circle cx="23" cy="41" r="3.7"/><circle cx="41" cy="41" r="3.7"/></g>',
    printer:
      '<path d="M18 10h28v14H18z" fill="none" stroke="currentColor" stroke-width="4"/>' +
      '<rect x="8" y="24" width="48" height="22" rx="4" fill="currentColor"/>' +
      '<rect x="18" y="38" width="28" height="16" rx="2" fill="#ffffff" stroke="currentColor" stroke-width="4"/>' +
      '<circle cx="46" cy="32" r="2.4" fill="#ffffff"/>',
    doc:
      '<path d="M16 8h22l12 12v36H16z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M37 8v13h13" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M23 32h18M23 40h18M23 48h12" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>',
    back:
      '<path d="M30 14L14 32l16 18M14 32h32c6 0 6 0 6 0" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    info:
      '<circle cx="32" cy="32" r="22" fill="currentColor"/>' +
      '<circle cx="32" cy="22" r="3.2" fill="#ffffff"/>' +
      '<rect x="29" y="29" width="6" height="16" rx="3" fill="#ffffff"/>',
    check:
      '<path d="M14 34l12 12 24-26" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
    season:
      '<circle cx="32" cy="32" r="11" fill="#f3c44d"/>' +
      '<g stroke="#f3c44d" stroke-width="3.4" stroke-linecap="round"><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/></g>',
    weather:
      '<circle cx="24" cy="24" r="9" fill="#f3c44d"/>' +
      '<path d="M28 44c-7 0-12-4-12-10 0-5 4-9 9-9 2-6 8-10 14-10 8 0 14 6 14 14 0 6-5 11-12 11z" fill="#c7ced2"/>',
    clock:
      '<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="5"/>' +
      '<path d="M32 18v15l10 7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    habitat:
      '<path d="M32 6l16 22h-9l11 16H22l11-16h-9z" fill="#3f9d63"/>' +
      '<rect x="29" y="42" width="6" height="14" rx="2" fill="#8a5a36"/>',
    seed:
      '<path d="M14 40c0-12 8-20 18-20-2 12-8 18-18 20z" fill="#57a76a"/>' +
      '<path d="M50 40c0-12-8-20-18-20 2 12 8 18 18 20z" fill="#3f9d63"/>' +
      '<path d="M32 54V24" stroke="#6f4a2c" stroke-width="3" stroke-linecap="round"/>',
    sparkle:
      '<path d="M32 8l5 16 16 5-16 5-5 16-5-16-16-5 16-5z" fill="currentColor"/>' +
      '<path d="M50 40l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="currentColor"/>',
    users:
      '<circle cx="23" cy="24" r="9" fill="currentColor"/>' +
      '<circle cx="44" cy="26" r="7" fill="currentColor" opacity="0.7"/>' +
      '<path d="M8 52c0-9 7-15 15-15s15 6 15 15z" fill="currentColor"/>' +
      '<path d="M40 52c0-7 3-12 8-13 5 1 8 6 8 13z" fill="currentColor" opacity="0.7"/>',
    share:
      '<circle cx="48" cy="16" r="7" fill="currentColor"/>' +
      '<circle cx="16" cy="32" r="7" fill="currentColor"/>' +
      '<circle cx="48" cy="48" r="7" fill="currentColor"/>' +
      '<path d="M42 19L22 29M22 35l20 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    copy:
      '<rect x="22" y="22" width="30" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="4.5"/>' +
      '<path d="M14 42h-2a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v2" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>',
    close:
      '<path d="M18 18l28 28M46 18L18 46" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    link:
      '<path d="M26 38l12-12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M30 18l4-4a11 11 0 0 1 16 16l-4 4" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M34 46l-4 4a11 11 0 0 1-16-16l4-4" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'
  };


function svg(inner: string, cls: string): string {
  return (
    '<svg class="' + (cls || '') +
    '" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    inner +
    '</svg>'
  );
}

export function WB_ICON(id: string, cls = 'pico'): string {
  return ICONS[id] ? svg(ICONS[id], cls) : '';
}
export function WB_HAS_ICON(id: string): boolean {
  return !!ICONS[id];
}
export function WB_UI(name: string, cls = 'ui-ic'): string {
  return UI[name] ? svg(UI[name], cls) : '';
}
export const WB_ICON_IDS: string[] = Object.keys(ICONS);
