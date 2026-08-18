import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          color: '#1d2a22',
          background: '#eaf1e8',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '1rem',
          }}
        >
          🌲
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#14331f',
            margin: '0 0 0.5rem',
          }}
        >
          Etwas ist schiefgelaufen
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#62716a',
            margin: '0 0 1.5rem',
            maxWidth: '320px',
          }}
        >
          Die App ist auf einen unerwarteten Fehler gestossen. Ein Neuladen behebt das meistens.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#fff',
            background: '#1f5b38',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(20,51,31,.06), 0 2px 8px rgba(20,51,31,.05)',
          }}
        >
          Neu laden
        </button>
      </div>
    )
  }
}
