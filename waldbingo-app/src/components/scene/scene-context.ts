// Aktuelle Hintergrund-Szene als React-Context. App.tsx stellt sie bereit
// (`<SceneProvider value={scene}>`), Figuren lesen daraus z. B. das Tageslicht
// (Wingos Laterne in der Dämmerung und an dunklen Abenden) – ohne dass jeder
// Aufrufer dafür neue Props durchreichen muss. Overlays per Portal liegen
// ebenfalls im React-Baum und sehen den Context.
import { createContext, useContext } from 'react'
import type { SceneState } from '../../lib/scene'

const SceneContext = createContext<SceneState | null>(null)
SceneContext.displayName = 'SceneContext'

/** Stellt die aktuell sichtbare Szene bereit (App-Rahmen). */
export const SceneProvider = SceneContext.Provider

/** Aktuelle Szene – oder null außerhalb des Providers (Fehlerseite, Tests, Einzel-Render). */
export function useCurrentScene(): SceneState | null {
  return useContext(SceneContext)
}
