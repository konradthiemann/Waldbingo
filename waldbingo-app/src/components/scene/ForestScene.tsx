// Lebendige Waldszene hinter der App (Art Bible §7/§8): mehrschichtige
// Inline-SVG-Landschaft + EIN Partikel-Canvas, vollständig aus `SceneState`
// gesteuert. Farben laufen über die --sc-* CSS-Variablen und blenden beim
// Szenenwechsel weich über (scene.css registriert sie als <color>).
import { type CSSProperties, memo, useId, useMemo } from 'react'
import { type SceneState, sceneCssVars } from '../../lib/scene'
import { ParticleCanvas } from './ParticleCanvas'
import { sceneMixVars } from './scene-mixes'
import { defIds, SceneDefs } from './SceneDefs'
import { FarLayer, FogBand, FrameLeft, FrameRight, FrontLayer, GrassEdge, GrassFront, MidLayer } from './SceneLand'
import { SceneSky } from './SceneSky'
import './scene.css'

interface Props {
  scene: SceneState
  /**
   * Bewegung reduzieren (zusätzlich zu prefers-reduced-motion), z. B. wenn ein
   * Modal offen ist oder der Akku geschont werden soll.
   */
  calm?: boolean
  /**
   * Eingebettet statt vollflächig: `absolute` im nächsten positionierten
   * Eltern-Element statt `fixed` (z. B. für EINE Vorschau im Studio).
   * Setzt die Szenen-Farben dann auch lokal, damit die Vorschau eine andere
   * Szene zeigen kann als der Hintergrund.
   */
  contained?: boolean
}

/**
 * Vollflächiger, fixierter Hintergrund (z-index 0, pointer-events: none).
 * Liegt hinter `.app-screen`; die CSS-Variablen --sc-* setzt App.tsx am <html>,
 * die Szene setzt sie zusätzlich auf sich selbst (für Überblendung & Vorschau).
 */
export function ForestScene({ scene, calm = false, contained = false }: Props) {
  const uid = 'sc' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  // Grundfarben + vorberechnete Mischfarben (scene-mixes.ts) als CSS-Variablen.
  const vars = useMemo(
    () => ({ ...sceneCssVars(scene), ...sceneMixVars(scene.palette) }) as CSSProperties,
    [scene],
  )
  return (
    <div
      aria-hidden="true"
      data-scene={`${scene.season}-${scene.weather ?? 'unbekannt'}-${scene.time}`}
      className={`forest-scene no-print print:hidden pointer-events-none ${
        contained ? 'absolute' : 'fixed'
      } inset-0 z-0 overflow-hidden ${calm ? 'is-calm' : ''}`}
      style={vars}
    >
      <SceneArt uid={uid} scene={scene} />
      <ParticleCanvas scene={scene} calm={calm} />
      {/* Dunst-Schleier (Nebel, Regenstimmung) über allem */}
      <div className="sc-haze absolute inset-0" />
    </div>
  )
}

/** Statische Bildebenen – nur neu rendern, wenn sich die Szene ändert. */
const SceneArt = memo(function SceneArt({ uid, scene }: { uid: string; scene: SceneState }) {
  const ids = defIds(uid)
  return (
    <>
      <SceneDefs uid={uid} flags={{ foliage: scene.foliage, snowCover: scene.snowCover, frost: scene.frost }} />
      <SceneSky uid={uid} scene={scene} />
      <FarLayer ids={ids} scene={scene} />
      <FogBand scene={scene} top="50%" height="17%" strength={1.05} slow />
      <MidLayer ids={ids} scene={scene} />
      <FogBand scene={scene} top="64%" height="15%" strength={0.95} />
      <FrontLayer uid={uid} scene={scene} />
      <GrassEdge uid={uid} scene={scene} />
      <FrameLeft uid={uid} scene={scene} />
      <FrameRight uid={uid} scene={scene} />
      <GrassFront uid={uid} scene={scene} />
      <FogBand scene={scene} top="80%" height="18%" strength={0.7} slow />
    </>
  )
})
