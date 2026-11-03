import { FOLLOW_UP_SURVEY } from './survey/followUpSurvey'
import { POST_SURVEY } from './survey/postSurvey'
import { PRE_SURVEY } from './survey/preSurvey'

export const PHASE_COUNT = 3

// The study is three pages, one per phase, each built and served on its own
// (`<site>/phase1/` …). Every phase is the same flow — password, [consent],
// survey, annotate one image, export — and only differs by what is below.
//
// - `sessionKey`: all phases share one site origin, so each keeps its progress
//   under its own key and can never read another phase's.
// - `passwordKey`: the field in study.json holding that phase's password.
// - `imageName`: the name (without extension) of the image the participant
//   downloads for this phase, shown as a hint and checked against what they
//   load; null until it is decided.
export const PHASES = {
  phase1: {
    id: 'phase1',
    number: 1,
    survey: PRE_SURVEY,
    hasConsent: true,
    passwordKey: 'phase1Password',
    sessionKey: 'seg-annotate:phase1-session',
    expectedImages: 1,
    imageName: 'phase1',
  },
  phase2: {
    id: 'phase2',
    number: 2,
    survey: POST_SURVEY,
    hasConsent: false,
    passwordKey: 'phase2Password',
    sessionKey: 'seg-annotate:phase2-session',
    expectedImages: 1,
    imageName: 'phase2',
  },
  phase3: {
    id: 'phase3',
    number: 3,
    survey: FOLLOW_UP_SURVEY,
    hasConsent: false,
    passwordKey: 'phase3Password',
    sessionKey: 'seg-annotate:phase3-session',
    expectedImages: 1,
    imageName: null,
  },
}
