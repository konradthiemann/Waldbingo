// Info-Modal: Olli die Eule präsentiert den Fund („Wusstest du?“).
// Inhalt wie bisher: Was ist das? · Woran erkenne ich es? · Wusstest du? ·
// Bild-Credits · Gefunden-Umschalter.
import type { ReactNode } from 'react'
import type { WaldObjekt } from '../../data/types'
import { catColor } from '../../lib/categories'
import { Friend } from '../characters/Friends'
import { GameButton, Modal, SpeechBubble } from '../ui'
import { CheckIcon, InfoIcon, PawIcon, SparkleIcon } from './icons'
import { MediaView } from './MediaView'

interface Props {
  o: WaldObjekt
  found: boolean
  onToggleFound: () => void
  onClose: () => void
}

export function InfoModal({ o, found, onToggleFound, onClose }: Props) {
  const col = catColor(o.kategorie)
  const m = o._media
  const mediaCredit =
    m && m.source
      ? `${m.attribution ? m.attribution + ' · ' : ''}${m.source}${m.license ? ' (' + m.license + ')' : ''}`
      : null

  return (
    <Modal onClose={onClose} label={`Infos zu ${o.name}`} size="md">
      {/* Bild als Polaroid, Kategorie-Plakette */}
      <div className="flex flex-col items-center pt-1">
        <div className="relative">
          <div
            className="relative h-[136px] w-[136px] -rotate-2 overflow-hidden rounded-[22px] border-[3px] bg-white p-1.5 shadow-tile"
            style={{ borderColor: col }}
          >
            <div
              className="grid h-full w-full place-items-center overflow-hidden rounded-[16px]"
              style={{ background: col + '14' }}
            >
              <MediaView o={o} variant="hero" />
            </div>
          </div>
          {found && (
            <span
              aria-hidden="true"
              className="gb-stamp absolute -right-3 -top-2 grid h-10 w-10 place-items-center rounded-full border-[3px] border-white bg-moss-deep text-white shadow-[0_3px_0_rgba(20,60,40,.35)]"
            >
              <CheckIcon size={22} />
            </span>
          )}
        </div>
        <h3 className="mt-3 text-center text-[26px] font-semibold leading-tight text-forest-900">{o.name}</h3>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
          <span
            className="rounded-full px-3 py-1 font-display text-[12.5px] font-semibold uppercase tracking-wide text-white shadow-[0_2px_0_rgba(0,0,0,.15)]"
            style={{ background: col }}
          >
            {o.kategorie}
          </span>
          {o._live && (
            <span className="rounded-full border border-cream-line bg-cream-2 px-3 py-1 font-display text-[12.5px] font-medium text-forest-700">
              kommt hier vor
            </span>
          )}
          {found && (
            <span className="rounded-full bg-moss-light px-3 py-1 font-display text-[12.5px] font-semibold text-moss-deep">
              gefunden
            </span>
          )}
        </div>
      </div>

      {/* Olli erklärt: Wusstest du? */}
      <div className="mt-4 flex items-end gap-1.5">
        <div className="-mb-1 -ml-1 flex-none">
          <Friend id="olli" size={78} mood="talk" title="Olli die Eule" />
        </div>
        <SpeechBubble tail="left" className="min-w-0 flex-1 !py-3">
          <span className="mb-0.5 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-wood-dark">
            <SparkleIcon size={14} className="text-sun-dark" />
            Wusstest du?
          </span>
          <span className="block font-sans text-[15px] font-semibold leading-snug text-ink">{o.info.wusstest_du}</span>
        </SpeechBubble>
      </div>

      <div className="mt-4 space-y-2.5">
        <InfoBlock icon={<InfoIcon size={16} />} title="Was ist das?">
          {o.info.kurz}
        </InfoBlock>
        <InfoBlock icon={<PawIcon size={17} />} title="Woran erkenne ich es?">
          {o.info.erkennen}
        </InfoBlock>
      </div>

      {mediaCredit && <p className="mt-3 text-[11px] leading-snug text-muted">Bild: {mediaCredit}</p>}

      <div className="mt-5 flex flex-col gap-2.5">
        <GameButton
          variant={found ? 'secondary' : 'primary'}
          size="lg"
          block
          icon={found ? undefined : <CheckIcon size={22} />}
          onClick={onToggleFound}
        >
          {found ? 'Doch nicht gefunden' : 'Gefunden!'}
        </GameButton>
        <GameButton variant="secondary" size="md" block onClick={onClose}>
          Zurück zum Brett
        </GameButton>
      </div>
    </Modal>
  )
}

function InfoBlock({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-cream-line bg-cream-2/70 px-3.5 py-3">
      <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-forest-100 text-forest-600">{icon}</div>
      <div className="min-w-0">
        <div className="font-display text-[13px] font-semibold uppercase tracking-wide text-forest-700">{title}</div>
        <div className="mt-0.5 text-[15px] leading-snug text-ink">{children}</div>
      </div>
    </div>
  )
}
