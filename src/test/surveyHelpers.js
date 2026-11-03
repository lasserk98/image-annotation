import { PHASES } from '../phases'
import { CONSENT_TEXT } from '../survey/consentText'
import { surveySteps } from '../utils/survey'

// A participant arrives through the personal link from their email. The link
// is read once when the app module loads, so a test sets it before importing.
export function openLink(id, extra = '') {
  const query = id === null ? extra : `?id=${encodeURIComponent(id)}${extra}`
  window.history.replaceState({}, '', `/${query}`)
}

export function closeLink() {
  window.history.replaceState({}, '', '/')
}

// Valid raw answers (lowest value / first option) for every required item of a
// section, keyed by item id.
export function answersFor(section) {
  const answers = {}
  for (const item of section.items) {
    if (item.optional) continue
    answers[item.id] =
      item.type === 'number' ? item.min : item.type === 'choice' ? item.options[0].value : 1
  }
  return answers
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Answers every required item of a section the way a participant would, by
// clicking and typing. `rtl` is the Testing Library instance that rendered the
// app — tests that reset modules per test pass their freshly imported one, so
// events go through the same React.
export function fillSection({ fireEvent, screen, within }, section) {
  for (const item of section.items) {
    if (item.optional) continue
    if (item.type === 'number') {
      fireEvent.change(screen.getByLabelText(item.label), { target: { value: String(item.min) } })
      continue
    }
    const group = screen.getByRole('group', { name: new RegExp(escapeRegExp(item.text ?? item.label)) })
    fireEvent.click(within(group).getAllByRole('radio')[0])
  }
}

// Fills the page that is showing, then clicks Next on each page and Submit on
// the last one, so a test can walk the whole survey whatever its page layout.
// Pass `fromStep` to continue a survey that is already partly through, and
// `submitLabel` where the last button reads differently.
export function answerPages(rtl, definition, { fromStep = 0, submitLabel = 'Submit and start' } = {}) {
  const steps = surveySteps(definition)
  steps.slice(fromStep).forEach((step, i, rest) => {
    fillSection(rtl, step)
    const isLast = i === rest.length - 1
    rtl.fireEvent.click(rtl.screen.getByRole('button', { name: isLast ? submitLabel : 'Next' }))
  })
}

// Saves a session of `phase` in localStorage, as the app itself would have
// written it, so a test can start from any point in the entry flow:
// `{ consent: false }` → consent screen, `{ completed: false }` → survey,
// default → straight to the workspace. The link must carry the same ID (see
// `openLink`), or the app treats the session as someone else's.
export function seedSession(
  participantId = 'P-1',
  { consent = true, completed = true, phase = 'phase1' } = {},
) {
  const { survey: definition, sessionKey } = PHASES[phase]
  const isDone = consent && completed
  const survey = {
    version: definition.version,
    consentAcceptedAt: consent ? '2026-01-01T10:00:00.000Z' : null,
    consentVersion: consent ? CONSENT_TEXT.version : null,
    // A finished survey has every required answer; a stored "completed" flag
    // without them is treated as tampering and discarded when read back.
    answers: isDone ? Object.assign({}, ...definition.sections.map(answersFor)) : {},
    completedAt: isDone ? '2026-01-01T10:05:00.000Z' : null,
  }
  localStorage.setItem(sessionKey, JSON.stringify({ participantId, treatment: null, survey }))
}
