import { describe, expect, it } from 'vitest'
import { isSurveyComplete, surveySteps } from '../utils/survey'
import { FOLLOW_UP_SURVEY } from './followUpSurvey'

describe('follow-up survey', () => {
  // The wording is still to come from the study owner. This test is meant to
  // be deleted together with the placeholder, so it cannot ship unnoticed.
  it('is still a placeholder: replace it with the real questionnaire before phase 3 goes out', () => {
    expect(FOLLOW_UP_SURVEY.version).toMatch(/placeholder/)
    expect(JSON.stringify(FOLLOW_UP_SURVEY)).toContain('PLATZHALTER')
  })

  it('is a valid survey the app can show and submit', () => {
    expect(surveySteps(FOLLOW_UP_SURVEY).length).toBeGreaterThan(0)
    expect(isSurveyComplete(FOLLOW_UP_SURVEY, {})).toBe(true)
  })

  it('has no field that could hold a correct answer', () => {
    expect(JSON.stringify(FOLLOW_UP_SURVEY)).not.toMatch(/correct|answerKey/i)
  })
})
