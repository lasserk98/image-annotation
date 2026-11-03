import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import study from '../config/study.json'
import { PHASES } from '../phases'
import { CONSENT_TEXT } from '../survey/consentText'
import { closeLink, openLink, seedSession } from '../test/surveyHelpers'

// The login screen is the entry gate of every study phase: the participant only
// enters the password, since their ID comes from the personal link. The phase
// and the link are read at import time, so each test loads a fresh module graph
// and its render is unmounted explicitly afterwards.
let unmountCurrent = () => {}
let rtl

async function renderPhase(phase = 'phase1', { id = 'P-1234', extra = '' } = {}) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', phase)
  openLink(id, extra)
  rtl = await import('@testing-library/react')
  const { default: App } = await import('../App')
  unmountCurrent = rtl.render(<App />).unmount
  return rtl.screen
}

function enterPassword(screen, password) {
  const { fireEvent } = rtl
  fireEvent.change(screen.getByLabelText('Study password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

const savedSession = (phase) => JSON.parse(localStorage.getItem(PHASES[phase].sessionKey))

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('seg-annotate:lang', 'en')
})

afterEach(() => {
  unmountCurrent()
  localStorage.clear()
  closeLink()
  vi.unstubAllEnvs()
})

describe('phase 1 entry gate', () => {
  it('lets a participant in with the right password, on to the consent step', async () => {
    const screen = await renderPhase('phase1')

    enterPassword(screen, study.phase1Password)

    expect(screen.getByRole('heading', { name: CONSENT_TEXT.title })).toBeInTheDocument()
    expect(screen.queryByLabelText('Study password')).not.toBeInTheDocument()
  })

  it('takes the participant ID from the link, never from a field', async () => {
    const screen = await renderPhase('phase1', { id: 'P-1234' })

    expect(screen.queryByLabelText(/participant ID/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    enterPassword(screen, study.phase1Password)

    expect(savedSession('phase1').participantId).toBe('P-1234')
  })

  it('rejects a wrong password and stays on the entry screen', async () => {
    const screen = await renderPhase('phase1')

    enterPassword(screen, 'not-the-password')

    expect(screen.getByRole('alert')).toHaveTextContent(/study password/i)
    expect(screen.getByLabelText('Study password')).toBeInTheDocument()
  })

  it('rejects an empty password', async () => {
    const screen = await renderPhase('phase1')

    enterPassword(screen, '')

    expect(screen.getByRole('alert')).toHaveTextContent(/study password/i)
  })

  it('does not store a participant session after a wrong password', async () => {
    const screen = await renderPhase('phase1')

    enterPassword(screen, 'nope')

    expect(localStorage.getItem(PHASES.phase1.sessionKey)).toBeNull()
  })

  it('restores a saved session on reload without asking for the password again', async () => {
    seedSession('P-77')

    const screen = await renderPhase('phase1', { id: 'P-77' })

    expect(screen.queryByLabelText('Study password')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
  })

  it('names the phase on the entry screen', async () => {
    const screen = await renderPhase('phase1')

    expect(screen.getByText('Phase 1 of 3')).toBeInTheDocument()
  })
})

describe('phase passwords', () => {
  it.each([
    ['phase1', 'phase2'],
    ['phase1', 'phase3'],
    ['phase2', 'phase1'],
    ['phase2', 'phase3'],
    ['phase3', 'phase1'],
    ['phase3', 'phase2'],
  ])('%s does not accept the password of %s', async (phase, other) => {
    const screen = await renderPhase(phase)

    enterPassword(screen, study[PHASES[other].passwordKey])

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it.each(['phase2', 'phase3'])('%s accepts its own password, straight to its survey with no consent step', async (phase) => {
    const screen = await renderPhase(phase)

    enterPassword(screen, study[PHASES[phase].passwordKey])

    expect(screen.queryByRole('heading', { name: CONSENT_TEXT.title })).not.toBeInTheDocument()
    expect(savedSession(phase).participantId).toBe('P-1234')
  })

  it('does not pick up a session of another phase saved in the same browser', async () => {
    seedSession('P-1234', { phase: 'phase1' })

    const screen = await renderPhase('phase3', { id: 'P-1234' })

    expect(screen.getByLabelText('Study password')).toBeInTheDocument()
  })
})

describe('treatment from the link', () => {
  it.each(['phase1', 'phase2', 'phase3'])('records ?treatment= in %s', async (phase) => {
    const screen = await renderPhase(phase, { extra: '&treatment=A' })

    enterPassword(screen, study[PHASES[phase].passwordKey])

    expect(savedSession(phase).treatment).toBe('A')
  })

  it('records no treatment when the link has none', async () => {
    const screen = await renderPhase('phase1')

    enterPassword(screen, study.phase1Password)

    expect(savedSession('phase1').treatment).toBeNull()
  })

  async function renderWithTreatments(extra) {
    vi.resetModules()
    vi.stubEnv('VITE_APP_VARIANT', 'phase2')
    openLink('P-1234', extra)
    vi.doMock('../config/study.json', async (importOriginal) => {
      const original = (await importOriginal()).default
      return { default: { ...original, treatments: ['A', 'B'] } }
    })
    rtl = await import('@testing-library/react')
    const { default: App } = await import('../App')
    unmountCurrent = rtl.render(<App />).unmount
    return rtl.screen
  }

  it('offers a treatment picker when treatments are configured and the link has none', async () => {
    const screen = await renderWithTreatments('')

    expect(screen.getByLabelText(/treatment/i)).toBeInTheDocument()
    vi.doUnmock('../config/study.json')
  })

  it('locks the treatment to the link, with no picker', async () => {
    const screen = await renderWithTreatments('&treatment=B')

    expect(screen.queryByLabelText(/treatment/i)).not.toBeInTheDocument()
    vi.doUnmock('../config/study.json')
  })
})
