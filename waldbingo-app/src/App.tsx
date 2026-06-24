import { useEffect, useState } from 'react'
import { Glyph } from './components/Svg'
import { Dashboard } from './components/dashboard/Dashboard'
import { GameView } from './components/game/GameView'
import { PrintSheet } from './components/print/PrintSheet'
import { useOnline } from './hooks/useOnline'
import { clearGame, loadGame } from './lib/db'
import { fromStored, type GameState } from './lib/game-state'

export default function App() {
  const online = useOnline()
  const [game, setGame] = useState<GameState | null>(null)
  const [printWithInfo, setPrintWithInfo] = useState<boolean | null>(null)

  // Aktives Spiel beim Start wiederherstellen.
  useEffect(() => {
    void loadGame().then((g) => {
      if (g) setGame(fromStored(g))
    })
  }, [])

  // Drucken erst nach dem Render der Druckansicht auslösen.
  useEffect(() => {
    if (printWithInfo === null) return
    const t = setTimeout(() => {
      window.print()
      setPrintWithInfo(null)
    }, 60)
    return () => clearTimeout(t)
  }, [printWithInfo])

  async function exitGame() {
    await clearGame()
    setGame(null)
  }

  return (
    <>
      <div className="app-screen">
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-gradient-to-br from-forest-700 to-forest-900 px-4 py-3 text-white shadow-[0_4px_18px_rgba(20,51,31,0.28)]">
          <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[13px] bg-gradient-to-br from-forest-500 to-forest-700 shadow-wb1 ring-1 ring-inset ring-white/25">
            <Glyph name="leaf" className="block h-[26px] w-[26px]" />
          </div>
          <div>
            <h1 className="text-[21px] font-extrabold leading-none">Waldbingo</h1>
            <div className="mt-0.5 text-[11.5px] font-medium opacity-80">
              Such-Spiel für den Wald · offline-fähig
            </div>
          </div>
          {!online && (
            <div className="ml-auto whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-semibold backdrop-blur">
              offline
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[920px] px-3 pb-12 pt-[18px] sm:px-4">
          {!online && (
            <div className="mb-4 rounded-lg border border-amber/40 bg-[#fff7e6] px-4 py-2.5 text-[13px] text-amber-600">
              Offline-Modus: Karte &amp; neue Arten brauchen Netz – erstellte Spiele bleiben voll
              spielbar.
            </div>
          )}

          {game ? (
            <GameView
              key={game.createdAt}
              game={game}
              onExit={exitGame}
              onPrint={(withInfo) => setPrintWithInfo(withInfo)}
            />
          ) : (
            <Dashboard online={online} onStart={setGame} />
          )}

          <footer className="mt-10 text-balance text-center text-[11px] leading-relaxed text-muted">
            Symbole:{' '}
            <a className="underline" href="https://openmoji.org" target="_blank" rel="noreferrer">
              OpenMoji
            </a>{' '}
            (CC BY-SA 4.0) · Arten &amp; Fotos: iNaturalist · Karte: © OpenStreetMap · Wetter:
            Open-Meteo
          </footer>
        </main>
      </div>

      {printWithInfo !== null && game && (
        <div className="print-only">
          <PrintSheet game={game} withInfo={printWithInfo} />
        </div>
      )}
    </>
  )
}
