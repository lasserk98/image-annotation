import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// These tests cover the locked Annotation Mode, which only exists in the
// study variant (the creator variant is always unlocked). The variant and the
// provider's initial state are read at import time, so the module graph is
// reset and re-imported per test — React and Testing Library included, so they
// share one React instance with the fresh components.
// The global cleanup in setup.js only knows the statically imported Testing
// Library, so each re-imported render is unmounted explicitly.
let unmountCurrent = () => {}

async function renderInAnnotationMode() {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', 'study')
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

describe('ClassPicker in Annotation Mode (study variant, creatorMode: false)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('shows a button to load a class config file', async () => {
    const screen = await renderInAnnotationMode()

    expect(screen.getByRole('button', { name: '+ Load config' })).toBeInTheDocument()
  })

  it('keeps class-editing controls hidden outside Creator Mode', async () => {
    const screen = await renderInAnnotationMode()

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
  })
})
