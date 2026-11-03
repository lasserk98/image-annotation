import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The 1–9 keys select a class only in the Creator. The variant is read at
// import time, so each test loads a fresh module graph, with Testing Library
// re-imported alongside so it shares React with the fresh components.
let unmountCurrent = () => {}

const CREATOR_CLASSES = [
  { id: 'c1', name: 'Alpha', color: '#ff0000' },
  { id: 'c2', name: 'Beta', color: '#00ff00' },
]

async function renderCanvas(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  const { act, fireEvent, render, screen } = await import('@testing-library/react')
  const { useEffect } = await import('react')
  const { AppProvider, useApp } = await import('../context/AppContext')
  const { default: AnnotationCanvas } = await import('./AnnotationCanvas')

  function Setup() {
    const { state, addImages } = useApp()
    useEffect(() => {
      addImages([{ id: 'img-1', name: 'scan.png', url: 'blob:x', width: 800, height: 600 }])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const active = state.classes.find((c) => c.id === state.activeClassId)
    return <p data-testid="active">{active?.name ?? 'none'}</p>
  }

  unmountCurrent = render(
    <AppProvider>
      <Setup />
      <AnnotationCanvas />
    </AppProvider>,
  ).unmount
  return { screen, press: (key) => act(() => void fireEvent.keyDown(window, { key })) }
}

describe('class number keys', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('select the matching class in the Creator', async () => {
    localStorage.setItem('seg-annotate:classes', JSON.stringify(CREATOR_CLASSES))
    const { screen, press } = await renderCanvas('creator')
    expect(screen.getByTestId('active')).toHaveTextContent('Alpha')

    press('2')

    expect(screen.getByTestId('active')).toHaveTextContent('Beta')
  })

  it('do nothing in a study phase, where they are not shown', async () => {
    const { screen, press } = await renderCanvas('phase1')
    const before = screen.getByTestId('active').textContent
    expect(before).not.toBe('none')

    press('2')
    press('5')

    expect(screen.getByTestId('active')).toHaveTextContent(before)
  })
})
