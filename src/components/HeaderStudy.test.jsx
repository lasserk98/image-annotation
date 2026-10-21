import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Study-variant counterpart of Header.test.jsx, guarding that the participant
// flow is unchanged. The variant is read at import time, so the module graph
// is reset per test; React, Testing Library and the export mock are
// (re)loaded with it so everything shares one instance.
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

async function renderStudyHeader() {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', 'study')
  const downloadJSON = vi.fn()
  vi.doMock('../utils/export', async (importOriginal) => ({
    ...(await importOriginal()),
    downloadJSON,
  }))
  const { useEffect } = await import('react')
  const { render, screen } = await import('@testing-library/react')
  const { AppProvider, useApp } = await import('../context/AppContext')
  const { default: Header } = await import('./Header')

  function Harness() {
    const { addImages, setShapes } = useApp()
    useEffect(() => {
      addImages([IMAGE])
      setShapes(IMAGE.id, [SHAPE])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return <Header leftOpen rightOpen onToggleLeft={() => {}} onToggleRight={() => {}} />
  }

  unmountCurrent = render(
    <AppProvider>
      <Harness />
    </AppProvider>,
  ).unmount
  return { screen, downloadJSON }
}

describe('Header in the study variant', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'seg-annotate:session',
      JSON.stringify({ participantId: 'P-42', treatment: null }),
    )
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.doUnmock('../utils/export')
    vi.unstubAllEnvs()
  })

  it('shows the participant ID, the lock toggle and log-out', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.getByText('Participant ID')).toBeInTheDocument()
    expect(screen.getByText('P-42')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enter Creator Mode/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('shows the study name rather than the creator app name', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.getByText('Segmentation Annotation Study')).toBeInTheDocument()
  })

  it('exports straight away under a name carrying the participant ID', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(downloadJSON).toHaveBeenCalledTimes(1)
    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toMatch(/^annotations_P-42_.+\.json$/)
    expect(payload.participantId).toBe('P-42')
  })
})
