import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadActive(variant) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_VARIANT', variant)
  return import('./activeSurvey')
}

describe('active survey', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is the pre-study survey in the study variant', async () => {
    const { ACTIVE_SURVEY } = await loadActive('study')

    expect(ACTIVE_SURVEY.version).toBe('pre-1')
  })

  it('is the post-intervention survey in the post variant', async () => {
    const { ACTIVE_SURVEY } = await loadActive('post')

    expect(ACTIVE_SURVEY.version).toBe('post-1')
  })

  it('stays the pre-study survey for the creator, which has no survey of its own', async () => {
    const { ACTIVE_SURVEY } = await loadActive('creator')

    expect(ACTIVE_SURVEY.version).toBe('pre-1')
  })
})
