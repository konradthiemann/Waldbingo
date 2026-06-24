// Kuratierte Objekt-Datenbank – Quelle der Wahrheit ist build_data.py,
// das waldbingo-app/objects.json erzeugt + gegen das Schema validiert.
// Wir importieren genau diese Datei (kein Duplikat).
import data from '../../objects.json'
import type { WaldObjekt } from './types'

interface ObjectsFile {
  version: number
  count: number
  objekte: WaldObjekt[]
}

const file = data as unknown as ObjectsFile

/** Alle kuratierten Objekte (generischer Offline-Boden des Generators). */
export const OBJEKTE: WaldObjekt[] = file.objekte

export const OBJEKTE_VERSION = file.version
