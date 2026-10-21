import { useEffect, useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import SurveyScreen from './SurveyScreen'
import { PRE_SURVEY } from '../survey/preSurvey'
import { answerPages, answersFor, fillSection } from '../test/surveyHelpers'

const [DEMO, PRE, MC] = PRE_SURVEY.sections

// Logs in and seeds answers before the survey mounts, so tests can start
// from a half-filled survey (the screen decides where to resume on mount).
function Seeded({ answers, children }) {
  const { login, setSurveyAnswer } = useApp()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    login('P-1', null)
    for (const [id, value] of Object.entries(answers)) setSurveyAnswer(id, value)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ready ? children : null
}

function Status() {
  const { state } = useApp()
  return (
    <p data-testid="status">
      {state.survey.completedAt ? 'DONE' : 'OPEN'}|{JSON.stringify(state.survey.answers['demo.age'] ?? null)}
    </p>
  )
}

function renderSurvey(answers = {}) {
  render(
    <AppProvider>
      <Seeded answers={answers}>
        <SurveyScreen />
        <Status />
      </Seeded>
    </AppProvider>,
  )
}

const fill = (section) => fillSection({ fireEvent, screen, within }, section)

const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }))

describe('SurveyScreen', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('starts with the demographics section and a progress indicator', () => {
    renderSurvey()

    expect(screen.getByRole('heading', { name: DEMO.title })).toBeInTheDocument()
    expect(screen.getByText('Part 1 of 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('shows the survey in German whatever the interface language', () => {
    renderSurvey()

    expect(screen.getByText('Wie regelmäßig nutzen sie KI-Tools?')).toBeInTheDocument()
    expect(screen.getByText('Alter')).toBeInTheDocument()
  })

  it('blocks Next while required answers are missing and says how many', () => {
    renderSurvey()

    next()

    expect(screen.getByRole('alert')).toHaveTextContent('Please answer all required questions (6 missing).')
    expect(screen.getByRole('heading', { name: DEMO.title })).toBeInTheDocument()
  })

  it('moves focus to the first unanswered question', () => {
    renderSurvey()

    next()

    expect(screen.getByLabelText('Alter')).toHaveFocus()
  })

  it('focuses the first option of a missed group and links the group to the error', () => {
    renderSurvey({ 'demo.age': 20, 'demo.gender': 'weiblich', 'demo.semester': 3 })

    next()

    const group = screen.getByRole('group', { name: /besuchen sie generell Vorlesungen/ })
    expect(within(group).getAllByRole('radio')[0]).toHaveFocus()
    expect(group).toHaveAccessibleDescription(/Please answer all required questions/)
  })

  it('limits how much text the free-text field accepts', () => {
    renderSurvey()

    expect(screen.getByLabelText(/Welche KI-Tools nutzen Sie/)).toHaveAttribute('maxlength', '500')
  })

  it('does not count the optional free-text item as missing', () => {
    renderSurvey()
    fill(DEMO)

    next()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: PRE.title })).toBeInTheDocument()
  })

  it('treats an out-of-range age as missing', () => {
    renderSurvey()
    fill(DEMO)
    fireEvent.change(screen.getByLabelText('Alter'), { target: { value: '5' } })

    next()

    expect(screen.getByRole('alert')).toHaveTextContent('(1 missing)')
  })

  it('keeps the answers when going back', () => {
    renderSurvey()
    fill(DEMO)
    next()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: DEMO.title })).toBeInTheDocument()
    expect(screen.getByLabelText('Alter')).toHaveValue(16)
  })

  it('shows the questionnaire one question at a time, in order', () => {
    renderSurvey(answersFor(DEMO))

    expect(screen.getByText('Part 2 of 3 · Question 1 of 10')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: new RegExp(PRE.items[0].topic) })).toBeInTheDocument()
    expect(screen.queryByText(PRE.items[1].topic)).not.toBeInTheDocument()

    fill({ items: [PRE.items[0]] })
    next()

    expect(screen.getByText('Part 2 of 3 · Question 2 of 10')).toBeInTheDocument()
    expect(screen.getByText(PRE.items[1].topic)).toBeInTheDocument()
    expect(screen.queryByText(PRE.items[0].topic)).not.toBeInTheDocument()
  })

  it('blocks Next on a question until it is answered', () => {
    renderSurvey(answersFor(DEMO))

    next()

    expect(screen.getByRole('alert')).toHaveTextContent('(1 missing)')
    expect(screen.getByText('Part 2 of 3 · Question 1 of 10')).toBeInTheDocument()
  })

  it('walks through all questions and submits at the end', () => {
    renderSurvey()

    answerPages({ fireEvent, screen, within }, PRE_SURVEY)

    expect(screen.getByTestId('status')).toHaveTextContent('DONE')
  })

  it('submits from the last knowledge question, not before', () => {
    renderSurvey({ ...answersFor(DEMO), ...answersFor(PRE) })

    expect(screen.getByRole('heading', { name: MC.title })).toBeInTheDocument()
    expect(screen.getByText('Part 3 of 3 · Question 1 of 10')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit and start' })).not.toBeInTheDocument()
  })

  it('does not submit with the last knowledge question unanswered', () => {
    renderSurvey({ ...answersFor(DEMO), ...answersFor(PRE) })
    for (const item of MC.items.slice(0, 9)) {
      fill({ items: [item] })
      next()
    }
    expect(screen.getByText('Part 3 of 3 · Question 10 of 10')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit and start' }))

    expect(screen.getByRole('alert')).toHaveTextContent('(1 missing)')
    expect(screen.getByTestId('status')).toHaveTextContent('OPEN')
  })

  it('shows the knowledge answers lettered A to E', () => {
    renderSurvey({ ...answersFor(DEMO), ...answersFor(PRE) })

    const group = screen.getByRole('group', { name: /mediale Begrenzung des Recessus facialis/ })

    expect(within(group).getAllByRole('radio').map((r) => r.closest('label').textContent.trim())).toEqual([
      'A) Chorda tympani',
      'B) Ambosskurzfortsatz (Fossa incudis)',
      'C) N. facialis (Pars mastoidea)',
      'D) Sinus sigmoideus',
      'E) Anulus tympanicus',
    ])
  })

  it('resumes at the first question that is still open', () => {
    const answered = Object.fromEntries(PRE.items.slice(0, 3).map((item) => [item.id, 1]))
    renderSurvey({ ...answersFor(DEMO), ...answered })

    expect(screen.getByRole('heading', { name: PRE.title })).toBeInTheDocument()
    expect(screen.getByText('Part 2 of 3 · Question 4 of 10')).toBeInTheDocument()
  })

  it('labels the Likert scale ends so the direction is clear', () => {
    renderSurvey(answersFor(DEMO))

    const group = screen.getByRole('group', { name: /helfen mir, mich anatomisch im Felsenbein/ })

    expect(within(group).getByText('stimmt voll zu')).toBeInTheDocument()
    expect(within(group).getByText('stimmt nicht zu')).toBeInTheDocument()
  })
})
