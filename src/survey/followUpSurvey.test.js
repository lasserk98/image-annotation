import { describe, expect, it } from 'vitest'
import { isSurveyComplete, surveySteps } from '../utils/survey'
import { FOLLOW_UP_SURVEY } from './followUpSurvey'
import { SCALES } from './scales'

const items = FOLLOW_UP_SURVEY.sections.flatMap((s) => s.items)

describe('follow-up survey (FBS)', () => {
  it('is the real questionnaire, no placeholder', () => {
    expect(FOLLOW_UP_SURVEY.version).toBe('followup-1')
    expect(JSON.stringify(FOLLOW_UP_SURVEY)).not.toMatch(/PLATZHALTER|placeholder/i)
  })

  it('has the five agreed statements on the agreement scale, in order', () => {
    expect(items.map((i) => i.id)).toEqual(['fu.1', 'fu.2', 'fu.3', 'fu.4', 'fu.5'])
    expect(items.every((i) => i.type === 'likert' && i.scale === 'agreement')).toBe(true)
    expect(items.every((i) => SCALES[i.scale])).toBe(true)
    expect(items[0].text).toBe(
      'Ich kann mich auch heute noch gut an die im Video gezeigten anatomischen Strukturen des Felsenbeins erinnern.',
    )
    expect(items[3].text).toMatch(/erneut angeschaut/)
  })

  it('asks one statement per page and every item is required', () => {
    expect(surveySteps(FOLLOW_UP_SURVEY)).toHaveLength(5)
    expect(isSurveyComplete(FOLLOW_UP_SURVEY, {})).toBe(false)
    expect(isSurveyComplete(FOLLOW_UP_SURVEY, { 'fu.1': 1, 'fu.2': 2, 'fu.3': 3, 'fu.4': 4, 'fu.5': 5 })).toBe(true)
  })

  it('has no field that could hold a correct answer', () => {
    expect(JSON.stringify(FOLLOW_UP_SURVEY)).not.toMatch(/correct|answerKey/i)
  })
})
