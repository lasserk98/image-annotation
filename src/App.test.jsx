import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The variant and the app's initial state are both read once at import time,
// so each test gets a fresh module graph. React and Testing Library are
// re-imported too, otherwise they would hold a different React instance than
// the freshly loaded components.
// The global cleanup in setup.js only knows the statically imported Testing
// Library, so each re-imported render is unmounted explicitly.
let unmountCurrent = () => {}

async function renderApp(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  const { render, screen } = await import('@testing-library/react')
  const { default: App } = await import('./App')
  unmountCurrent = render(<App />).unmount
  return screen
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  describe('creator variant', () => {
    it('opens straight into the workspace without a participant ID screen', async () => {
      const screen = await renderApp('creator')

      expect(screen.queryByLabelText('Participant ID')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
    })

    it('has class editing unlocked from the start', async () => {
      const screen = await renderApp('creator')

      expect(screen.getByRole('button', { name: '+ Add class' })).toBeInTheDocument()
    })

    it('ignores a participant session saved by an earlier visit', async () => {
      localStorage.setItem(
        'seg-annotate:session',
        JSON.stringify({ participantId: 'P-1', treatment: null }),
      )

      const screen = await renderApp('creator')

      expect(screen.queryByText('P-1')).not.toBeInTheDocument()
    })

    it('hides the lock toggle and log-out button', async () => {
      const screen = await renderApp('creator')

      expect(screen.queryByRole('button', { name: /Creator Mode/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
    })
  })

  describe('study variant', () => {
    it('shows the participant ID screen first', async () => {
      const screen = await renderApp('study')

      expect(screen.getByLabelText('Participant ID')).toBeInTheDocument()
    })

    it('keeps class editing locked behind Creator Mode', async () => {
      localStorage.setItem(
        'seg-annotate:session',
        JSON.stringify({ participantId: 'P-1', treatment: null }),
      )

      const screen = await renderApp('study')

      expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Enter Creator Mode/ })).toBeInTheDocument()
    })
  })
})
