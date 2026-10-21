import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The variant is read at import time, so each test loads a fresh module
// graph. Testing Library is re-imported with it so it shares React with the
// fresh components, and the render is unmounted explicitly afterwards.
let unmountCurrent = () => {}

async function renderModal(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  const { render, screen } = await import('@testing-library/react')
  const { AppProvider } = await import('../context/AppContext')
  const { default: UsageModal } = await import('./UsageModal')
  unmountCurrent = render(
    <AppProvider>
      <UsageModal onClose={() => {}} />
    </AppProvider>,
  ).unmount
  return screen
}

describe('UsageModal', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  describe('creator variant', () => {
    it('shows how to annotate and the shortcuts, but no study instructions', async () => {
      const screen = await renderModal('creator')

      expect(screen.getByText('How to annotate')).toBeInTheDocument()
      expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
      expect(screen.queryByText('Study instructions')).not.toBeInTheDocument()
    })

    it('does not tell the creator to unlock Creator Mode', async () => {
      const screen = await renderModal('creator')

      expect(screen.queryByText(/unlock Creator Mode/i)).not.toBeInTheDocument()
      expect(screen.getByText(/Set up your classes first/)).toBeInTheDocument()
    })

    it('explains that export asks for a file name and omits images', async () => {
      const screen = await renderModal('creator')

      expect(screen.getByText(/choose a file name/i)).toBeInTheDocument()
      expect(screen.getByText(/never the images/i)).toBeInTheDocument()
    })
  })

  describe('study variant', () => {
    it('keeps the study instructions, steps and shortcuts', async () => {
      const screen = await renderModal('study')

      expect(screen.getByText('Study instructions')).toBeInTheDocument()
      expect(screen.getByText('How to annotate')).toBeInTheDocument()
      expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
    })

    it('keeps the original participant export step', async () => {
      const screen = await renderModal('study')

      expect(screen.getByText(/download a JSON file with every image's annotations\.$/)).toBeInTheDocument()
    })
  })
})
