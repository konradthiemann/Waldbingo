// Waldbingo-Server: liefert die statische PWA UND einen winzigen Einladungs-API.
//
// Ein einziger Dienst (eine Railway-Service):
//   - statisches `dist/` (App-Shell)
//   - POST /api/games        -> speichert ein geteiltes Spiel, gibt kurzen Code
//   - GET  /api/games/:code  -> liefert ein gespeichertes Spiel
//
// Persistenz: schlichte JSON-Dateien (eine pro Code) mit TTL. Keine native
// Abhängigkeit. Für dauerhaften Bestand über Neustarts auf Railway ein Volume
// mounten und DATA_DIR auf den Mount-Pfad setzen.
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PORT) || 8787
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'games-data')
const DIST_DIR = path.join(__dirname, '..', 'dist')
const TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 Tage
const MAX_POOL = 60
// Verwechslungsfreies Alphabet (kein 0/O/1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LEN = 6

fs.mkdirSync(DATA_DIR, { recursive: true })

function fileFor(code) {
  return path.join(DATA_DIR, `${code}.json`)
}

function randomCode() {
  let c = ''
  for (let i = 0; i < CODE_LEN; i++) {
    c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return c
}

function freshCode() {
  for (let tries = 0; tries < 12; tries++) {
    const c = randomCode()
    if (!fs.existsSync(fileFor(c))) return c
  }
  // Extrem unwahrscheinlich – mit Zeitstempel-Suffix erzwingen.
  return randomCode() + ALPHABET[Date.now() % ALPHABET.length]
}

/** Minimale Plausibilitätsprüfung eines geteilten Spiels. */
function validGame(g) {
  if (!g || typeof g !== 'object') return false
  if (!Array.isArray(g.pool) || g.pool.length === 0 || g.pool.length > MAX_POOL) return false
  if (typeof g.seedStr !== 'string' || !g.seedStr) return false
  if (typeof g.players !== 'number' || g.players < 1 || g.players > 10) return false
  if (!g.ctx || typeof g.ctx !== 'object') return false
  return true
}

/** Abgelaufene Spiele aufräumen (Best-effort). */
function sweep() {
  let removed = 0
  try {
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (!f.endsWith('.json')) continue
      const full = path.join(DATA_DIR, f)
      try {
        const rec = JSON.parse(fs.readFileSync(full, 'utf8'))
        if (!rec.createdAt || Date.now() - rec.createdAt > TTL_MS) {
          fs.unlinkSync(full)
          removed++
        }
      } catch {
        fs.unlinkSync(full) // unlesbar -> entfernen
        removed++
      }
    }
  } catch {
    /* DATA_DIR evtl. noch leer */
  }
  return removed
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '512kb' }))

// ── API ─────────────────────────────────────────────────────────────────────
app.post('/api/games', (req, res) => {
  const game = req.body && req.body.game
  if (!validGame(game)) {
    return res.status(400).json({ error: 'invalid_game' })
  }
  const code = freshCode()
  try {
    fs.writeFileSync(fileFor(code), JSON.stringify({ game, createdAt: Date.now() }))
  } catch {
    return res.status(500).json({ error: 'store_failed' })
  }
  res.json({ code })
})

app.get('/api/games/:code', (req, res) => {
  const code = String(req.params.code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  if (code.length < CODE_LEN || code.length > CODE_LEN + 1) {
    return res.status(404).json({ error: 'not_found' })
  }
  const full = fileFor(code)
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'not_found' })
  try {
    const rec = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (!rec.createdAt || Date.now() - rec.createdAt > TTL_MS) {
      fs.unlinkSync(full)
      return res.status(404).json({ error: 'expired' })
    }
    res.json({ game: rec.game })
  } catch {
    res.status(404).json({ error: 'not_found' })
  }
})

// ── Statische PWA + SPA-Fallback ──────────────────────────────────────────────
const hasDist = fs.existsSync(path.join(DIST_DIR, 'index.html'))
if (hasDist) {
  app.use(express.static(DIST_DIR, { index: false }))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

// Übrig gebliebene /api-Pfade sauber als 404 JSON beantworten.
app.use((req, res) => res.status(404).json({ error: 'not_found' }))

sweep()
setInterval(sweep, 1000 * 60 * 60 * 6).unref() // alle 6 h aufräumen

app.listen(PORT, () => {
  console.log(`Waldbingo-Server läuft auf Port ${PORT} (Daten: ${DATA_DIR}, dist: ${hasDist ? 'ja' : 'fehlt'})`)
})
