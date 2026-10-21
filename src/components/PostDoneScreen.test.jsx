import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST_SURVEY } from '../survey/postSurvey'
import { answersFor } from '../test/surveyHelpers'

// The done screen only exists in the post variant, which is read at import
// time, so each test loads a fresh module graph and unmounts its own render.
let unmountCurrent = () => {}
let rtl

const POST_KEY = 'seg-annotate:post-session'
const STUDY_KEY = 'seg-annotate:session'
const ANSWERS = Object.assign({}, ...POST_SURVEY.sections.map(answersFor))

function seedPostSession(participantId = 'P-5') {
  localStorage.setItem(
    POST_KEY,
    JSON.stringify({
      participantId,
      treatment: null,
      survey: {
        version: POST_SURVEY.version,
        consentAcceptedAt: null,
        answers: ANSWERS,
        completedAt: '2026-12-01T11:58:00.000Z',
      },
    }),
  )
}

async function renderPostApp() {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', 'post')
  const downloadJSON = vi.fn()
  vi.doMock('../utils/export', async (importOriginal) => ({
    ...(await importOriginal()),
    downloadJSON,
  }))
  rtl = await import('@testing-library/react')
  const { default: App } = await import('../App')
  unmountCurrent = rtl.render(<App />).unmount
  return { screen: rtl.screen, downloadJSON }
}

describe('post done screen', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('seg-annotate:lang', 'en')
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.doUnmock('../utils/export')
    vi.unstubAllEnvs()
  })

  it('shows after a finished survey, with the participant ID and the file that will be saved', async () => {
    seedPostSession('P-5')

    const { screen } = await renderPostApp()

    expect(screen.getByRole('heading', { name: 'Thank you for taking part' })).toBeInTheDocument()
    expect(screen.getByText('P-5')).toBeInTheDocument()
    expect(screen.getByText('P-5_post.json')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
  })

  it('exports one <id>_post.json with only the questionnaire answers', async () => {
    seedPostSession('P-5')
    const { screen, downloadJSON } = await renderPostApp()

    rtl.fireEvent.click(screen.getByRole('button', { name: 'Export answers' }))

    expect(downloadJSON).toHaveBeenCalledTimes(1)
    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toBe('P-5_post.json')
    expect(payload.participantId).toBe('P-5')
    expect(payload.survey.version).toBe('post-1')
    expect(payload.survey.answers).toEqual(ANSWERS)
    expect(Object.keys(payload.survey.answers)).toHaveLength(18)
    expect(payload).not.toHaveProperty('images')
  })

  it('tells the participant which file to upload after exporting', async () => {
    seedPostSession('P-5')
    const { screen } = await renderPostApp()

    rtl.fireEvent.click(screen.getByRole('button', { name: 'Export answers' }))

    expect(await screen.findByRole('dialog')).toHaveTextContent('P-5_post.json')
  })

  it('can export again after a reload, because the finished survey is kept', async () => {
    seedPostSession('P-5')

    const { screen, downloadJSON } = await renderPostApp()
    rtl.fireEvent.click(screen.getByRole('button', { name: 'Export answers' }))

    expect(downloadJSON).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(POST_KEY)).survey.completedAt).not.toBeNull()
  })

  it('logs out to the entry screen and clears only the post session', async () => {
    seedPostSession('P-5')
    localStorage.setItem(STUDY_KEY, '{"participantId":"P-STUDY"}')
    const { screen } = await renderPostApp()

    rtl.fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(screen.getByLabelText('Participant ID')).toBeInTheDocument()
    expect(localStorage.getItem(POST_KEY)).toBeNull()
    expect(localStorage.getItem(STUDY_KEY)).not.toBeNull()
  })
})
