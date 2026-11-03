import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The variant is read at import time, so each test loads storage afresh under
// the variant it wants.
async function loadStorage(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  return import('./storage')
}

const KEYS = {
  phase1: 'seg-annotate:phase1-session',
  phase2: 'seg-annotate:phase2-session',
  phase3: 'seg-annotate:phase3-session',
}

describe('session storage per phase', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it.each(Object.entries(KEYS))('keeps the %s session under its own key', async (phase, key) => {
    const { saveSession } = await loadStorage(phase)

    saveSession({ participantId: 'P-1' })

    expect(JSON.parse(localStorage.getItem(key))).toEqual({ participantId: 'P-1' })
    const others = Object.values(KEYS).filter((other) => other !== key)
    expect(others.every((other) => localStorage.getItem(other) === null)).toBe(true)
  })

  it('does not let one phase see the session of another', async () => {
    localStorage.setItem(KEYS.phase1, JSON.stringify({ participantId: 'P-ONE' }))
    localStorage.setItem(KEYS.phase3, JSON.stringify({ participantId: 'P-THREE' }))
    const { loadSession } = await loadStorage('phase2')

    expect(loadSession()).toBeNull()
  })

  it('reads back what it saved', async () => {
    localStorage.setItem(KEYS.phase2, JSON.stringify({ participantId: 'P-TWO' }))
    const { loadSession } = await loadStorage('phase2')

    expect(loadSession()).toEqual({ participantId: 'P-TWO' })
  })

  it('clears only its own session', async () => {
    localStorage.setItem(KEYS.phase1, '{"participantId":"A"}')
    localStorage.setItem(KEYS.phase2, '{"participantId":"B"}')
    const { clearSession } = await loadStorage('phase2')

    clearSession()

    expect(localStorage.getItem(KEYS.phase2)).toBeNull()
    expect(localStorage.getItem(KEYS.phase1)).not.toBeNull()
  })
})
