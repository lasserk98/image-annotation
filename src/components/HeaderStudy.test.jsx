import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST_SURVEY } from '../survey/postSurvey'
import { CONSENT_TEXT } from '../survey/consentText'
import { PRE_SURVEY } from '../survey/preSurvey'
import { answersFor, closeLink, openLink, seedSession } from '../test/surveyHelpers'

// Study-phase counterpart of Header.test.jsx, guarding that the participant
// flow works in every phase. The phase and the link are read at import time, so
// the module graph is reset per test; React, Testing Library and the export mock
// are (re)loaded with it so everything shares one instance.
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

async function renderStudyHeader(phase = 'phase1') {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', phase)
  openLink('P-42')
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

describe('Header in a study phase', () => {
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
  })

  it('shows the phase and log-out, but never the participant ID', async () => {
    const { screen } = await renderStudyHeader()

    expect(screen.getByText('Phase 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.queryByText('Participant ID')).not.toBeInTheDocument()
    expect(screen.queryByText('P-42')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'P-42' })).not.toBeInTheDocument()
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

  it('exports straight away as one file named after the participant ID and the phase', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(downloadJSON).toHaveBeenCalledTimes(1)
    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toBe('P-42_phase1.json')
    expect(payload.participantId).toBe('P-42')
    expect(payload.phase).toBe('phase1')
    expect(payload.schemaVersion).toBe(6)
  })

  it('puts the survey answers, consent time and shapes into that file', async () => {
    const { screen, downloadJSON } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    const [, payload] = downloadJSON.mock.calls[0]
    expect(payload.survey.version).toBe('pre-1')
    expect(payload.survey.consentAcceptedAt).toBe('2026-01-01T10:00:00.000Z')
    expect(payload.survey.consentVersion).toBe(CONSENT_TEXT.version)
    expect(payload.survey.completedAt).toBe('2026-01-01T10:05:00.000Z')
    expect(payload.survey.answers).toEqual(Object.assign({}, ...PRE_SURVEY.sections.map(answersFor)))
    expect(payload.images[0].shapes).toHaveLength(1)
    expect(JSON.stringify(payload)).not.toContain('blob:x')
  })

  it('tells the participant which file to upload without showing the ID', async () => {
    const { screen } = await renderStudyHeader()

    screen.getByRole('button', { name: '⬇ Export' }).click()

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('_phase1.json')
    expect(dialog).not.toHaveTextContent('P-42')
  })

  it('exports phase 2 under its own file name, with the post-survey answers', async () => {
    localStorage.clear()
    seedSession('P-42', { phase: 'phase2' })
    localStorage.setItem('seg-annotate:lang', 'en')
    const { screen, downloadJSON } = await renderStudyHeader('phase2')

    screen.getByRole('button', { name: '⬇ Export' }).click()

    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toBe('P-42_phase2.json')
    expect(payload.phase).toBe('phase2')
    expect(payload.survey.version).toBe('post-1')
    expect(payload.survey.answers).toEqual(Object.assign({}, ...POST_SURVEY.sections.map(answersFor)))
    expect(payload.images[0].shapes).toHaveLength(1)
  })

  it('shows phase 2 in the header of the phase 2 page', async () => {
    localStorage.clear()
    seedSession('P-42', { phase: 'phase2' })
    localStorage.setItem('seg-annotate:lang', 'en')
    const { screen } = await renderStudyHeader('phase2')

    expect(screen.getByText('Phase 2 of 3')).toBeInTheDocument()
  })
})
