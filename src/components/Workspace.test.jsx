import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { closeLink, openLink, seedSession } from '../test/surveyHelpers'

// The whole workspace, so the "leave this page?" prompt is checked as the
// participant experiences it, with everything that listens for it mounted.
// The variant and the link are read at import time, hence the fresh module
// graph per test, with React and Testing Library loaded alongside.
let unmountCurrent = () => {}

const IMAGE = { id: 'i1', name: 'scan.png', url: 'blob:x', width: 10, height: 10 }
const SHAPE = {
  id: 's1',
  classId: 'c1',
  points: [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 5 },
  ],
}

async function renderWorkspace(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  if (variant !== 'creator') openLink('P-42')
  vi.doMock('../utils/export', async (importOriginal) => ({
    ...(await importOriginal()),
    downloadJSON: vi.fn(),
  }))
  const { useEffect } = await import('react')
  const { render, screen } = await import('@testing-library/react')
  const { AppProvider, useApp } = await import('../context/AppContext')
  const { default: Workspace } = await import('./Workspace')

  function Setup() {
    const { addImages, setShapes } = useApp()
    useEffect(() => {
      addImages([IMAGE])
      setShapes(IMAGE.id, [SHAPE])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return null
  }

  unmountCurrent = render(
    <AppProvider>
      <Setup />
      <Workspace />
    </AppProvider>,
  ).unmount
  return screen
}

function tryToLeave() {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe('Workspace leave prompt', () => {
  beforeEach(() => {
    localStorage.clear()
    seedSession('P-42')
    localStorage.setItem('seg-annotate:lang', 'en')
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    closeLink()
    vi.doUnmock('../utils/export')
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('asks before leaving while the annotations are not exported, and not after the export', async () => {
    const screen = await renderWorkspace('phase1')
    expect(tryToLeave()).toBe(true)

    screen.getByRole('button', { name: '⬇ Export' }).click()

    await vi.waitFor(() => expect(tryToLeave()).toBe(false))
  })

  it('still asks before leaving in the creator while annotations are not exported', async () => {
    await renderWorkspace('creator')

    expect(tryToLeave()).toBe(true)
  })
})
