// React-Hülle um die Partikel-Engine: Größe folgt dem Eltern-Element
// (fixiert oder eingebettet), rAF pausiert bei verstecktem Tab,
// reduzierte Bewegung oder `calm` (offener Dialog, Feier) → einmaliges Standbild.
// Der Loop meldet seine Bildabstände an den Sparmodus (perf-mode.ts); im
// Sparmodus zeichnet er nur das halbe Partikel-Budget.
import { useEffect, useMemo, useRef } from 'react'
import type { SceneState } from '../../lib/scene'
import { type ParticleColors, ParticleEngine } from './particles'
import { LITE_PARTICLES, noteSteadyFrame, useFxLevel } from './perf-mode'

const REDUCED = '(prefers-reduced-motion: reduce)'

export function ParticleCanvas({ scene, calm, measure = true }: { scene: SceneState; calm: boolean; measure?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const lite = useFxLevel() === 'lite'
  const measureRef = useRef(measure)
  measureRef.current = measure
  const engine = useRef<ParticleEngine | null>(null)
  const calmRef = useRef(calm)
  const runRef = useRef<() => void>(() => {})

  // Blatt-/Blütenfarben aus der Palette (Herbst: orange/rot/gelb, Sommerwind: grün).
  const colors = useMemo<ParticleColors>(() => {
    const p = scene.palette
    return {
      leaves:
        scene.foliage === 'herbstlaub'
          ? [p.foliage, p.foliageAccent, p.flower, p.foliage]
          : scene.foliage === 'kahl'
            ? ['#a8876a', '#8f6d52']
            : [p.foliage, p.foliageAccent],
      petals: scene.isNight ? ['#d9a9bd', '#c99aae'] : ['#ffc4d8', '#ffe1ea', '#ffb0c8'],
    }
  }, [scene])

  // Engine einmal anlegen; Größe, Sichtbarkeit und Bewegungswunsch beobachten.
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const eng = new ParticleEngine(canvas)
    // Nur die vollflächige Szene misst (eingebettete Studio-Vorschauen nicht).
    eng.onFrame = (dt) => {
      if (measureRef.current) noteSteadyFrame(dt)
    }
    engine.current = eng
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED) : null

    // Unter Dialogen/Feiern (calm) liegt ein Weichzeichner über der Szene –
    // dort keinen rAF-Loop weiterlaufen lassen, nur ein Standbild zeigen.
    const run = () => {
      if (mq?.matches || calmRef.current) eng.drawStatic()
      else if (document.hidden) eng.stop()
      else eng.start()
    }
    const measure = () => {
      const box = canvas.parentElement?.getBoundingClientRect()
      if (box) eng.resize(box.width, box.height, window.devicePixelRatio)
    }
    runRef.current = run
    measure()

    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement)
    else window.addEventListener('resize', measure)
    document.addEventListener('visibilitychange', run)
    mq?.addEventListener?.('change', run)
    run()

    return () => {
      eng.stop()
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', run)
      mq?.removeEventListener?.('change', run)
      engine.current = null
    }
  }, [])

  useEffect(() => {
    calmRef.current = calm
    engine.current?.setScene(scene, colors, calm, lite ? LITE_PARTICLES : 1)
    runRef.current()
  }, [scene, colors, calm, lite])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
