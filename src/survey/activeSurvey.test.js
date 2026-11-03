import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadActive(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  return import('./activeSurvey')
}

describe('active survey', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is the pre-study survey in phase 1', async () => {
    const { ACTIVE_SURVEY } = await loadActive('phase1')

    expect(ACTIVE_SURVEY.version).toBe('pre-1')
  })

  it('is the post-intervention survey in phase 2', async () => {
    const { ACTIVE_SURVEY } = await loadActive('phase2')

    expect(ACTIVE_SURVEY.version).toBe('post-1')
  })

  it('is the follow-up survey in phase 3', async () => {
    const { ACTIVE_SURVEY } = await loadActive('phase3')

    expect(ACTIVE_SURVEY.version).toBe('followup-placeholder')
  })

  it('stays the pre-study survey for the creator, which has no survey of its own', async () => {
    const { ACTIVE_SURVEY } = await loadActive('creator')

    expect(ACTIVE_SURVEY.version).toBe('pre-1')
  })
})
