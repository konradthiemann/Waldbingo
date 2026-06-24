// Generische, kindgerechte Info-Vorlagen je Kategorie – OHNE KI.
// Werden für live geholte Arten verwendet, wenn keine kuratierten Texte
// existieren. `kurz` kommt nach Möglichkeit aus der Wikipedia-Zusammenfassung;
// `erkennen` und `wusstest_du` füllen diese Vorlagen.
import type { Kategorie, ObjektInfo } from '../data/types'

interface Template {
  erkennen: string
  wusstest_du: string
}

const TEMPLATES: Record<Kategorie, Template> = {
  Tier: {
    erkennen: 'Achte auf Bewegung, Fellfarbe und Spuren am Boden. Tiere sind oft scheu – leise sein hilft.',
    wusstest_du: 'Viele Waldtiere sind dämmerungs- oder nachtaktiv und gut getarnt.',
  },
  Vogel: {
    erkennen: 'Höre auf den Gesang und schau in die Baumkronen. Farbe und Schnabelform verraten die Art.',
    wusstest_du: 'Am Gesang kann man viele Vögel erkennen, noch bevor man sie sieht.',
  },
  Insekt: {
    erkennen: 'Klein und oft auf Blüten, Blättern oder am Boden. Zähle Beine und schau auf die Flügel.',
    wusstest_du: 'Insekten sind die artenreichste Tiergruppe der Welt.',
  },
  Pflanze: {
    erkennen: 'Schau auf Blattform, Blüte und wo sie wächst. Nur anschauen – nicht pflücken oder essen!',
    wusstest_du: 'Pflanzen machen ihr Essen mit Sonnenlicht – ganz ohne zu fressen.',
  },
  Baum: {
    erkennen: 'Achte auf Rinde, Blätter oder Nadeln und die Form der Krone.',
    wusstest_du: 'An den Ringen im Holz kann man ablesen, wie alt ein Baum ist.',
  },
  Pilz: {
    erkennen: 'Wächst oft nach Regen aus Boden oder Holz. Schau auf Hut, Stiel und Farbe.',
    wusstest_du: 'Viele Pilze sind giftig – nur anschauen, niemals anfassen oder essen!',
  },
  Spur: {
    erkennen: 'Suche Abdrücke, Federn, angeknabberte Reste oder Häuschen am Boden.',
    wusstest_du: 'An Spuren erkennen Förster, welches Tier hier vorbeigekommen ist.',
  },
  Landschaft: {
    erkennen: 'Schau dich um: Wasser, Steine, Wege oder der Himmel gehören auch dazu.',
    wusstest_du: 'Auch unbelebte Dinge erzählen viel über den Wald und sein Wetter.',
  },
}

/** Erzeugt vollständige Info-Texte für eine Live-Art (kurz aus Wikipedia). */
export function buildInfo(kategorie: Kategorie, kurz: string | null): ObjektInfo {
  const t = TEMPLATES[kategorie] ?? TEMPLATES.Tier
  return {
    kurz: kurz && kurz.trim() ? kurz.trim() : `Eine Art aus der Gruppe „${kategorie}“, die hier vorkommen kann.`,
    erkennen: t.erkennen,
    wusstest_du: t.wusstest_du,
  }
}

/** Wikipedia-Zusammenfassung → kurzer, kindgerechter Satz (HTML entfernt). */
export function summaryToKurz(summary: string | null | undefined): string | null {
  if (!summary) return null
  const text = summary
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\[[0-9]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return null
  // Erste 1-2 Sätze, höchstens ~220 Zeichen.
  const sentences = text.split(/(?<=[.!?])\s+/)
  let out = sentences[0] ?? text
  if (out.length < 90 && sentences[1]) out += ' ' + sentences[1]
  if (out.length > 220) out = out.slice(0, 217).trimEnd() + '…'
  return out
}
