import { describe, expect, it } from 'vitest'
import { POST_SURVEY } from './postSurvey'
import { SCALES } from './scales'

const sections = POST_SURVEY.sections
const itemsOf = (id) => sections.find((s) => s.id === id).items
const allItems = sections.flatMap((s) => s.items)

// Same guard as the pre-survey: anything shaped like an answer key or scoring
// does not belong in this public repo. Property names are checked, not wording.
const KEY_LIKE = /correct|answer|solution|score|richtig|loesung|lösung/i

function propertyNames(value, found = []) {
  if (Array.isArray(value)) {
    value.forEach((v) => propertyNames(v, found))
  } else if (value && typeof value === 'object') {
    for (const [name, child] of Object.entries(value)) {
      found.push(name)
      propertyNames(child, found)
    }
  }
  return found
}

describe('post-survey definition', () => {
  it('has a version and the three sections in the agreed order', () => {
    expect(POST_SURVEY.version).toBe('post-1')
    expect(sections.map((s) => s.id)).toEqual(['post', 'ai', 'conv'])
  })

  it('has 10 questionnaire items, 5 AI-video ratings and 3 conventional-video ratings', () => {
    expect(itemsOf('post').map((i) => i.id)).toEqual(Array.from({ length: 10 }, (_, n) => `post.${n + 1}`))
    expect(itemsOf('ai').map((i) => i.id)).toEqual(['ai.1', 'ai.2', 'ai.3', 'ai.4', 'ai.5'])
    expect(itemsOf('conv').map((i) => i.id)).toEqual(['conv.1', 'conv.2', 'conv.3'])
  })

  it('shows every section one question at a time', () => {
    expect(sections.every((s) => s.perItem === true)).toBe(true)
  })

  it('uses unique item ids and makes every item required', () => {
    const ids = allItems.map((i) => i.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(allItems.some((i) => i.optional)).toBe(false)
  })

  it('makes every item a Likert item on a defined scale', () => {
    for (const item of allItems) {
      expect(item.type, item.id).toBe('likert')
      expect(SCALES[item.scale], item.id).toBeDefined()
    }
  })

  it('rates the questionnaire on the five-point agreement scale', () => {
    expect(itemsOf('post').every((i) => i.scale === 'agreement')).toBe(true)
  })

  it('rates both videos in school grades 1 to 6', () => {
    for (const item of [...itemsOf('ai'), ...itemsOf('conv')]) {
      expect(item.scale, item.id).toBe('grade')
    }
    expect(SCALES.grade.max - SCALES.grade.min + 1).toBe(6)
    expect(SCALES.grade.labels[1]).toBe('sehr gut')
    expect(SCALES.grade.labels[6]).toBe('ungenügend')
  })

  it('keeps the wording of the first and last questionnaire items', () => {
    const [first] = itemsOf('post')
    const last = itemsOf('post').at(-1)

    expect(first.topic).toBe('Anatomische Orientierung')
    expect(first.text).toBe(
      'Die KI-augmentierten OP-Lehrvideos haben mir geholfen, mich anatomisch am Felsenbein besser zu orientieren.',
    )
    expect(last.topic).toBe('Gesamteinschätzung des Mehrwerts')
  })

  it('keeps the wording of the rating questions', () => {
    expect(itemsOf('ai')[0].topic).toBe('Bild-/Videoqualität')
    expect(itemsOf('ai')[0].text).toMatch(/^Wie bewerten Sie die Bildqualität des Videos/)
    expect(itemsOf('ai')[3].topic).toBe('Synchronität der Annotationen')
    expect(itemsOf('conv')[2].topic).toBe('Gesamtqualität')
    expect(itemsOf('conv')[2].text).toBe('Wie bewerten Sie das Lehrvideo insgesamt?')
  })

  it('titles the rating blocks as in the study material and states the grade scale', () => {
    const [, ai, conv] = sections

    expect(ai.title).toBe('Qualitätsbewertung des KI-augmentierten Lehrvideos (Schulnoten 1–6)')
    expect(conv.title).toBe('Qualitätsbewertung des konventionellen Lehrvideos (Schulnoten 1–6)')
    expect(ai.intro).toMatch(/^Bewertungsskala: 1 = sehr gut/)
  })

  it('contains no property that could hold an answer key or a score', () => {
    const offending = propertyNames(POST_SURVEY).filter((name) => KEY_LIKE.test(name))

    expect(offending).toEqual([])
  })
})
