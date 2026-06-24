// Teilbares Spiel + kompakte Kodierung für selbst-enthaltene Einladungs-Links.
//
// Modell: Eine Einladung trägt den fixen Pool + Seed + Kontext. Jedes Gerät
// berechnet seine eigene Karten-Reihenfolge beim Beitreten aus der gewählten
// Spielernummer (siehe `cardsForGame`). Es findet KEIN Live-Sync statt – jeder
// spielt offline auf seinem Gerät.
//
// Zwei Transportwege nutzen denselben `SharedGame`:
//  - Server-Code: voller Pool als JSON (robust über App-Updates hinweg).
//  - Link/QR: kompakt – kuratierte Arten als ID-Referenz (im Bundle vorhanden),
//    nur Live-Arten voll. Hält die URL klein genug, dass viele Spiele in einen
//    QR-Code passen.
import { OBJEKTE } from '../data/objects'
import type {
  Kategorie,
  MediaKind,
  ObjektMedia,
  Schwierigkeit,
  SpielKontext,
  WaldObjekt,
} from '../data/types'

/** Schema-Version der Einladung (für künftige Migrationen). */
export const SHARE_VERSION = 1

/** Vollständiges, geräteübergreifend teilbares Spiel (ohne Fortschritt). */
export interface SharedGame {
  v: number
  pool: WaldObjekt[]
  ctx: SpielKontext
  diff: number
  seedStr: string
  players: number
  createdAt: number
}

// ── Kompakte Wire-Form (für Link/QR möglichst kurz) ─────────────────────────
/** Live-Art schlank: nur Felder, die ein beigetretenes Gerät zum Spielen braucht. */
interface SlimLive {
  id: string
  n: string // name
  k: Kategorie // kategorie
  e: string // emoji
  ic: string // iconId
  sw: Schwierigkeit // schwierigkeit
  i: [string, string, string] // info: kurz, erkennen, wusstest_du
  tx?: number // _taxonId
  m?: { k: MediaKind; u?: string; a?: string; l?: string; s?: string } // _media
}

/** Pool-Eintrag: kuratierte Art als ID-String, Live-Art als schlankes Objekt. */
type PoolEntry = string | SlimLive

interface CompactGame {
  v: number
  c: SpielKontext
  d: number
  s: string
  p: number
  t: number
  o: PoolEntry[]
}

function toSlim(o: WaldObjekt): SlimLive {
  return {
    id: o.id,
    n: o.name,
    k: o.kategorie,
    e: o.emoji,
    ic: o.iconId,
    sw: o.schwierigkeit,
    i: [o.info.kurz, o.info.erkennen, o.info.wusstest_du],
    ...(o._taxonId != null ? { tx: o._taxonId } : {}),
    ...(o._media
      ? {
          m: {
            k: o._media.kind,
            ...(o._media.url ? { u: o._media.url } : {}),
            ...(o._media.attribution ? { a: o._media.attribution } : {}),
            ...(o._media.license ? { l: o._media.license } : {}),
            ...(o._media.source ? { s: o._media.source } : {}),
          },
        }
      : {}),
  }
}

function fromSlim(s: SlimLive): WaldObjekt {
  const media: ObjektMedia | undefined = s.m
    ? {
        kind: s.m.k,
        ...(s.m.u ? { url: s.m.u } : {}),
        ...(s.m.a ? { attribution: s.m.a } : {}),
        ...(s.m.l ? { license: s.m.l } : {}),
        ...(s.m.s ? { source: s.m.s } : {}),
      }
    : undefined
  // Kontext-Arrays werden für ein beigetretenes Spiel nicht mehr gebraucht
  // (die Karte ist fixiert) – mit sicheren Defaults rekonstruieren.
  return {
    id: s.id,
    name: s.n,
    kategorie: s.k,
    emoji: s.e,
    iconId: s.ic,
    jahreszeiten: [],
    wetter: [],
    tageszeit: [],
    habitat: [],
    regionen: ['DE-weit'],
    schwierigkeit: s.sw,
    gewicht: 1,
    info: { kurz: s.i[0], erkennen: s.i[1], wusstest_du: s.i[2] },
    _live: true,
    ...(s.tx != null ? { _taxonId: s.tx } : {}),
    ...(media ? { _media: media } : {}),
  }
}

// ── base64url (UTF-8-sicher, ohne Padding) ──────────────────────────────────
function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): string {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Kodiert ein Spiel kompakt (kuratiert ⇒ ID-Referenz) für Link/QR. */
export function encodeCompact(g: SharedGame): string {
  const compact: CompactGame = {
    v: g.v,
    c: g.ctx,
    d: g.diff,
    s: g.seedStr,
    p: g.players,
    t: g.createdAt,
    o: g.pool.map((o) => (o._live ? toSlim(o) : o.id)),
  }
  return b64urlEncode(JSON.stringify(compact))
}

/** Dekodiert einen kompakten Link-Payload zurück zu einem SharedGame. */
export function decodeCompact(payload: string): SharedGame {
  const compact = JSON.parse(b64urlDecode(payload)) as CompactGame
  if (!compact || !Array.isArray(compact.o)) throw new Error('Ungültige Einladung.')
  const byId = new Map(OBJEKTE.map((o) => [o.id, o]))
  const pool: WaldObjekt[] = compact.o.map((entry) => {
    if (typeof entry === 'string') {
      const o = byId.get(entry)
      if (!o) {
        throw new Error('Spiel passt nicht zu dieser App-Version. Bitte neu einladen.')
      }
      return o
    }
    return fromSlim(entry)
  })
  return {
    v: compact.v,
    pool,
    ctx: compact.c,
    diff: compact.d,
    seedStr: compact.s,
    players: compact.p,
    createdAt: compact.t,
  }
}

// ── Einladungs-URLs ─────────────────────────────────────────────────────────
/** Basis-URL der App (ohne Hash/Query), zum Bauen von Einladungen. */
function appBaseUrl(): string {
  const { origin, pathname } = window.location
  return origin + pathname
}

/** Selbst-enthaltener Link: das ganze Spiel steckt im Hash (#g=…). */
export function buildSelfContainedUrl(g: SharedGame): string {
  return `${appBaseUrl()}#g=${encodeCompact(g)}`
}

/** Kurzer Server-Link: nur der Code im Query (?j=CODE). */
export function buildCodeUrl(code: string): string {
  return `${appBaseUrl()}?j=${encodeURIComponent(code)}`
}

/** Liest einen Beitritts-Hinweis aus der aktuellen URL (Hash oder Query). */
export function parseJoinFromUrl(): { shared?: SharedGame; code?: string } | null {
  const hash = window.location.hash
  if (hash.startsWith('#g=')) {
    try {
      return { shared: decodeCompact(hash.slice(3)) }
    } catch {
      return null
    }
  }
  const code = new URLSearchParams(window.location.search).get('j')
  if (code) return { code: code.trim().toUpperCase() }
  return null
}

/** Entfernt Beitritts-Parameter aus der URL (nach erfolgreichem Join). */
export function clearJoinFromUrl(): void {
  const { origin, pathname } = window.location
  window.history.replaceState(null, '', origin + pathname)
}
