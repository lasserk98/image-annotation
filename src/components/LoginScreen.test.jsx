import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import study from '../config/study.json'
import { seedSession } from '../test/surveyHelpers'

// The login screen is the study entry gate: it only exists in the study
// variant. The variant is read at import time, so each test loads a fresh
// module graph, and its render is unmounted explicitly afterwards.
let unmountCurrent = () => {}
let rtl

async function renderStudyApp() {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', 'study')
  rtl = await import('@testing-library/react')
  const { default: App } = await import('../App')
  unmountCurrent = rtl.render(<App />).unmount
  return rtl.screen
}

function enter(screen, { id, password }) {
  const { fireEvent } = rtl
  fireEvent.change(screen.getByLabelText('Participant ID'), { target: { value: id } })
  fireEvent.change(screen.getByLabelText('Study password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

describe('study entry gate', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('seg-annotate:lang', 'en')
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('lets a participant in with the study ID and the right password, on to the consent step', async () => {
    const screen = await renderStudyApp()

    enter(screen, { id: 'P-1234', password: study.studyPassword })

    expect(screen.getByRole('heading', { name: 'Einwilligungserklärung' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Study password')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('seg-annotate:session')).participantId).toBe('P-1234')
  })

  it('rejects a wrong password and stays on the entry screen', async () => {
    const screen = await renderStudyApp()

    enter(screen, { id: 'P-1234', password: 'not-the-password' })

    expect(screen.getByRole('alert')).toHaveTextContent(/study password/i)
    expect(screen.getByLabelText('Study password')).toBeInTheDocument()
  })

  it('rejects an empty password', async () => {
    const screen = await renderStudyApp()

    enter(screen, { id: 'P-1234', password: '' })

    expect(screen.getByRole('alert')).toHaveTextContent(/study password/i)
  })

  it('still requires a study ID', async () => {
    const screen = await renderStudyApp()

    enter(screen, { id: '   ', password: study.studyPassword })

    expect(screen.getByRole('alert')).toHaveTextContent(/participant ID/i)
  })

  it('does not store a participant session after a wrong password', async () => {
    const screen = await renderStudyApp()

    enter(screen, { id: 'P-1234', password: 'nope' })

    expect(localStorage.getItem('seg-annotate:session')).toBeNull()
  })

  it('restores a saved session on reload without asking for the password again', async () => {
    seedSession('P-77')

    const screen = await renderStudyApp()

    expect(screen.getByText('P-77')).toBeInTheDocument()
  })
})
