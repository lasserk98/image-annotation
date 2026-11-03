import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PHASES } from '../phases'
import { CONSENT_TEXT } from '../survey/consentText'
import { PRE_SURVEY } from '../survey/preSurvey'
import { closeLink, openLink } from '../test/surveyHelpers'
import { emptySurvey } from '../utils/survey'

const SESSION_KEY = PHASES.phase1.sessionKey

// The variant and the provider's initial state are read at import time, so
// each test loads a fresh module graph; Testing Library comes with it so it
// shares React with the provider, and the render is unmounted explicitly.
let ctx
let rtl
let unmountCurrent = () => {}

// `linkId` is the participant ID in the link the page was opened from;
// `linkExtra` any further query, e.g. '&treatment=A'.
async function setup(variant = 'phase1', linkId = 'P-1', linkExtra = '') {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  openLink(linkId, linkExtra)
  rtl = await import('@testing-library/react')
  const { useEffect } = await import('react')
  const { AppProvider, useApp } = await import('./AppContext')
  function Probe() {
    const value = useApp()
    // Publish after render (not during it) so tests can reach the context.
    useEffect(() => {
      ctx = value
    })
    return null
  }
  unmountCurrent = rtl.render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  ).unmount
}

const act = (fn) => rtl.act(fn)
const savedSession = () => JSON.parse(localStorage.getItem(SESSION_KEY))

// A valid answer for every required item.
function answerEverything() {
  for (const item of PRE_SURVEY.sections.flatMap((s) => s.items)) {
    if (item.optional) continue
    const value =
      item.type === 'number' ? item.min : item.type === 'choice' ? item.options[0].value : 1
    act(() => ctx.setSurveyAnswer(item.id, value))
  }
}

describe('survey state (study phase)', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    closeLink()
    vi.unstubAllEnvs()
  })

  it('starts with an empty survey', async () => {
    await setup()

    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
  })

  it('records consent with a timestamp and saves it with the session', async () => {
    await setup()
    act(() => ctx.login('P-1', null))

    act(() => ctx.acceptConsent())

    expect(ctx.state.survey.consentAcceptedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(savedSession().survey.consentAcceptedAt).toBe(ctx.state.survey.consentAcceptedAt)
  })

  it('records which consent text version was accepted', async () => {
    await setup()
    act(() => ctx.login('P-1', null))

    act(() => ctx.acceptConsent())

    expect(ctx.state.survey.consentVersion).toBe(CONSENT_TEXT.version)
    expect(savedSession().survey.consentVersion).toBe(CONSENT_TEXT.version)
  })

  it('stores and overwrites a raw answer by item id, and saves it', async () => {
    await setup()
    act(() => ctx.login('P-1', null))

    act(() => ctx.setSurveyAnswer('pre.1', 2))
    act(() => ctx.setSurveyAnswer('pre.1', 4))

    expect(ctx.state.survey.answers['pre.1']).toBe(4)
    expect(savedSession().survey.answers['pre.1']).toBe(4)
  })

  it('refuses to complete while required answers are missing', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.setSurveyAnswer('pre.1', 2))

    act(() => ctx.completeSurvey())

    expect(ctx.state.survey.completedAt).toBeNull()
  })

  it('completes once every required item is answered, leaving the free text optional', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    answerEverything()

    act(() => ctx.completeSurvey())

    expect(ctx.state.survey.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(savedSession().survey.completedAt).toBe(ctx.state.survey.completedAt)
  })

  it('locks the answers after completion', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    answerEverything()
    act(() => ctx.completeSurvey())

    act(() => ctx.setSurveyAnswer('pre.1', 5))

    expect(ctx.state.survey.answers['pre.1']).toBe(1)
  })

  it('starts a new login with a fresh survey', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.setSurveyAnswer('pre.1', 2))
    act(() => ctx.logout())

    act(() => ctx.login('P-2', null))

    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
  })

  it('clears the survey and the saved session on log-out', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.setSurveyAnswer('pre.1', 2))

    act(() => ctx.logout())

    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('has no way to change the participant ID once logged in', async () => {
    await setup()

    expect(ctx).not.toHaveProperty('updateParticipantId')
  })

  it('resumes a saved session only for the link it was started from', async () => {
    const survey = { version: 'pre-1', consentAcceptedAt: null, answers: { 'pre.1': 3 }, completedAt: null }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-OLD', treatment: null, survey }))

    await setup('phase1', 'P-NEW')

    expect(ctx.state.participantId).toBeNull()
    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
  })

  describe('treatment in the link', () => {
    const saved = (treatment) =>
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ participantId: 'P-1', treatment, survey: { version: 'pre-1', consentAcceptedAt: null, answers: { 'pre.1': 3 }, completedAt: null } }),
      )

    it('starts over when the link carries a different treatment than the saved session', async () => {
      saved('A')

      await setup('phase1', 'P-1', '&treatment=B')

      expect(ctx.state.participantId).toBeNull()
      expect(ctx.state.treatment).toBeNull()
    })

    it('resumes when the link carries the same treatment', async () => {
      saved('A')

      await setup('phase1', 'P-1', '&treatment=A')

      expect(ctx.state.participantId).toBe('P-1')
      expect(ctx.state.treatment).toBe('A')
      expect(ctx.state.survey.answers['pre.1']).toBe(3)
    })

    it('resumes when the link carries no treatment, keeping the saved one', async () => {
      saved('A')

      await setup('phase1', 'P-1')

      expect(ctx.state.participantId).toBe('P-1')
      expect(ctx.state.treatment).toBe('A')
    })

    it('starts over when the link adds a treatment to a session saved without one', async () => {
      saved(null)

      await setup('phase1', 'P-1', '&treatment=A')

      expect(ctx.state.participantId).toBeNull()
    })
  })

  it('does not resume a saved session when the link carries no ID', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', treatment: null }))

    await setup('phase1', null)

    expect(ctx.state.participantId).toBeNull()
  })

  it('resumes a saved survey after a reload', async () => {
    const survey = {
      version: 'pre-1',
      consentAcceptedAt: '2026-01-01T10:00:00.000Z',
      consentVersion: 'consent-1',
      answers: { 'pre.1': 3 },
      completedAt: null,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', treatment: null, survey }))

    await setup()

    expect(ctx.state.survey).toEqual(survey)
  })

  it('starts the survey for a session saved before surveys existed', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', treatment: null }))

    await setup()

    expect(ctx.state.participantId).toBe('P-1')
    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
  })

  it('discards a saved survey made for a different survey version', async () => {
    const survey = { version: 'old', consentAcceptedAt: 'x', answers: { 'pre.1': 3 }, completedAt: 'y' }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', treatment: null, survey }))

    await setup()

    expect(ctx.state.survey).toEqual(emptySurvey('pre-1'))
  })
})

describe('log-out and consent guards (study phase)', () => {
  const IMAGE = { id: 'i1', name: 'a.png', url: 'blob:x', width: 1, height: 1 }
  const originalRevoke = URL.revokeObjectURL

  beforeEach(() => {
    localStorage.clear()
    // jsdom has no object-URL support.
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    URL.revokeObjectURL = originalRevoke
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('clears loaded images and annotations on log-out', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.addImages([IMAGE]))
    act(() => ctx.setShapes('i1', [{ id: 's', classId: 'c', points: [] }]))

    act(() => ctx.logout())

    expect(ctx.state.images).toEqual([])
    expect(ctx.state.shapesByImage).toEqual({})
    expect(ctx.state.currentImageId).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
  })

  it('keeps the chosen language and theme across a log-out', async () => {
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.setLang('en'))
    act(() => ctx.setTheme('dark'))

    act(() => ctx.logout())

    expect(ctx.state.lang).toBe('en')
    expect(ctx.state.theme).toBe('dark')
  })

  it('keeps the first consent time if consent is accepted again', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-01T10:00:00.000Z'))
    await setup()
    act(() => ctx.login('P-1', null))
    act(() => ctx.acceptConsent())

    vi.setSystemTime(new Date('2026-03-01T10:30:00.000Z'))
    act(() => ctx.acceptConsent())

    expect(ctx.state.survey.consentAcceptedAt).toBe('2026-03-01T10:00:00.000Z')
  })

  it('does not trust a stored completion without the answers to back it', async () => {
    const survey = {
      version: 'pre-1',
      consentAcceptedAt: '2026-01-01T10:00:00.000Z',
      answers: {},
      completedAt: '2026-01-01T10:05:00.000Z',
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', treatment: null, survey }))

    await setup()

    expect(ctx.state.survey.completedAt).toBeNull()
    expect(ctx.state.survey.consentAcceptedAt).toBe('2026-01-01T10:00:00.000Z')
  })
})

describe('survey state (creator variant)', () => {
  beforeEach(() => localStorage.clear())

  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    closeLink()
    vi.unstubAllEnvs()
  })

  it('ignores a saved session and never writes one', async () => {
    const survey = { version: 'pre-1', consentAcceptedAt: 'x', answers: {}, completedAt: 'y' }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1', survey }))
    const before = localStorage.getItem(SESSION_KEY)

    await setup('creator')
    act(() => ctx.acceptConsent())

    expect(ctx.state.survey.completedAt).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBe(before)
  })

  it('does not clear a saved session on log-out either', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ participantId: 'P-1' }))
    const before = localStorage.getItem(SESSION_KEY)

    await setup('creator')
    act(() => ctx.logout())

    expect(localStorage.getItem(SESSION_KEY)).toBe(before)
  })
})
