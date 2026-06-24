// Mapping Objekt-Emoji → OpenMoji-SVG (offline gebündelt unter public/emoji).
// OpenMoji (https://openmoji.org), CC BY-SA 4.0 – Namensnennung im Impressum.
import { OPENMOJI_CODES } from '../data/openmoji-codes'

/** Emoji → OpenMoji-Dateicode (Hex-Codepoints, ohne Variation Selector FE0F). */
export function emojiCode(emoji: string): string {
  return [...emoji]
    .map((c) => c.codePointAt(0) ?? 0)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16).toUpperCase())
    .join('-')
}

/** Pfad zur OpenMoji-Grafik – oder null, wenn keine vorhanden ist. */
export function openMojiSrc(emoji: string): string | null {
  if (!emoji) return null
  const code = emojiCode(emoji)
  if (!OPENMOJI_CODES.has(code)) return null
  return `${import.meta.env.BASE_URL}emoji/${code}.svg`
}
