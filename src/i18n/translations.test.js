import { describe, expect, it } from 'vitest'
import study from '../config/study.json'
import { translations } from './translations'

// Pronouns and the common informal imperatives and verb forms.
const INFORMAL =
  /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|füge|zeichne|klicke|drücke|weise|ziehe|wähle|lade|lege|gib|prüfe|wechsle|öffne|entferne|versuche|nutze|fahre|benenne|lösche|wende|beantworte|kannst|bekommst|musst|hast|bist)\b/i

describe('translations', () => {
  it('has a German string for every English key', () => {
    const missing = Object.keys(translations.en).filter((key) => !(key in translations.de))

    expect(missing).toEqual([])
  })

  it('addresses the reader formally ("Sie") in every German string', () => {
    const offenders = Object.entries(translations.de)
      .filter(([, text]) => INFORMAL.test(text))
      .map(([key]) => key)

    expect(offenders).toEqual([])
  })

  it('addresses the reader formally in the German study instructions too', () => {
    expect(study.instructions.de).not.toMatch(INFORMAL)
  })

  it('has an English string for every German key', () => {
    const missing = Object.keys(translations.de).filter((key) => !(key in translations.en))

    expect(missing).toEqual([])
  })
})
