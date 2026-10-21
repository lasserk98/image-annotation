import { isPostVariant } from '../variant'
import { POST_SURVEY } from './postSurvey'
import { PRE_SURVEY } from './preSurvey'

// The survey this build asks. The post build asks the post-intervention
// survey; the study build asks the pre-study survey. The creator has no survey,
// so the pre-study one is only a harmless default there.
export const ACTIVE_SURVEY = isPostVariant ? POST_SURVEY : PRE_SURVEY
