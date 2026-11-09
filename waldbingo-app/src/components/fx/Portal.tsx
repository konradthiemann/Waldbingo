// Overlays (Modals, Feier, Kamera) direkt in <body> rendern. Grund: Ein
// Vorfahre mit `transform`/`filter` (z. B. Bildschirm-Übergänge) macht
// `position: fixed` sonst relativ zu diesem Vorfahren statt zum Viewport.
// Im Druck werden Overlays ausgeblendet (no-print).
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return <>{children}</>
  return createPortal(<div className="no-print">{children}</div>, document.body)
}
