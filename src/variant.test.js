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

  it('falls back to creator for an unknown value', async () => {
    vi.stubEnv('VITE_APP_VARIANT', 'something-else')

    const { APP_VARIANT } = await loadVariant()

    expect(APP_VARIANT).toBe('creator')
  })
})
