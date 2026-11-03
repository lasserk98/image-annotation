import { describe, expect, it } from 'vitest'
import study from './config/study.json'
import { PHASE_COUNT, PHASES } from './phases'
import { POST_SURVEY } from './survey/postSurvey'
import { PRE_SURVEY } from './survey/preSurvey'

const phaseList = Object.values(PHASES)

describe('study phases', () => {
  it('has three phases, numbered in order', () => {
    expect(PHASE_COUNT).toBe(3)
    expect(Object.keys(PHASES)).toEqual(['phase1', 'phase2', 'phase3'])
    expect(phaseList.map((p) => p.number)).toEqual([1, 2, 3])
    expect(phaseList.map((p) => p.id)).toEqual(['phase1', 'phase2', 'phase3'])
  })

  it('asks for consent only in the first phase', () => {
    expect(phaseList.map((p) => p.hasConsent)).toEqual([true, false, false])
  })

  it('asks the pre-survey, then the post-survey, then the follow-up survey', () => {
    expect(PHASES.phase1.survey).toBe(PRE_SURVEY)
    expect(PHASES.phase2.survey).toBe(POST_SURVEY)
    expect(PHASES.phase3.survey.version).not.toBe(PRE_SURVEY.version)
    expect(PHASES.phase3.survey.version).not.toBe(POST_SURVEY.version)
  })

  it('keeps every phase session apart, since all phases share one site origin', () => {
    const keys = phaseList.map((p) => p.sessionKey)

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has a distinct, non-empty password per phase in the study config', () => {
    const passwords = phaseList.map((p) => study[p.passwordKey])

    expect(passwords.every((password) => typeof password === 'string' && password !== '')).toBe(true)
    expect(new Set(passwords).size).toBe(passwords.length)
  })

  it('expects one image per phase', () => {
    expect(phaseList.map((p) => p.expectedImages)).toEqual([1, 1, 1])
  })

  it('names the image to load in the first two phases; the follow-up image is not decided yet', () => {
    expect(PHASES.phase1.imageName).toBe('phase1')
    expect(PHASES.phase2.imageName).toBe('phase2')
    expect(PHASES.phase3.imageName).toBeNull()
  })
})
