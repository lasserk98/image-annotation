import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { closeLink, openLink } from '../test/surveyHelpers'

// The phase is read at import time, so the module graph is reset per test.
let unmountCurrent = () => {}

// Mounts Header right after a fresh login, as the app does when the login
// screen swaps for the workspace.
async function renderAfterLogin(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  if (variant !== 'creator') openLink('P-42')
  const { useEffect, useRef } = await import('react')
  const { render, screen, fireEvent } = await import('@testing-library/react')
  const { AppProvider, useApp } = await import('../context/AppContext')
  const { default: Header } = await import('./Header')

  function Harness() {
    const { login, state } = useApp()
    useEffect(() => {
      login('P-42', 'A')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // Latch: Header clears justLoggedIn itself and must stay mounted after.
    const mounted = useRef(false)
    if (state.justLoggedIn) mounted.current = true
    if (!mounted.current) return null
    return <Header leftOpen rightOpen onToggleLeft={() => {}} onToggleRight={() => {}} />
  }

  unmountCurrent = render(
    <AppProvider>
      <Harness />
    </AppProvider>,
  ).unmount
  return { screen, fireEvent }
}

const TUTORIAL = 'Picture tutorial'
const USAGE = 'Usage & shortcuts'

describe('tutorial after login', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('seg-annotate:lang', 'en')
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    closeLink()
    vi.unstubAllEnvs()
  })

  async function clickThrough({ screen, fireEvent }) {
    while (screen.queryByRole('button', { name: 'Next' })) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Continue to the instructions' }))
  }

  it('opens the tutorial first in phase 1, then the instructions', async () => {
    const rtl = await renderAfterLogin('phase1')

    expect(rtl.screen.getByRole('dialog', { name: TUTORIAL })).toBeInTheDocument()
    expect(rtl.screen.queryByText(USAGE)).not.toBeInTheDocument()
    await clickThrough(rtl)

    expect(rtl.screen.queryByRole('dialog', { name: TUTORIAL })).not.toBeInTheDocument()
    expect(rtl.screen.getByText(USAGE)).toBeInTheDocument()
    expect(localStorage.getItem('seg-annotate:tutorial-seen')).toBe('1')
  })

  it('skips the tutorial in phase 1 once it has been seen', async () => {
    localStorage.setItem('seg-annotate:tutorial-seen', '1')

    const { screen } = await renderAfterLogin('phase1')

    expect(screen.queryByRole('dialog', { name: TUTORIAL })).not.toBeInTheDocument()
    expect(screen.getByText(USAGE)).toBeInTheDocument()
  })

  it.each(['phase2', 'phase3', 'creator'])('never opens the tutorial by itself in %s', async (variant) => {
    const { screen } = await renderAfterLogin(variant)

    expect(screen.queryByRole('dialog', { name: TUTORIAL })).not.toBeInTheDocument()
    expect(screen.getByText(USAGE)).toBeInTheDocument()
  })

  it('does not mark the tutorial as seen when only replayed', async () => {
    const { screen, fireEvent } = await renderAfterLogin('creator')

    fireEvent.click(screen.getByRole('button', { name: 'Watch the picture tutorial again' }))
    expect(screen.getByRole('dialog', { name: TUTORIAL })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog', { name: TUTORIAL })).not.toBeInTheDocument()
    expect(screen.getByText(USAGE)).toBeInTheDocument()
    expect(localStorage.getItem('seg-annotate:tutorial-seen')).toBeNull()
  })
})
