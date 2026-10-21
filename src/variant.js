// Which product this build is: the open Creator tool (default, and what the
// deployed site serves today), the locked Study tool, or the Post tool (the
// post-intervention survey only, no annotation). Chosen at build time
// via VITE_APP_VARIANT so all three ship from one codebase. Anything unrecognised
// falls back to creator, so a typo can never lock the deployed tool behind a
// login by accident.
const STUDY = 'study'
const POST = 'post'
const CREATOR = 'creator'

const requested = import.meta.env.VITE_APP_VARIANT
export const APP_VARIANT = requested === STUDY || requested === POST ? requested : CREATOR
export const isCreatorVariant = APP_VARIANT === CREATOR
export const isPostVariant = APP_VARIANT === POST
