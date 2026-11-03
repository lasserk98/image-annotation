// A participant never types their ID: it comes from the personal link in their
// email (`…/phase1/?id=P-123`). It ends up in the exported file's name, so only
// characters that are safe in a file name are accepted, and it may not start
// with a dot (which would hide the file or climb a path).
const ID_PATTERN = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,63}$/
// The treatment is written into the exported file too, so a hand-edited link
// cannot put arbitrary text there either.
const TREATMENT_PATTERN = /^[A-Za-z0-9_-]{1,32}$/

export function parseLinkParams(search) {
  const params = new URLSearchParams(search)
  const id = (params.get('id') ?? '').trim()
  const treatment = (params.get('treatment') ?? '').trim()
  return {
    id: ID_PATTERN.test(id) ? id : null,
    treatment: TREATMENT_PATTERN.test(treatment) ? treatment : null,
  }
}

// Read once at import, like the app variant: the page is opened from one link.
export const LINK_PARAMS = parseLinkParams(
  typeof window === 'undefined' ? '' : window.location.search,
)
