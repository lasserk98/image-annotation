import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// These tests cover the locked class list of a study phase (the creator
// variant is always unlocked). The variant and the
// provider's initial state are read at import time, so the module graph is
// reset and re-imported per test — React and Testing Library included, so they
// share one React instance with the fresh components.
// The global cleanup in setup.js only knows the statically imported Testing
// Library, so each re-imported render is unmounted explicitly.
let unmountCurrent = () => {}

async function renderInAnnotationMode() {
  vi.resetModules()
  localStorage.setItem('seg-annotate:lang', 'en')
  vi.stubEnv('VITE_APP_VARIANT', 'phase1')
  const { render, screen } = await import('@testing-library/react')
  const { AppProvider } = await import('../context/AppContext')
  const { default: ClassPicker } = await import('./ClassPicker')
  unmountCurrent = render(
    <AppProvider>
      <ClassPicker />
    </AppProvider>,
  ).unmount
  return screen
}

describe('ClassPicker in a study phase', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('lists the fixed study classes', async () => {
    const screen = await renderInAnnotationMode()

    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('Stapes')).toBeInTheDocument()
    expect(screen.getByText('Chorda tympani')).toBeInTheDocument()
    expect(screen.getByText('langer Ambossschenkel')).toBeInTheDocument()
  })

  it('offers no way to load, add, clear or export classes', async () => {
    const screen = await renderInAnnotationMode()

    expect(screen.queryByRole('button', { name: '+ Load config' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
  })

  it('ignores a class list saved in the browser', async () => {
    localStorage.setItem(
      'seg-annotate:classes',
      JSON.stringify([{ id: 'foreign', name: 'Foreign class', color: '#000000' }]),
    )

    const screen = await renderInAnnotationMode()

    expect(screen.queryByText('Foreign class')).not.toBeInTheDocument()
    expect(screen.getByText('Stapes')).toBeInTheDocument()
  })
})
