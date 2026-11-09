import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FRIEND_MOODS, FRIEND_ORDER, Friend, PlayerAvatar, playerName } from './Friends'
import { WINGO_MOODS, Wingo, wingoGear } from './Wingo'
import { WingoSays } from './WingoSays'

/** Alle definierten IDs und alle url(#…)-Verweise einer Markup-Zeichenkette. */
function idsAndRefs(html: string) {
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])
  const refs = [...html.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1])
  return { ids, refs }
}

describe('Wingo', () => {
  it('rendert alle Stimmungen in allen Varianten mit gültigen Verweisen', () => {
    for (const mood of WINGO_MOODS) {
      for (const variant of ['full', 'peek', 'face'] as const) {
        for (const [season, weather, night] of [
          ['fruehling', 'klar', false],
          ['herbst', 'regen', false],
          ['winter', 'schnee', true],
          ['sommer', 'wind', false],
        ] as const) {
          const html = renderToStaticMarkup(
            <Wingo mood={mood} variant={variant} season={season} weather={weather} night={night} talking />,
          )
          const { ids, refs } = idsAndRefs(html)
          expect(new Set(ids).size, `${mood}/${variant}`).toBe(ids.length)
          for (const r of refs) expect(ids, `${mood}/${variant} → #${r}`).toContain(r)
        }
      }
    }
  })

  it('vergibt pro Instanz eindeutige IDs', () => {
    const html = renderToStaticMarkup(
      <>
        <Wingo mood="cheer" />
        <Wingo mood="cheer" />
        <Wingo variant="peek" night />
      </>,
    )
    const { ids } = idsAndRefs(html)
    expect(ids.length).toBeGreaterThan(6)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('setzt viewBox und Höhe je Variante', () => {
    expect(renderToStaticMarkup(<Wingo size={200} />)).toContain('viewBox="0 0 200 200"')
    const peek = renderToStaticMarkup(<Wingo size={200} variant="peek" />)
    expect(peek).toContain('viewBox="0 0 200 120"')
    expect(peek).toContain('height="120"')
  })

  it('ist standardmäßig ein benanntes Bild, mit leerem Titel dekorativ', () => {
    expect(renderToStaticMarkup(<Wingo />)).toMatch(/role="img"[^>]*aria-label="Wingo"/)
    const deco = renderToStaticMarkup(<Wingo title="" />)
    expect(deco).toContain('aria-hidden="true"')
    expect(deco).not.toContain('role="img"')
  })

  it('schaltet Animationen ab, wenn animated=false', () => {
    const html = renderToStaticMarkup(<Wingo animated={false} mood="wave" />)
    expect(html).toContain('wg-still')
    expect(html).not.toContain('wg-wave')
  })

  it('leitet Accessoires aus dem Kontext ab', () => {
    expect(wingoGear('herbst', 'regen', false)).toMatchObject({ hat: true, acorn: true, sprout: 'redLeaf', lantern: false })
    expect(wingoGear('herbst', 'klar', true)).toMatchObject({ acorn: false, lantern: true })
    expect(wingoGear('sommer', 'frost')).toMatchObject({ scarf: true, snowCaps: true })
    expect(wingoGear('winter', 'klar')).toMatchObject({ scarf: false, snowCaps: true, sprout: 'none' })
    expect(wingoGear('fruehling', 'regen')).toMatchObject({ hat: true, wreath: false, sprout: 'bloom' })
    expect(wingoGear('fruehling', 'klar')).toMatchObject({ wreath: true })
    expect(wingoGear('sommer', 'wind')).toMatchObject({ windy: true })
    expect(wingoGear()).toMatchObject({ hat: false, scarf: false, lantern: false, sprout: 'leaf' })
  })

  it('zeigt die Blatt-Flecken je Größe lesbar: klein höchstens 3 große, groß 5 mit Mittelader', () => {
    const spots = (html: string) => (html.match(/fill="#276d56"/g) ?? []).length
    const veins = (html: string) => (html.match(/stroke="#a6e2c2"/g) ?? []).length
    const small = renderToStaticMarkup(<Wingo size={48} animated={false} />)
    expect(spots(small)).toBeLessThanOrEqual(3)
    expect(spots(renderToStaticMarkup(<Wingo size={40} variant="face" animated={false} />))).toBeLessThanOrEqual(3)
    const big = renderToStaticMarkup(<Wingo size={260} animated={false} />)
    expect(spots(big)).toBe(5)
    expect(veins(big)).toBe(5)
  })

  it('zeichnet die Zotteln als runde Bögen (keine spitzen Zacken)', () => {
    const html = renderToStaticMarkup(<Wingo size={200} animated={false} />)
    // Scheitel-Büschel: drei Halbkreis-Bögen hintereinander
    expect(html).toMatch(/d="M80 54Q[^"]*A[^"]*A[^"]*A[^"]*Z"/)
  })
})

describe('Waldfreunde & Avatare', () => {
  it('rendert alle Freunde in allen Stimmungen und Ausschnitten', () => {
    for (const id of FRIEND_ORDER) {
      for (const mood of FRIEND_MOODS) {
        for (const framing of ['full', 'face'] as const) {
          const html = renderToStaticMarkup(<Friend id={id} mood={mood} framing={framing} />)
          const { ids, refs } = idsAndRefs(html)
          expect(new Set(ids).size).toBe(ids.length)
          for (const r of refs) expect(ids).toContain(r)
        }
      }
    }
  })

  it('benennt Spieler zyklisch mit Runden-Zähler', () => {
    expect([0, 1, 2, 3, 4].map(playerName)).toEqual(['Olli', 'Flitz', 'Stupsi', 'Pilzi', 'Fine'])
    expect(playerName(5)).toBe('Olli 2')
    expect(playerName(9)).toBe('Fine 2')
  })

  it('zeigt ab der zweiten Runde eine Nummer am Avatar', () => {
    expect(renderToStaticMarkup(<PlayerAvatar index={0} />)).not.toMatch(/>2</)
    expect(renderToStaticMarkup(<PlayerAvatar index={6} />)).toMatch(/>2</)
  })
})

describe('WingoSays', () => {
  it('zeigt Text in einer Sprechblase neben dekorativem Wingo', () => {
    const html = renderToStaticMarkup(<WingoSays>Hallo Wald!</WingoSays>)
    expect(html).toContain('Hallo Wald!')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-hidden="true"')
  })
})
