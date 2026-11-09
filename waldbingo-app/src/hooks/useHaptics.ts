import { useCallback, useEffect, useRef, useState } from 'react'
import { loadSettings, saveSettings } from '../lib/db'
import { canVibrate, haptic, setHapticsEnabled } from '../lib/sfx'

/**
 * Vibration an/aus – persistiert in den Einstellungen (Settings.hapticsOn) und an
 * die Haptik-Engine (setHapticsEnabled) weitergereicht. Standard: an.
 * `available` ist false auf Geräten ohne Vibration (z. B. iPhone) und ohne
 * Touch-Bedienung (Desktop-Chrome kennt navigator.vibrate, vibriert aber nicht) –
 * dann zeigt die HUD keinen Schalter.
 */
export function useHaptics(): { hapticsOn: boolean; toggleHaptics: () => void; available: boolean } {
  const [hapticsOn, setOn] = useState(true)
  const current = useRef(true)
  const [available] = useState(hasVibrationMotor)

  // Gespeicherte Einstellung einmalig laden.
  useEffect(() => {
    let alive = true
    loadSettings()
      .then((s) => {
        if (!alive) return
        const on = s.hapticsOn ?? true
        current.current = on
        setOn(on)
        setHapticsEnabled(on)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const toggleHaptics = useCallback(() => {
    const next = !current.current
    current.current = next
    setOn(next)
    setHapticsEnabled(next)
    void saveSettings({ hapticsOn: next }).catch(() => undefined)
    // Kurzes Antippen als Bestätigung nur beim Einschalten.
    if (next) haptic('light')
  }, [])

  return { hapticsOn, toggleHaptics, available }
}

/** Vibrations-API vorhanden und Touch-Gerät (Handy/Tablet). */
function hasVibrationMotor(): boolean {
  if (!canVibrate() || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(any-pointer: coarse)').matches
}
