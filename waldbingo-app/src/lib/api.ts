// Client für den Einladungs-Code-Server (kleiner Express-Dienst, gleiche Origin).
// Best-effort: schlägt der Server fehl (offline, nicht deployed), fällt die App
// auf den selbst-enthaltenen Link/QR zurück – das Erstellen bleibt möglich.
import type { SharedGame } from './share'

const API_BASE = '/api'
const TIMEOUT_MS = 8000

async function withTimeout(input: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Lädt ein Spiel auf den Server und gibt den kurzen Einladungs-Code zurück. */
export async function uploadGame(game: SharedGame): Promise<string> {
  const r = await withTimeout(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game }),
  })
  if (!r.ok) throw new Error(`Server-Fehler (${r.status})`)
  const j = (await r.json()) as { code?: string }
  if (!j.code) throw new Error('Server lieferte keinen Code.')
  return j.code
}

/** Holt ein Spiel per Einladungs-Code vom Server. */
export async function fetchGameByCode(code: string): Promise<SharedGame> {
  const clean = code.trim().toUpperCase()
  const r = await withTimeout(`${API_BASE}/games/${encodeURIComponent(clean)}`, { method: 'GET' })
  if (r.status === 404) throw new Error('Kein Spiel mit diesem Code gefunden.')
  if (!r.ok) throw new Error(`Server-Fehler (${r.status})`)
  const j = (await r.json()) as { game?: SharedGame }
  if (!j.game) throw new Error('Ungültige Server-Antwort.')
  return j.game
}
