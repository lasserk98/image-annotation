// Which product this build is: the open Creator tool (default, and what the
// deployed site serves today) or the locked Study tool. Chosen at build time
// via VITE_APP_VARIANT so both ship from one codebase. Anything unrecognised
// falls back to creator, so a typo can never lock the deployed tool behind a
// login by accident.
const STUDY = 'study'
const CREATOR = 'creator'

export const APP_VARIANT = import.meta.env.VITE_APP_VARIANT === STUDY ? STUDY : CREATOR
export const isCreatorVariant = APP_VARIANT === CREATOR
