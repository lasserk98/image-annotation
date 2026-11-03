import { ACTIVE_PHASE } from '../variant'
import { PRE_SURVEY } from './preSurvey'

// The survey this build asks: the one of its phase. The creator has no survey,
// so the pre-study one is only a harmless default there.
export const ACTIVE_SURVEY = ACTIVE_PHASE?.survey ?? PRE_SURVEY
