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

    const { APP_VARIANT, ACTIVE_PHASE, isCreatorVariant } = await loadVariant()

    expect(APP_VARIANT).toBe('creator')
    expect(isCreatorVariant).toBe(true)
    expect(ACTIVE_PHASE).toBeNull()
  })

  it.each(['phase1', 'phase2', 'phase3'])('selects %s when configured, which is not the creator', async (phase) => {
    vi.stubEnv('VITE_APP_VARIANT', phase)

    const { APP_VARIANT, ACTIVE_PHASE, isCreatorVariant } = await loadVariant()

    expect(APP_VARIANT).toBe(phase)
    expect(isCreatorVariant).toBe(false)
    expect(ACTIVE_PHASE.id).toBe(phase)
  })

  it('gives each phase its own number', async () => {
    const numbers = []
    for (const phase of ['phase1', 'phase2', 'phase3']) {
      vi.stubEnv('VITE_APP_VARIANT', phase)
      numbers.push((await loadVariant()).ACTIVE_PHASE.number)
    }

    expect(numbers).toEqual([1, 2, 3])
  })

  it.each(['something-else', 'study', 'post', 'constructor', 'toString'])(
    'falls back to creator for %s, so a typo never locks the tool behind a login',
    async (value) => {
      vi.stubEnv('VITE_APP_VARIANT', value)

      const { APP_VARIANT, ACTIVE_PHASE } = await loadVariant()

      expect(APP_VARIANT).toBe('creator')
      expect(ACTIVE_PHASE).toBeNull()
    },
  )
})
