import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRE_SURVEY } from '../survey/preSurvey'
import { answersFor, seedSession } from '../test/surveyHelpers'

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
    seedSession('P-42')
    localStorage.setItem('seg-annotate:lang', 'en')
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.doUnmock('../utils/export')
    vi.unstubAllEnvs()
  })

  it('shows the participant ID and log-out', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.getByText('Participant ID')).toBeInTheDocument()
    expect(screen.getByText('P-42')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })

  it('has no lock toggle or Creator Mode badge', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.queryByRole('button', { name: /Creator Mode/ })).not.toBeInTheDocument()
    expect(screen.queryByText('CREATOR MODE')).not.toBeInTheDocument()
  })

  it('shows the study name rather than the creator app name', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.getByText('Segmentation Annotation Study')).toBeInTheDocument()
  })

  it('exports straight away as one file named after the participant ID', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(downloadJSON).toHaveBeenCalledTimes(1)
    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toBe('P-42.json')
    expect(payload.participantId).toBe('P-42')
  })

  it('puts the survey answers, consent time and shapes into that file', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    const [, payload] = downloadJSON.mock.calls[0]
    expect(payload.survey.version).toBe('pre-1')
    expect(payload.survey.consentAcceptedAt).toBe('2026-01-01T10:00:00.000Z')
    expect(payload.survey.completedAt).toBe('2026-01-01T10:05:00.000Z')
    expect(payload.survey.answers).toEqual(Object.assign({}, ...PRE_SURVEY.sections.map(answersFor)))
    expect(payload.images[0].shapes).toHaveLength(1)
    expect(JSON.stringify(payload)).not.toContain('blob:x')
  })

  it('tells the participant which file to upload after exporting', async () => {
    const { screen } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    expect(await screen.findByRole('dialog')).toHaveTextContent('P-42.json')
  })

  it('names the file after an edited participant ID', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: 'P-42' }).click()
    const input = await screen.findByDisplayValue('P-42')
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { value: 'P-43' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    screen.getByRole('button', { name: '⬇ Export' }).click()

    expect(downloadJSON.mock.calls[0][0]).toBe('P-43.json')
  })
})
