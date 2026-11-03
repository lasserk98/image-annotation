import { PHASES } from './phases'

// Which product this build is: the open Creator tool (default, and what the
// deployed site serves today) or one of the three study phases (phase1,
// phase2, phase3; see phases.js). Chosen at build time via VITE_APP_VARIANT so
// all four ship from one codebase. Anything unrecognised falls back to
// creator, so a typo can never lock the deployed tool behind a login by
// accident.
const CREATOR = 'creator'

const requested = import.meta.env.VITE_APP_VARIANT
// `hasOwn`, not `in`: a value like "constructor" must not count as a phase.
export const ACTIVE_PHASE = Object.hasOwn(PHASES, requested) ? PHASES[requested] : null
export const APP_VARIANT = ACTIVE_PHASE ? ACTIVE_PHASE.id : CREATOR
export const isCreatorVariant = APP_VARIANT === CREATOR
