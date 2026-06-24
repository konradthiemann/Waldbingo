/**
 * sync-docs.mjs
 *
 * Spiegelt die frontmatter-freien Quell-Markdown-Dateien aus `docs/` (Repo-Root)
 * nach `src/content/docs/`, damit Astro Starlight sie ausliefern kann.
 *
 * Pro Datei:
 *   - extrahiert die erste `# H1` als `title` (Fallback: Dateiname ohne `.md`),
 *   - entfernt diese H1-Zeile (+ folgende Leerzeile) aus dem Body,
 *   - schreibt relative `.md`-Querverweise auf die finalen Starlight-Routen um
 *     (z. B. `./konzept.md` → `/Waldbingo/konzept/`), damit die in der Quelle
 *     GitHub-/KI-tauglichen `.md`-Links auch in der gerenderten Site funktionieren,
 *   - stellt ein minimales YAML-Frontmatter (`title`) voran,
 *   - benennt `README.md` → `index.md` (Landing-Page).
 *
 * Es werden NUR Top-Level-`.md`-Dateien verarbeitet; Unterordner werden
 * übersprungen (interne Notizen werden so nicht veröffentlicht).
 *
 * Single Source of Truth bleibt `docs/*.md` — `src/content/docs/` ist generiert
 * und gitignored (keine doppelte Pflege).
 */
import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// scripts/ → docs-site/ → Repo-Root
const repoRoot = path.resolve(scriptDir, '..', '..');
const SRC_DIR = path.join(repoRoot, 'docs');
const OUT_DIR = path.resolve(scriptDir, '..', 'src', 'content', 'docs');

// MUSS mit `base` in astro.config.mjs übereinstimmen. Wird genutzt, um relative
// `.md`-Querverweise auf die finalen GitHub-Pages-Routen umzuschreiben.
const BASE = '/Waldbingo/';

/**
 * Extrahiert die erste `# H1` aus dem Markdown-Body und gibt Title + bereinigten
 * Body zurück. Die H1-Zeile und eine unmittelbar folgende Leerzeile werden entfernt.
 * @param {string} raw
 * @param {string} fallbackTitle
 * @returns {{ title: string, body: string }}
 */
function extractTitle(raw, fallbackTitle) {
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = /^#\s+(.+?)\s*$/.exec(lines[i]);
    if (match) {
      const title = match[1].trim();
      // H1-Zeile entfernen ...
      lines.splice(i, 1);
      // ... plus eine unmittelbar folgende Leerzeile, falls vorhanden.
      if (lines[i] !== undefined && lines[i].trim() === '') {
        lines.splice(i, 1);
      }
      return { title, body: lines.join('\n') };
    }
  }
  return { title: fallbackTitle, body: raw };
}

/**
 * Escaped einen Title für die Verwendung in einem doppelt gequoteten YAML-String.
 * @param {string} value
 * @returns {string}
 */
function escapeYaml(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Schreibt relative `.md`-Querverweise (`./konzept.md`, `datenmodell.md#feld`) auf
 * die finalen Starlight-Routen um (`/Waldbingo/konzept/`, `/Waldbingo/datenmodell/#feld`).
 * `README.md` → Landing-Page (`BASE`). Externe URLs (http(s), Pfade mit `/`) und
 * Parent-Verweise (`../`) bleiben unangetastet.
 * @param {string} body
 * @returns {string}
 */
function rewriteLinks(body) {
  return body.replace(
    /\]\((?:\.\/)?([A-Za-z0-9_-]+)\.md(#[A-Za-z0-9_-]+)?\)/g,
    (_match, name, anchor = '') => {
      const lower = name.toLowerCase();
      const slug = lower === 'readme' ? '' : `${lower}/`;
      return `](${BASE}${slug}${anchor})`;
    }
  );
}

async function main() {
  // Quelle prüfen.
  let entries;
  try {
    entries = await readdir(SRC_DIR, { withFileTypes: true });
  } catch (err) {
    console.error(`[sync-docs] Quellverzeichnis nicht gefunden: ${SRC_DIR}`);
    throw err;
  }

  // Ziel komplett leeren und neu anlegen.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

  if (mdFiles.length === 0) {
    console.error(`[sync-docs] Keine Top-Level-.md-Dateien in ${SRC_DIR} gefunden.`);
    process.exit(1);
  }

  const summary = [];
  for (const fileName of mdFiles) {
    const raw = await readFile(path.join(SRC_DIR, fileName), 'utf8');
    const baseName = fileName.replace(/\.md$/i, '');
    const { title, body } = extractTitle(raw, baseName);

    // README.md → index.md (Landing-Page), sonst Dateiname lowercased beibehalten.
    const outName =
      baseName.toLowerCase() === 'readme' ? 'index.md' : `${baseName.toLowerCase()}.md`;

    const frontmatter = `---\ntitle: "${escapeYaml(title)}"\n---\n`;
    // Querverweise umschreiben, dann Body ohne führende Leerzeilen anhängen.
    const content = `${frontmatter}\n${rewriteLinks(body).replace(/^\n+/, '')}`;

    await writeFile(path.join(OUT_DIR, outName), content, 'utf8');
    summary.push({ from: fileName, to: outName, title });
  }

  console.log(`[sync-docs] ${summary.length} Datei(en) synchronisiert nach ${OUT_DIR}:`);
  for (const item of summary) {
    console.log(`  • ${item.from} → ${item.to}  (title: "${item.title}")`);
  }
}

main().catch((err) => {
  console.error('[sync-docs] Fehlgeschlagen:', err);
  process.exit(1);
});
