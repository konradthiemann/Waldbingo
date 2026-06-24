import type { GameState } from '../../lib/game-state'
import { HABITAT_LABEL, SEASON_LABEL, TIME_LABEL, WEATHER_LABEL } from '../../lib/labels'
import { MediaView } from '../game/MediaView'

interface Props {
  game: GameState
  withInfo: boolean
}

/** Bis zu 4 Bingo-Karten pro A4-Seite. */
const PER_PAGE = 4

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

/**
 * Druckansicht: pro A4-Seite max. 4 Karten (2×2). Jede Karte hat
 * `break-inside: avoid`, läuft also nie über den Seitenrand. Optional eine
 * Info-Begleitseite.
 */
export function PrintSheet({ game, withInfo }: Props) {
  const { ctx } = game
  const ctxLine = `${SEASON_LABEL[ctx.season]} · ${
    ctx.weather ? WEATHER_LABEL[ctx.weather] : '–'
  } · ${TIME_LABEL[ctx.time]} · ${HABITAT_LABEL[ctx.habitat]}`
  const pages = chunk(game.cards, PER_PAGE)

  return (
    <div className="text-ink">
      {pages.map((pageCards, pi) => (
        <div className="print-page" key={pi}>
          <div className={`print-cards ${pageCards.length === 1 ? 'cols-1' : 'cols-2'}`}>
            {pageCards.map((card, ci) => (
              <div className="print-card" key={ci}>
                <h3 className="print-card-title">Waldbingo – Spieler {pi * PER_PAGE + ci + 1}</h3>
                <p className="print-card-ctx">{ctxLine}</p>
                <div className="print-bingo">
                  {card.map((o, i) => (
                    <div className="print-cell" key={i}>
                      <span className="print-cell-img">
                        <MediaView o={o} />
                      </span>
                      <span className="print-cell-name">{o.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {withInfo && (
        <div className="print-page">
          <h3 className="print-card-title">Mehr Infos zu den Funden</h3>
          <p className="print-card-ctx">{ctxLine}</p>
          <div className="print-info">
            {game.pool.map((o, i) => (
              <div className="print-info-row" key={i}>
                <span className="print-info-img">
                  <MediaView o={o} />
                </span>
                <div className="print-info-tx">
                  <b>{o.name}:</b> {o.info.kurz} {o.info.wusstest_du}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
