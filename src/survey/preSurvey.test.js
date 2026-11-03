import { describe, expect, it } from 'vitest'
import { PRE_SURVEY } from './preSurvey'
import { SCALES } from './scales'

const sections = PRE_SURVEY.sections
const itemsOf = (id) => sections.find((s) => s.id === id).items
const allItems = sections.flatMap((s) => s.items)

// Anything shaped like an answer key or scoring would not belong in this
// public repo: scoring happens later, outside it. Property names are checked
// (not wording), so question text can still use these words.
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

describe('pre-survey definition', () => {
  it('has a version and the three sections in the agreed order', () => {
    expect(PRE_SURVEY.version).toBe('pre-1')
    expect(sections.map((s) => s.id)).toEqual(['demo', 'pre', 'mc'])
  })

  it('has 7 demographic fields, 10 questionnaire items and 10 knowledge questions', () => {
    expect(itemsOf('demo')).toHaveLength(7)
    expect(itemsOf('pre')).toHaveLength(10)
    expect(itemsOf('mc')).toHaveLength(10)
  })

  it('uses unique, stable item ids', () => {
    const ids = allItems.map((i) => i.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(itemsOf('pre').map((i) => i.id)).toEqual(
      Array.from({ length: 10 }, (_, n) => `pre.${n + 1}`),
    )
    expect(itemsOf('mc').map((i) => i.id)).toEqual(
      Array.from({ length: 10 }, (_, n) => `mc.${n + 1}`),
    )
  })

  it('tells participants how to answer the questionnaire before they have seen the video', () => {
    const pre = sections.find((s) => s.id === 'pre')

    expect(pre.intro).toBe(
      'Antworten Sie anhand Ihrer bisherigen Erfahrungen mit anderen KI-Tools, wenn Sie bisher nicht mit KI-augmentierten Videos gearbeitet haben. (Ihre Vermutung vor dem Nutzen des Lehrvideos)',
    )
  })

  it('asks for age, gender and semester first', () => {
    const [age, gender, semester] = itemsOf('demo')

    expect(age).toMatchObject({ id: 'demo.age', type: 'number', min: 16, max: 99 })
    expect(gender.id).toBe('demo.gender')
    expect(gender.options.map((o) => o.label)).toEqual([
      'weiblich',
      'männlich',
      'divers',
      'keine Angabe',
    ])
    expect(semester).toMatchObject({ id: 'demo.semester', type: 'number', min: 1, max: 20 })
  })

  it('gives every Likert item a defined five-point scale', () => {
    const likert = allItems.filter((i) => i.type === 'likert')

    expect(likert.length).toBeGreaterThanOrEqual(13)
    for (const item of likert) {
      expect(SCALES[item.scale], item.id).toBeDefined()
      expect(SCALES[item.scale].max - SCALES[item.scale].min + 1).toBe(5)
    }
  })

  it('uses the agreement scale, 1 = agree fully, for all questionnaire items', () => {
    for (const item of itemsOf('pre')) {
      expect(item.scale).toBe('agreement')
    }
    expect(SCALES.agreement.labels[1]).toBe('stimmt voll zu')
    expect(SCALES.agreement.labels[5]).toBe('stimmt nicht zu')
  })

  it('offers exactly the options A to E on every knowledge question', () => {
    for (const question of itemsOf('mc')) {
      expect(question.type).toBe('choice')
      expect(question.options.map((o) => o.value)).toEqual(['A', 'B', 'C', 'D', 'E'])
      for (const option of question.options) expect(option.label.trim()).not.toBe('')
    }
  })

  it('keeps the source wording of the first and last knowledge questions', () => {
    const [first] = itemsOf('mc')
    const last = itemsOf('mc')[9]

    expect(first.text).toBe(
      'Welche Struktur bildet die mediale Begrenzung des Recessus facialis (posteriore Tympanotomie)?',
    )
    expect(first.options[2].label).toBe('N. facialis (Pars mastoidea)')
    expect(last.options[1].label).toBe('Retroaurikulärer Schnitt')
  })

  it('makes only the AI tools free text optional', () => {
    expect(allItems.filter((i) => i.optional).map((i) => i.id)).toEqual(['demo.aiTools'])
  })

  it('contains no property that could hold an answer key or a score', () => {
    const offending = propertyNames(PRE_SURVEY).filter((name) => KEY_LIKE.test(name))

    expect(offending).toEqual([])
  })
})
