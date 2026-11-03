import { describe, expect, it } from 'vitest'
import {
  emptySurvey,
  firstIncompleteStep,
  isAnswered,
  isSectionComplete,
  isSurveyComplete,
  missingItemIds,
  sanitizeSurvey,
  surveySteps,
} from './survey'

const NUMBER = { id: 'n', type: 'number', min: 1, max: 10 }
const CHOICE = { id: 'c', type: 'choice', options: [{ value: 'A', label: 'a' }, { value: 'B', label: 'b' }] }
const LIKERT = { id: 'l', type: 'likert', scale: 'agreement' }
const OPTIONAL_TEXT = { id: 't', type: 'text', optional: true }
const REQUIRED_TEXT = { id: 'r', type: 'text' }

const FIRST = { id: 'one', items: [NUMBER, OPTIONAL_TEXT] }
const SECOND = { id: 'two', items: [CHOICE, LIKERT] }
const DEFINITION = { version: 'v1', sections: [FIRST, SECOND] }

describe('isAnswered', () => {
  it('accepts a whole number inside the range', () => {
    expect(isAnswered(NUMBER, 5)).toBe(true)
    expect(isAnswered(NUMBER, 1)).toBe(true)
    expect(isAnswered(NUMBER, 10)).toBe(true)
  })

  it.each([0, 11, 2.5, '5', NaN, null, undefined])('rejects %s for a number field', (value) => {
    expect(isAnswered(NUMBER, value)).toBe(false)
  })

  it('accepts only a listed option for a choice', () => {
    expect(isAnswered(CHOICE, 'A')).toBe(true)
    expect(isAnswered(CHOICE, 'Z')).toBe(false)
    expect(isAnswered(CHOICE, null)).toBe(false)
  })

  it('accepts only values on the scale for a Likert item', () => {
    for (const v of [1, 2, 3, 4, 5]) expect(isAnswered(LIKERT, v)).toBe(true)
    expect(isAnswered(LIKERT, 0)).toBe(false)
    expect(isAnswered(LIKERT, 6)).toBe(false)
  })

  it('needs non-blank text for a required text item', () => {
    expect(isAnswered(REQUIRED_TEXT, 'ChatGPT')).toBe(true)
    expect(isAnswered(REQUIRED_TEXT, '   ')).toBe(false)
    expect(isAnswered(REQUIRED_TEXT, undefined)).toBe(false)
  })
})

describe('missingItemIds', () => {
  it('lists every unanswered required item in order', () => {
    expect(missingItemIds(SECOND, {})).toEqual(['c', 'l'])
  })

  it('never lists an optional item', () => {
    expect(missingItemIds(FIRST, { n: 3 })).toEqual([])
  })

  it('leaves out items that are answered', () => {
    expect(missingItemIds(SECOND, { c: 'B' })).toEqual(['l'])
  })

  it('treats an invalid stored value as missing', () => {
    expect(missingItemIds(FIRST, { n: 99 })).toEqual(['n'])
  })
})

describe('section and survey completeness', () => {
  it('knows when a section is complete', () => {
    expect(isSectionComplete(FIRST, { n: 4 })).toBe(true)
    expect(isSectionComplete(SECOND, { c: 'A' })).toBe(false)
  })

  it('is complete only when every section is', () => {
    expect(isSurveyComplete(DEFINITION, { n: 4, c: 'A', l: 2 })).toBe(true)
    expect(isSurveyComplete(DEFINITION, { n: 4, c: 'A' })).toBe(false)
  })

  it('finds the first step that still has gaps', () => {
    const steps = surveySteps(DEFINITION)

    expect(firstIncompleteStep(steps, {})).toBe(0)
    expect(firstIncompleteStep(steps, { n: 4 })).toBe(1)
  })

  it('points at the last step when everything is answered', () => {
    const steps = surveySteps(DEFINITION)

    expect(firstIncompleteStep(steps, { n: 4, c: 'A', l: 2 })).toBe(steps.length - 1)
  })
})

describe('surveySteps', () => {
  it('shows a normal section as one step with all its items', () => {
    const steps = surveySteps(DEFINITION)

    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({ section: FIRST, items: FIRST.items, sectionIndex: 0, question: null })
  })

  it('splits a per-item section into one step per item, in order', () => {
    const perItem = { ...SECOND, perItem: true }
    const steps = surveySteps({ version: 'v1', sections: [FIRST, perItem] })

    expect(steps.map((s) => s.items.map((i) => i.id))).toEqual([['n', 't'], ['c'], ['l']])
    expect(steps[1]).toMatchObject({ sectionIndex: 1, question: { n: 1, total: 2 } })
    expect(steps[2]).toMatchObject({ sectionIndex: 1, question: { n: 2, total: 2 } })
  })

  it('lets a single-item step be checked like a section', () => {
    const perItem = { ...SECOND, perItem: true }
    const steps = surveySteps({ version: 'v1', sections: [perItem] })

    expect(missingItemIds(steps[0], { l: 3 })).toEqual(['c'])
    expect(missingItemIds(steps[1], { l: 3 })).toEqual([])
  })
})

describe('emptySurvey and sanitizeSurvey', () => {
  it('starts with no consent, no answers and not completed', () => {
    expect(emptySurvey('v1')).toEqual({
      version: 'v1',
      consentAcceptedAt: null,
      consentVersion: null,
      answers: {},
      completedAt: null,
    })
  })

  it('keeps a well-formed saved survey', () => {
    const saved = {
      version: 'v1',
      consentAcceptedAt: '2026-01-01T10:00:00.000Z',
      consentVersion: 'consent-1',
      answers: { n: 3 },
      completedAt: null,
    }

    expect(sanitizeSurvey(saved, DEFINITION)).toEqual(saved)
  })

  it('reads a survey saved without a consent version as having none', () => {
    const saved = { version: 'v1', consentAcceptedAt: 'x', answers: {}, completedAt: null }

    expect(sanitizeSurvey(saved, DEFINITION).consentVersion).toBeNull()
  })

  it.each([null, undefined, 'text', 5, []])('falls back to empty for %s', (raw) => {
    expect(sanitizeSurvey(raw, DEFINITION)).toEqual(emptySurvey('v1'))
  })

  it('falls back to empty when the version does not match', () => {
    const saved = { version: 'old', consentAcceptedAt: 'x', answers: { n: 3 }, completedAt: null }

    expect(sanitizeSurvey(saved, DEFINITION)).toEqual(emptySurvey('v1'))
  })

  it('drops answers that are not an object and non-string timestamps', () => {
    const saved = { version: 'v1', consentAcceptedAt: 12, consentVersion: 3, answers: 'nope', completedAt: {} }

    expect(sanitizeSurvey(saved, DEFINITION)).toEqual(emptySurvey('v1'))
  })

  it('keeps only known item ids whose values are valid', () => {
    const saved = {
      version: 'v1',
      consentAcceptedAt: null,
      answers: { n: 3, c: 'Z', l: 9, unknown: 1, __proto__: { x: 1 } },
      completedAt: null,
    }

    expect(sanitizeSurvey(saved, DEFINITION).answers).toEqual({ n: 3 })
  })

  it('drops a completion time when required answers are missing', () => {
    const saved = { version: 'v1', consentAcceptedAt: 'x', answers: {}, completedAt: '2026-01-01T10:05:00.000Z' }

    expect(sanitizeSurvey(saved, DEFINITION).completedAt).toBeNull()
  })

  it('keeps a completion time when every required answer is valid', () => {
    const saved = {
      version: 'v1',
      consentAcceptedAt: 'x',
      answers: { n: 4, c: 'A', l: 2 },
      completedAt: '2026-01-01T10:05:00.000Z',
    }

    expect(sanitizeSurvey(saved, DEFINITION).completedAt).toBe('2026-01-01T10:05:00.000Z')
  })
})
