import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import study from './config/study.json'
import { PHASES } from './phases'
import { CONSENT_TEXT } from './survey/consentText'
import { POST_SURVEY } from './survey/postSurvey'
import { PRE_SURVEY } from './survey/preSurvey'
import { answerPages, closeLink, openLink, seedSession } from './test/surveyHelpers'

// The variant and the app's initial state are both read once at import time,
// so each test gets a fresh module graph. React and Testing Library are
// re-imported too, otherwise they would hold a different React instance than
// the freshly loaded components.
// The global cleanup in setup.js only knows the statically imported Testing
// Library, so each re-imported render is unmounted explicitly.
let unmountCurrent = () => {}
let rtl

// A participant opens the page from the personal link in their email, which
// carries their ID (`id: null` is a link without one).
async function renderApp(variant, { id = 'P-1' } = {}) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  openLink(id)
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
    closeLink()
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

  describe('phase page', () => {
    it('asks only for the password first, in German by default, never for an ID', async () => {
      const screen = await renderApp('phase1')

      expect(screen.getByLabelText('Studienpasswort')).toBeInTheDocument()
      expect(screen.queryByLabelText(/Teilnehmer-ID/)).not.toBeInTheDocument()
    })

    it('respects a language the participant chose earlier', async () => {
      localStorage.setItem('seg-annotate:lang', 'en')

      const screen = await renderApp('phase1')

      expect(screen.getByLabelText('Study password')).toBeInTheDocument()
    })

    it('has no way into Creator Mode once logged in', async () => {
      seedSession('P-1')
      localStorage.setItem('seg-annotate:lang', 'en')

      const screen = await renderApp('phase1')

      expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Creator Mode/ })).not.toBeInTheDocument()
      expect(screen.queryByText('CREATOR MODE')).not.toBeInTheDocument()
    })

    it.each(['phase1', 'phase2', 'phase3'])('shows a clear message instead of the login when the %s link has no ID', async (phase) => {
      const screen = await renderApp(phase, { id: null })

      expect(screen.getByRole('heading', { name: 'Link ungültig' })).toBeInTheDocument()
      expect(screen.queryByLabelText('Studienpasswort')).not.toBeInTheDocument()
    })

    it('treats a link with an unsafe ID as having none', async () => {
      const screen = await renderApp('phase1', { id: '../etc' })

      expect(screen.getByRole('heading', { name: 'Link ungültig' })).toBeInTheDocument()
    })

    it('does not offer a way past the message, even with a saved session', async () => {
      seedSession('P-1')

      const screen = await renderApp('phase1', { id: null })

      expect(screen.getByRole('heading', { name: 'Link ungültig' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Exportieren' })).not.toBeInTheDocument()
    })

    it('ignores a saved session that belongs to another link, so answers never land under the wrong ID', async () => {
      seedSession('P-OLD')

      const screen = await renderApp('phase1', { id: 'P-NEW' })

      expect(screen.getByLabelText('Studienpasswort')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Exportieren' })).not.toBeInTheDocument()
    })

    it('never shows the participant ID anywhere on the page', async () => {
      seedSession('P-SECRET-77')
      localStorage.setItem('seg-annotate:lang', 'en')

      const screen = await renderApp('phase1', { id: 'P-SECRET-77' })

      expect(screen.queryByText(/P-SECRET-77/)).not.toBeInTheDocument()
      expect(document.body.textContent).not.toContain('P-SECRET-77')
    })
  })

  describe('study entry flow', () => {
    beforeEach(() => localStorage.setItem('seg-annotate:lang', 'en'))

    const within = (...args) => rtl.within(...args)
    const helpers = () => ({ fireEvent: rtl.fireEvent, screen: rtl.screen, within })

    it('shows the consent screen to a participant who has not consented', async () => {
      seedSession('P-1', { consent: false })

      const screen = await renderApp('phase1')

      expect(screen.getByRole('heading', { name: CONSENT_TEXT.title })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Export' })).not.toBeInTheDocument()
    })

    it('shows the survey to a participant who consented but has not finished it', async () => {
      seedSession('P-1', { completed: false })

      const screen = await renderApp('phase1')

      expect(screen.getByText('Part 1 of 3')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '⬇ Export' })).not.toBeInTheDocument()
    })

    it('opens the workspace for a participant who finished the survey', async () => {
      seedSession('P-1')

      const screen = await renderApp('phase1')

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
    })

    it('walks from the password through consent and the survey into the workspace', async () => {
      const screen = await renderApp('phase1', { id: 'P-9' })
      rtl.fireEvent.change(screen.getByLabelText('Study password'), { target: { value: study.phase1Password } })
      rtl.fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      rtl.fireEvent.click(screen.getByRole('checkbox', { name: /freiwillig an der Studie teilzunehmen/ }))
      rtl.fireEvent.click(screen.getByRole('checkbox', { name: /Verarbeitung meiner personenbezogenen Daten/ }))
      rtl.fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(screen.getByText('Part 1 of 3')).toBeInTheDocument()
      answerPages(helpers(), PRE_SURVEY)

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
      expect(screen.queryByText('P-9')).not.toBeInTheDocument()
    })

    it('goes back to the password screen when logging out of the survey', async () => {
      seedSession('P-1', { completed: false })
      const screen = await renderApp('phase1')

      rtl.fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

      expect(screen.getByLabelText('Study password')).toBeInTheDocument()
      expect(localStorage.getItem(PHASES.phase1.sessionKey)).toBeNull()
    })
  })

  describe('phase 2 flow', () => {
    beforeEach(() => localStorage.setItem('seg-annotate:lang', 'en'))

    const helpers = () => ({ fireEvent: rtl.fireEvent, screen: rtl.screen, within: rtl.within })

    it('walks from the password through the questions into the annotation workspace, with no consent step', async () => {
      const screen = await renderApp('phase2', { id: 'P-9' })
      rtl.fireEvent.change(screen.getByLabelText('Study password'), { target: { value: study.phase2Password } })
      rtl.fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(screen.queryByRole('heading', { name: CONSENT_TEXT.title })).not.toBeInTheDocument()
      expect(screen.getByText('Part 1 of 3 · Question 1 of 10')).toBeInTheDocument()
      answerPages(helpers(), POST_SURVEY)

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Thank you for taking part' })).not.toBeInTheDocument()
    })

    it('resumes in the middle of the survey after a reload', async () => {
      localStorage.setItem(
        PHASES.phase2.sessionKey,
        JSON.stringify({
          participantId: 'P-9',
          treatment: null,
          survey: { version: 'post-1', consentAcceptedAt: null, answers: { 'post.1': 1, 'post.2': 1 }, completedAt: null },
        }),
      )

      const screen = await renderApp('phase2', { id: 'P-9' })

      expect(screen.getByText('Part 1 of 3 · Question 3 of 10')).toBeInTheDocument()
    })

    it('does not pick up the phase 1 session of the same participant in the same browser', async () => {
      seedSession('P-9', { phase: 'phase1' })

      const screen = await renderApp('phase2', { id: 'P-9' })

      expect(screen.getByLabelText('Study password')).toBeInTheDocument()
    })
  })

  describe('phase 3 flow', () => {
    beforeEach(() => localStorage.setItem('seg-annotate:lang', 'en'))

    it('asks the follow-up survey, with no consent step', async () => {
      seedSession('P-1', { phase: 'phase3', completed: false })

      const screen = await renderApp('phase3')

      expect(screen.getByText(/PLATZHALTER/)).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: CONSENT_TEXT.title })).not.toBeInTheDocument()
    })

    it('opens the annotation workspace once the follow-up survey is done', async () => {
      seedSession('P-1', { phase: 'phase3' })

      const screen = await renderApp('phase3')

      expect(screen.getByRole('button', { name: '⬇ Export' })).toBeInTheDocument()
    })
  })

  it('lets the creator variant follow the browser language', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')

    const screen = await renderApp('creator')

    expect(screen.getByRole('button', { name: '⬇ Exportieren' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
