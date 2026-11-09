import { useCallback, useEffect, useRef, useState } from 'react'
import { loadSettings, saveSettings } from '../lib/db'
import { playSfx, setSoundEnabled } from '../lib/sfx'

/**
 * Ton an/aus – persistiert in den Einstellungen (Settings.soundOn) und an die
 * Klang-Engine (setSoundEnabled) weitergereicht. Standard: an.
 */
export function useSound(): { soundOn: boolean; toggleSound: () => void } {
  const [soundOn, setSoundOn] = useState(true)
  const current = useRef(true)

  // Gespeicherte Einstellung einmalig laden.
  useEffect(() => {
    let alive = true
    loadSettings()
      .then((s) => {
        if (!alive) return
        const on = s.soundOn ?? true
        current.current = on
        setSoundOn(on)
        setSoundEnabled(on)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const toggleSound = useCallback(() => {
    const next = !current.current
    current.current = next
    setSoundOn(next)
    setSoundEnabled(next)
    void saveSettings({ soundOn: next }).catch(() => undefined)
    // Kurzer Bestätigungs-Klick nur beim Einschalten (beim Ausschalten ist es stumm).
    if (next) playSfx('tap')
  }, [])

  return { soundOn, toggleSound }
}
