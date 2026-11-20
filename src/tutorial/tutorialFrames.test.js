import { describe, expect, it } from 'vitest'
import { translations } from '../i18n/translations'
import { CAT_OUTLINE, FIGURE_SIZE, TUTORIAL_FRAMES } from './tutorialFrames'

describe('tutorialFrames', () => {
  it('has a title and a text in both languages for every frame', () => {
    for (const lang of ['en', 'de']) {
      for (const { id } of TUTORIAL_FRAMES) {
        expect(translations[lang][`tutorial.${id}.title`], `${lang} ${id} title`).toBeTruthy()
        expect(translations[lang][`tutorial.${id}.text`], `${lang} ${id} text`).toBeTruthy()
      }
    }
  })

  it('has unique frame ids', () => {
    const ids = TUTORIAL_FRAMES.map((f) => f.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every outline vertex inside the figure', () => {
    for (const { x, y } of CAT_OUTLINE) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(FIGURE_SIZE.width)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(FIGURE_SIZE.height)
    }
  })

  it('never shows more vertices than the outline has', () => {
    for (const frame of TUTORIAL_FRAMES.filter((f) => f.shape === 'open')) {
      expect(frame.count).toBeGreaterThan(0)
      expect(frame.count).toBeLessThanOrEqual(CAT_OUTLINE.length)
    }
  })
})
