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
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('seg-annotate:lang', 'en')
  })

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

  describe('study phase', () => {
    it('keeps the study instructions, steps and shortcuts', async () => {
      const screen = await renderModal('phase1')

      expect(screen.getByText('Study instructions')).toBeInTheDocument()
      expect(screen.getByText('How to annotate')).toBeInTheDocument()
      expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
    })

    it('translates the shortcut key labels, not only their descriptions', async () => {
      localStorage.setItem('seg-annotate:lang', 'de')

      const screen = await renderModal('phase1')

      expect(screen.getByText('Scrollen')).toBeInTheDocument()
      expect(screen.getByText('Doppelklick auf Punkt')).toBeInTheDocument()
      expect(screen.queryByText('Double-click vertex')).not.toBeInTheDocument()
    })

    it('says the classes are preset and never mentions Creator Mode', async () => {
      const screen = await renderModal('phase1')

      expect(screen.getByText(/classes are preset and fixed/i)).toBeInTheDocument()
      expect(screen.queryByText(/Creator Mode/i)).not.toBeInTheDocument()
    })

    it('explains the export file and the upload in the last step', async () => {
      const screen = await renderModal('phase1')

      const step = screen.getByText(/saved as one file\. Upload that file/)
      expect(step).toHaveTextContent(/Upload that file to the shared study folder/)
      expect(step).toHaveTextContent(/upload only the latest file/)
      expect(step).not.toHaveTextContent(/study ID/)
    })
  })
})
