import { describe, expect, it } from 'vitest'
import { parseLinkParams } from './linkParams'

describe('parseLinkParams', () => {
  it('reads the participant ID and treatment from a personal link', () => {
    expect(parseLinkParams('?id=P-123&treatment=A')).toEqual({ id: 'P-123', treatment: 'A' })
  })

  it('has no ID when the link carries none', () => {
    expect(parseLinkParams('')).toEqual({ id: null, treatment: null })
    expect(parseLinkParams('?treatment=A').id).toBeNull()
  })

  it('trims whitespace around the values', () => {
    expect(parseLinkParams('?id=%20P-1%20&treatment=%20B%20')).toEqual({ id: 'P-1', treatment: 'B' })
  })

  it('treats an empty ID or treatment as missing', () => {
    expect(parseLinkParams('?id=&treatment=')).toEqual({ id: null, treatment: null })
    expect(parseLinkParams('?id=%20%20').id).toBeNull()
  })

  it.each([
    ['a path climb', '../etc'],
    ['a hidden-file name', '.secret'],
    ['spaces inside', 'P 1'],
    ['a slash', 'a/b'],
    ['markup', '<b>x</b>'],
    ['too many characters', 'x'.repeat(65)],
  ])('rejects an ID with %s', (_label, id) => {
    expect(parseLinkParams(`?id=${encodeURIComponent(id)}`).id).toBeNull()
  })

  it.each([
    ['spaces inside', 'group A'],
    ['markup', '<b>x</b>'],
    ['a slash', 'a/b'],
    ['too many characters', 'x'.repeat(33)],
  ])('ignores a treatment with %s, since it ends up in the exported file', (_label, treatment) => {
    expect(parseLinkParams(`?id=P-1&treatment=${encodeURIComponent(treatment)}`).treatment).toBeNull()
  })

  it('accepts short plain treatment names', () => {
    expect(parseLinkParams('?treatment=group_B-2').treatment).toBe('group_B-2')
  })

  it('accepts the characters a file name can safely hold', () => {
    expect(parseLinkParams('?id=P_1.2-3').id).toBe('P_1.2-3')
    expect(parseLinkParams(`?id=${'x'.repeat(64)}`).id).toHaveLength(64)
  })
})
