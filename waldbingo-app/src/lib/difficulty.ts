// Häufigkeit (iNaturalist observation count) → Schwierigkeit (1 häufig .. 3 selten).
// Perzentilbasiert relativ zur Verteilung innerhalb einer Artengruppe, damit die
// Einstufung robust gegen Großstadt-Park vs. abgelegenes Mittelgebirge ist.
import type { Schwierigkeit } from '../data/types'

/** Arten mit weniger Beobachtungen werden als Zufallsfund verworfen. */
export const MIN_COUNT = 5

function quantile(sortedAsc: number[], p: number): number {
  if (!sortedAsc.length) return 0
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.round((p / 100) * (sortedAsc.length - 1))))
  return sortedAsc[idx]
}

/**
 * Liefert eine Funktion count → Schwierigkeit, kalibriert auf die übergebenen
 * counts (eine Artengruppe). Obere ~1/3 = leicht, untere ~1/3 = schwer.
 */
export function difficultyClassifier(counts: number[]): (count: number) => Schwierigkeit {
  const sorted = [...counts].sort((a, b) => a - b)
  const p33 = quantile(sorted, 33)
  const p66 = quantile(sorted, 66)
  return (count: number): Schwierigkeit => {
    if (count >= p66) return 1
    if (count >= p33) return 2
    return 3
  }
}

/** Welche Art-Schwierigkeiten passen zum gewählten Spielmodus? */
export function bandForMode(diff: number): Set<Schwierigkeit> {
  if (diff === 2) return new Set<Schwierigkeit>([1, 2]) // mittel: häufige, realistisch findbare
  if (diff === 3) return new Set<Schwierigkeit>([1, 2, 3]) // schwer: alle (reine Foto-Karte füllen)
  return new Set<Schwierigkeit>() // leicht: keine Live-Arten
}
