import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadVariant() {
  vi.resetModules()
  return import('./variant')
}

describe('app variant', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to the creator variant when nothing is configured', async () => {
    vi.stubEnv('VITE_APP_VARIANT', '')

    const { APP_VARIANT, isCreatorVariant } = await loadVariant()

    expect(APP_VARIANT).toBe('creator')
    expect(isCreatorVariant).toBe(true)
  })

  it('selects the study variant when configured', async () => {
    vi.stubEnv('VITE_APP_VARIANT', 'study')

    const { APP_VARIANT, isCreatorVariant } = await loadVariant()

    expect(APP_VARIANT).toBe('study')
    expect(isCreatorVariant).toBe(false)
  })

  it('selects the post variant when configured, which is not the creator', async () => {
    vi.stubEnv('VITE_APP_VARIANT', 'post')

    const { APP_VARIANT, isCreatorVariant, isPostVariant } = await loadVariant()

    expect(APP_VARIANT).toBe('post')
    expect(isCreatorVariant).toBe(false)
    expect(isPostVariant).toBe(true)
  })

  it('is not the post variant for creator or study', async () => {
    for (const value of ['', 'study']) {
      vi.stubEnv('VITE_APP_VARIANT', value)

      const { isPostVariant } = await loadVariant()

      expect(isPostVariant).toBe(false)
    }
  })

  it('falls back to creator for an unknown value', async () => {
    vi.stubEnv('VITE_APP_VARIANT', 'something-else')

    const { APP_VARIANT } = await loadVariant()

    expect(APP_VARIANT).toBe('creator')
  })
})
