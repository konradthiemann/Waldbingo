import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
// Self-hosted Webfonts (offline im Precache): Fredoka = Display, Nunito = Text.
import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
