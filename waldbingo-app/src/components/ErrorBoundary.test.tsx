import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

// React 18: act()-Umgebung für Tests ohne Testing-Library.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Boom(): never {
  throw new Error('kaputt')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('zeigt Kinder, solange nichts schiefgeht', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const root = createRoot(el)
    act(() => root.render(<ErrorBoundary>Alles gut</ErrorBoundary>))
    expect(el.textContent).toBe('Alles gut')
    act(() => root.unmount())
  })

  it('fängt einen Absturz ab und bietet „Neu laden“ an', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const el = document.createElement('div')
    document.body.appendChild(el)
    const root = createRoot(el)
    act(() =>
      root.render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      ),
    )
    expect(el.querySelector('[role="alert"]')).not.toBeNull()
    expect(el.querySelector('h1')?.textContent?.length).toBeGreaterThan(0)
    expect([...el.querySelectorAll('button')].some((b) => b.textContent === 'Neu laden')).toBe(true)
    act(() => root.unmount())
  })
})
