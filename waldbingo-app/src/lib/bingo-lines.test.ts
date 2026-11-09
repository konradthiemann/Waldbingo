import { describe, expect, it } from 'vitest'
import { almostLines, BINGO_LINES, completeLines, isFullCard, lineEvent, lineStatus } from './bingo-lines'
import { checkBingo, mulberry32 } from './generator'

const set = (...xs: number[]) => new Set(xs)
const ALL = Array.from({ length: 25 }, (_, i) => i)

describe('BINGO_LINES', () => {
  it('enthält genau 12 Linien mit je 5 eindeutigen Feldern', () => {
    expect(BINGO_LINES).toHaveLength(12)
    for (const l of BINGO_LINES) {
      expect(new Set(l.cells).size).toBe(5)
      for (const i of l.cells) expect(i).toBeGreaterThanOrEqual(0)
      for (const i of l.cells) expect(i).toBeLessThan(25)
    }
    expect(new Set(BINGO_LINES.map((l) => l.id)).size).toBe(12)
  })

  it('kennt beide Diagonalen', () => {
    expect(BINGO_LINES.find((l) => l.id === 'diag-0')?.cells).toEqual([0, 6, 12, 18, 24])
    expect(BINGO_LINES.find((l) => l.id === 'diag-1')?.cells).toEqual([4, 8, 12, 16, 20])
  })
})

describe('completeLines', () => {
  it('erkennt Reihe, Spalte und Diagonale', () => {
    expect(completeLines(set(5, 6, 7, 8, 9)).map((l) => l.id)).toEqual(['row-1'])
    expect(completeLines(set(2, 7, 12, 17, 22)).map((l) => l.id)).toEqual(['col-2'])
    expect(completeLines(set(4, 8, 12, 16, 20)).map((l) => l.id)).toEqual(['diag-1'])
  })

  it('liefert bei voller Karte alle 12 Linien', () => {
    expect(completeLines(new Set(ALL))).toHaveLength(12)
  })

  it('stimmt mit generator.checkBingo überein (Zufallsstichprobe)', () => {
    const rng = mulberry32(4711)
    for (let n = 0; n < 2000; n++) {
      const found = new Set<number>()
      const k = Math.floor(rng() * 26)
      while (found.size < k) found.add(Math.floor(rng() * 25))
      expect(completeLines(found).length > 0).toBe(checkBingo(found))
    }
  })
})

describe('almostLines', () => {
  it('meldet 4 von 5 mit dem fehlenden Feld', () => {
    const a = almostLines(set(0, 1, 2, 3))
    expect(a.map((x) => [x.line.id, x.missing])).toEqual([['row-0', 4]])
  })

  it('ignoriert komplette Linien und Linien mit weniger als 4 Feldern', () => {
    expect(almostLines(set(0, 1, 2, 3, 4))).toEqual([])
    expect(almostLines(set(0, 1, 2))).toEqual([])
  })

  it('findet mehrere Linien gleichzeitig (Kreuzung)', () => {
    // Reihe 2 ohne Mitte + Spalte 2 ohne Mitte → beide fehlen Feld 12
    const a = almostLines(set(10, 11, 13, 14, 2, 7, 17, 22))
    expect(a.map((x) => x.line.id).sort()).toEqual(['col-2', 'row-2'])
    expect(new Set(a.map((x) => x.missing))).toEqual(set(12))
  })
})

describe('lineStatus', () => {
  it('sammelt goldene und „heiße“ Felder', () => {
    const s = lineStatus(set(0, 1, 2, 3, 4, 5, 10, 15))
    expect(s.complete.map((l) => l.id)).toEqual(['row-0'])
    expect([...s.goldenCells].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
    // Spalte 0 hat 0,5,10,15 → es fehlt 20
    expect(s.hotCells.has(20)).toBe(true)
  })
})

describe('isFullCard / lineEvent', () => {
  it('erkennt die volle Karte', () => {
    expect(isFullCard(new Set(ALL))).toBe(true)
    expect(isFullCard(new Set(ALL.slice(1)))).toBe(false)
  })

  it('priorisiert volle Karte > Bingo > fast > Fund', () => {
    expect(lineEvent(new Set(ALL.slice(1)), new Set(ALL))).toBe('full')
    expect(lineEvent(set(0, 1, 2, 3), set(0, 1, 2, 3, 4))).toBe('bingo')
    expect(lineEvent(set(0, 1, 2), set(0, 1, 2, 3))).toBe('almost')
    expect(lineEvent(set(0), set(0, 12))).toBe('found')
    expect(lineEvent(set(0, 12), set(0))).toBe('unfound')
    expect(lineEvent(set(0), set(0))).toBe('none')
  })

  it('meldet eine zusätzliche Bingo-Linie erneut als Bingo', () => {
    const before = set(0, 1, 2, 3, 4, 5, 10, 15)
    expect(lineEvent(before, new Set([...before, 20]))).toBe('bingo')
  })
})
