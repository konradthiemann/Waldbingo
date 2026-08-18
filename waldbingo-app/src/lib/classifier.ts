// Client-side Artenbestimmung mit TensorFlow.js MobileNet.
// Das Modell wird beim ersten Aufruf geladen und im Speicher gehalten.
// Klassifiziert Kamera-Fotos und liefert Waldbingo-kompatible Treffer.
import type { Kategorie } from '../data/types'

/** Ein einzelner Klassifizierungstreffer. */
export interface ClassifyResult {
  /** ImageNet-Klassenname (englisch). */
  className: string
  /** Konfidenz (0–1). */
  probability: number
  /** Gemappte Waldbingo-Kategorie (oder null wenn kein Match). */
  kategorie: Kategorie | null
  /** Passende Waldbingo-Suchbegriffe (deutsch). */
  matchLabels: string[]
}

// ── ImageNet → Waldbingo-Kategorie-Mapping ──────────────────────────────────
// MobileNet kennt ~1000 ImageNet-Klassen. Wir mappen relevante Klassen auf
// unsere Kategorien. Die Suche ist case-insensitive und substring-basiert.
interface MappingRule {
  /** Substring(s) im ImageNet-Klassennamen (lowercase). */
  patterns: string[]
  kategorie: Kategorie
  /** Deutsche Labels fuer die UI. */
  labels: string[]
}

const MAPPINGS: MappingRule[] = [
  // Pilze
  { patterns: ['mushroom', 'fungus', 'agaric', 'bolete', 'stinkhorn', 'coral fungus'], kategorie: 'Pilz', labels: ['Pilz'] },
  // Voegel
  { patterns: ['bird', 'robin', 'jay', 'magpie', 'cock', 'hen', 'owl', 'eagle', 'hawk', 'vulture', 'crane', 'heron', 'flamingo', 'pelican', 'albatross', 'warbler', 'finch', 'sparrow', 'chickadee', 'junco', 'brambling', 'goldfinch', 'house finch', 'indigo bunting', 'bulbul', 'coucal', 'bee eater', 'hornbill', 'hummingbird', 'jacamar', 'toucan', 'drake', 'goose', 'black swan', 'lorikeet', 'macaw', 'sulphur-crested cockatoo', 'african grey', 'quail', 'partridge', 'ptarmigan', 'ruffed grouse', 'prairie chicken', 'peacock', 'quetzal', 'ostrich', 'kite', 'bald eagle', 'great grey owl', 'european fire salamander', 'bittern', 'black stork', 'spoonbill', 'bustard', 'limpkin', 'american coot', 'water ouzel', 'red-backed sandpiper', 'redshank', 'dowitcher', 'oystercatcher', 'king penguin', 'woodpecker'], kategorie: 'Vogel', labels: ['Vogel'] },
  // Insekten
  { patterns: ['insect', 'beetle', 'ladybug', 'ladybird', 'ant', 'bee', 'wasp', 'fly', 'butterfly', 'moth', 'dragonfly', 'damselfly', 'cricket', 'grasshopper', 'cockroach', 'mantis', 'cicada', 'leafhopper', 'lacewing', 'walking stick', 'stick insect', 'cabbage butterfly', 'monarch', 'ringlet', 'sulphur butterfly', 'lycaenid', 'admiral', 'buckeye', 'leaf beetle', 'long-horned beetle', 'ground beetle', 'tiger beetle', 'weevil', 'dung beetle'], kategorie: 'Insekt', labels: ['Insekt'] },
  // Tiere (Saeugetiere, Amphibien, Reptilien)
  { patterns: ['fox', 'deer', 'hare', 'rabbit', 'squirrel', 'hedgehog', 'badger', 'boar', 'wolf', 'mouse', 'rat', 'hamster', 'beaver', 'otter', 'mink', 'weasel', 'polecat', 'marmot', 'porcupine', 'frog', 'toad', 'tree frog', 'newt', 'salamander', 'snake', 'lizard', 'chameleon', 'gecko', 'iguana', 'snail', 'slug', 'earthworm', 'spider', 'tick', 'scorpion', 'chipmunk'], kategorie: 'Tier', labels: ['Tier'] },
  // Baeume / Pflanzen
  { patterns: ['tree', 'oak', 'pine', 'fir', 'spruce', 'larch', 'beech', 'birch', 'maple', 'willow', 'palm', 'cypress', 'acorn'], kategorie: 'Baum', labels: ['Baum'] },
  { patterns: ['flower', 'daisy', 'dandelion', 'sunflower', 'rose', 'tulip', 'lily', 'poppy', 'orchid', 'iris', 'pot', 'plant', 'fern', 'moss', 'lichen', 'leaf', 'clover', 'herb', 'grass', 'hay', 'straw', 'corn', 'broccoli', 'cauliflower', 'mushroom'], kategorie: 'Pflanze', labels: ['Pflanze'] },
  // Spuren
  { patterns: ['web', 'spider web', 'cobweb', 'nest', 'feather', 'bone', 'shell', 'burrow', 'track', 'footprint', 'paw'], kategorie: 'Spur', labels: ['Spur'] },
  // Landschaft
  { patterns: ['cliff', 'valley', 'mountain', 'volcano', 'lakeside', 'seashore', 'promontory', 'sandbar', 'coral reef', 'geyser', 'rock', 'stone', 'boulder', 'bridge', 'dam', 'fountain', 'pond', 'lake', 'river', 'waterfall', 'stream', 'bench', 'park bench', 'stump', 'log', 'fence', 'picket fence', 'trail', 'path'], kategorie: 'Landschaft', labels: ['Landschaft'] },
]

/** Mappt einen ImageNet-Klassennamen auf eine Waldbingo-Kategorie. */
function mapToKategorie(className: string): { kategorie: Kategorie; labels: string[] } | null {
  const lower = className.toLowerCase()
  for (const rule of MAPPINGS) {
    for (const pattern of rule.patterns) {
      if (lower.includes(pattern)) {
        return { kategorie: rule.kategorie, labels: rule.labels }
      }
    }
  }
  return null
}

// ── Modell-Singleton ────────────────────────────────────────────────────────
type MobileNetModel = {
  classify: (img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, topk?: number) => Promise<Array<{ className: string; probability: number }>>
}

let modelPromise: Promise<MobileNetModel> | null = null
let loadError: string | null = null

/** Ob das Modell gerade geladen wird. */
export function isModelLoading(): boolean {
  return modelPromise !== null && !loadError
}

/** Laedt das MobileNet-Modell (einmalig, danach gecacht). */
export async function loadModel(): Promise<MobileNetModel> {
  if (loadError) throw new Error(loadError)
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const mobilenet = await import('@tensorflow-models/mobilenet')
        await import('@tensorflow/tfjs')
        const model = await mobilenet.load({ version: 2, alpha: 1.0 })
        return model
      } catch (e) {
        loadError = e instanceof Error ? e.message : 'Modell konnte nicht geladen werden'
        modelPromise = null
        throw e
      }
    })()
  }
  return modelPromise
}

/** Klassifiziert ein Bild und liefert die Top-5-Ergebnisse mit Waldbingo-Mapping. */
export async function classifyImage(
  img: HTMLImageElement | HTMLCanvasElement,
): Promise<ClassifyResult[]> {
  const model = await loadModel()
  const predictions = await model.classify(img, 10)
  return predictions.map((p) => {
    const match = mapToKategorie(p.className)
    return {
      className: p.className,
      probability: p.probability,
      kategorie: match?.kategorie ?? null,
      matchLabels: match?.labels ?? [],
    }
  })
}

/** Prueft ob eine Klassifizierung zu einem bestimmten WaldObjekt passt. */
export function matchesObject(
  results: ClassifyResult[],
  objektKategorie: Kategorie,
  minConfidence = 0.08,
): { matched: boolean; confidence: number; label: string } {
  // Erst: direkten Kategorie-Match suchen
  for (const r of results) {
    if (r.probability < minConfidence) continue
    if (r.kategorie === objektKategorie) {
      return { matched: true, confidence: r.probability, label: r.className }
    }
  }
  // Kein Match
  const bestRelevant = results.find((r) => r.kategorie !== null)
  return {
    matched: false,
    confidence: bestRelevant?.probability ?? 0,
    label: bestRelevant?.className ?? results[0]?.className ?? '',
  }
}
