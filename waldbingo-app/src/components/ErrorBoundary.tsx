import { Component, type ErrorInfo, type ReactNode } from 'react'
import { wingoLine } from '../lib/wingo-lines'
import { Wingo } from './characters/Wingo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Spruch für die Fehlerseite – darf selbst nie werfen. */
function safeLine(): string {
  try {
    return wingoLine('error')
  } catch {
    return 'Hoppla, da ist etwas schiefgegangen.'
  }
}

/**
 * Fängt Abstürze der App ab und zeigt eine freundliche Fehlerseite mit
 * traurigem Wingo. Bewusst robust: nur Inline-Styles (falls CSS fehlt) und die
 * Figur in einer eigenen Mini-Grenze – stürzt sie ab, bleibt der Rest stehen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Waldbingo Crash:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px 16px',
          fontFamily: "'Nunito Variable', Nunito, system-ui, sans-serif",
          textAlign: 'center',
          color: '#1d2a22',
          background: 'linear-gradient(180deg, #8fc9ef 0%, #d4eefc 55%, #9fd67a 55%, #6dbb5a 100%)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            background: '#fff8ec',
            border: '2px solid #ead8b8',
            borderRadius: 32,
            padding: '22px 20px 24px',
            boxShadow: '0 10px 30px rgba(15,38,23,.22), 0 2px 6px rgba(15,38,23,.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
            <SafeFigure>
              <Wingo mood="sad" size={150} animated={false} title="Wingo ist traurig" />
            </SafeFigure>
          </div>
          <h1
            style={{
              fontFamily: "'Fredoka Variable', Fredoka, system-ui, sans-serif",
              fontSize: 24,
              fontWeight: 600,
              color: '#14331f',
              margin: '8px 0 6px',
            }}
          >
            {safeLine()}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.45, color: '#62716a', margin: '0 0 20px' }}>
            Die App ist auf einen unerwarteten Fehler gestoßen. Neu laden behebt das meistens – dein
            Spielstand bleibt gespeichert.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              height: 56,
              fontFamily: "'Fredoka Variable', Fredoka, system-ui, sans-serif",
              fontSize: 19,
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(180deg, #5fb87c, #2f7d4f)',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              textShadow: '0 1.5px 0 rgba(15,38,23,.35)',
              boxShadow: '0 5px 0 #1f5b38, 0 9px 18px rgba(15,38,23,.28)',
            }}
          >
            Neu laden
          </button>
        </div>
      </div>
    )
  }
}

/** Mini-Fehlergrenze: rendert bei einem Fehler der Figur einfach nichts. */
class SafeFigure extends Component<{ children: ReactNode }, { failed: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}
