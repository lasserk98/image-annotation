import { describe, expect, it } from 'vitest'
import { translations } from './translations'

describe('translations', () => {
  it('has a German string for every English key', () => {
    const missing = Object.keys(translations.en).filter((key) => !(key in translations.de))

    expect(missing).toEqual([])
  })

  it('has an English string for every German key', () => {
    const missing = Object.keys(translations.de).filter((key) => !(key in translations.en))

    expect(missing).toEqual([])
  })
})
