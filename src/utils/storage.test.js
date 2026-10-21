import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The variant is read at import time, so each test loads storage afresh under
// the variant it wants.
async function loadStorage(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  return import('./storage')
}

describe('session storage per variant', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('keeps the study session under its original key', async () => {
    const { saveSession } = await loadStorage('study')

    saveSession({ participantId: 'P-1' })

    expect(JSON.parse(localStorage.getItem('seg-annotate:session'))).toEqual({ participantId: 'P-1' })
  })

  it('keeps the post session under its own key', async () => {
    const { saveSession } = await loadStorage('post')

    saveSession({ participantId: 'P-1' })

    expect(JSON.parse(localStorage.getItem('seg-annotate:post-session'))).toEqual({ participantId: 'P-1' })
    expect(localStorage.getItem('seg-annotate:session')).toBeNull()
  })

  it('does not let the post variant see a study session', async () => {
    localStorage.setItem('seg-annotate:session', JSON.stringify({ participantId: 'P-STUDY' }))
    const { loadSession } = await loadStorage('post')

    expect(loadSession()).toBeNull()
  })

  it('does not let the study variant see a post session', async () => {
    localStorage.setItem('seg-annotate:post-session', JSON.stringify({ participantId: 'P-POST' }))
    const { loadSession } = await loadStorage('study')

    expect(loadSession()).toBeNull()
  })

  it('clears only its own session', async () => {
    localStorage.setItem('seg-annotate:session', '{"participantId":"S"}')
    localStorage.setItem('seg-annotate:post-session', '{"participantId":"P"}')
    const { clearSession } = await loadStorage('post')

    clearSession()

    expect(localStorage.getItem('seg-annotate:post-session')).toBeNull()
    expect(localStorage.getItem('seg-annotate:session')).not.toBeNull()
  })
})
