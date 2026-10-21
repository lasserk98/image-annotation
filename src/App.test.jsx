import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import study from './config/study.json'
import { PRE_SURVEY } from './survey/preSurvey'
import { answerPages, seedSession } from './test/surveyHelpers'

// The variant and the app's initial state are both read once at import time,
// so each test gets a fresh module graph. React and Testing Library are
// re-imported too, otherwise they would hold a different React instance than
// the freshly loaded components.
// The global cleanup in setup.js only knows the statically imported Testing
// Library, so each re-imported render is unmounted explicitly.
let unmountCurrent = () => {}
let rtl

async function renderApp(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  rtl = await import('@testing-library/react')
  const { render, screen } = rtl
  const { default: App } = await import('./App')
  unmountCurrent = render(<App />).unmount
  return screen
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  describe('creator variant', () => {
    it('opens straight into the workspace without a participant ID screen', async () => {
      const screen = await renderApp('creator')

      expect(screen.queryByLabelText('Participant ID')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
    })

    it('has class editing unlocked from the start', async () => {
      const screen = await renderApp('creator')

      expect(screen.getByRole('button', { name: '+ Add class' })).toBeInTheDocument()
    })

    it('ignores a participant session saved by an earlier visit', async () => {
      localStorage.setItem(
        'seg-annotate:session',
        JSON.stringify({ participantId: 'P-1', treatment: null }),
      )

      const screen = await renderApp('creator')

      expect(screen.queryByText('P-1')).not.toBeInTheDocument()
    })

    it('hides the lock toggle and log-out button', async () => {
      const screen = await renderApp('creator')

      expect(screen.queryByRole('button', { name: /Creator Mode/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
    })
  })

  describe('study variant', () => {
    it('shows the participant ID screen first, in German by default', async () => {
      const screen = await renderApp('study')

      expect(screen.getByLabelText('Teilnehmer-ID')).toBeInTheDocument()
    })

    it('respects a language the participant chose earlier', async () => {
      localStorage.setItem('seg-annotate:lang', 'en')

      const screen = await renderApp('study')

      expect(screen.getByLabelText('Participant ID')).toBeInTheDocument()
    })

    it('has no way into Creator Mode once logged in', async () => {
      seedSession('P-1')
      localStorage.setItem('seg-annotate:lang', 'en')

      const screen = await renderApp('study')

      expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Creator Mode/ })).not.toBeInTheDocument()
      expect(screen.queryByText('CREATOR MODE')).not.toBeInTheDocument()
    })
  })

  describe('study entry flow', () => {
    beforeEach(() => localStorage.setItem('seg-annotate:lang', 'en'))

    const within = (...args) => rtl.within(...args)
    const helpers = () => ({ fireEvent: rtl.fireEvent, screen: rtl.screen, within })

    it('shows the consent screen to a participant who has not consented', async () => {
      seedSession('P-1', { consent: false })

      const screen = await renderApp('study')

      expect(screen.getByRole('heading', { name: 'Einwilligungserklärung' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Export' })).not.toBeInTheDocument()
    })

    it('shows the survey to a participant who consented but has not finished it', async () => {
      seedSession('P-1', { completed: false })

      const screen = await renderApp('study')

      expect(screen.getByText('Part 1 of 3')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Export' })).not.toBeInTheDocument()
    })

    it('opens the workspace for a participant who finished the survey', async () => {
      seedSession('P-1')

      const screen = await renderApp('study')

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
    })

    it('walks from login through consent and the survey into the workspace', async () => {
      const screen = await renderApp('study')
      rtl.fireEvent.change(screen.getByLabelText('Participant ID'), { target: { value: 'P-9' } })
      rtl.fireEvent.change(screen.getByLabelText('Study password'), { target: { value: study.studyPassword } })
      rtl.fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      rtl.fireEvent.click(screen.getByRole('checkbox', { name: /Ich habe die obigen Informationen gelesen/ }))
      rtl.fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(screen.getByText('Part 1 of 3')).toBeInTheDocument()
      answerPages(helpers(), PRE_SURVEY)

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
      expect(screen.getByText('P-9')).toBeInTheDocument()
    })

    it('goes back to the entry screen when logging out of the survey', async () => {
      seedSession('P-1', { completed: false })
      const screen = await renderApp('study')

      rtl.fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

      expect(screen.getByLabelText('Participant ID')).toBeInTheDocument()
      expect(localStorage.getItem('seg-annotate:session')).toBeNull()
    })
  })

  it('lets the creator variant follow the browser language', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')

    const screen = await renderApp('creator')

    expect(screen.getByRole('button', { name: '⬇ Exportieren' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
