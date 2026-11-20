import { describe, expect, it } from 'vitest'
import { projectOntoSegment } from './geometry'

const A = { x: 0, y: 0 }
const B = { x: 10, y: 0 }

describe('projectOntoSegment', () => {
  it('drops a point beside the segment onto it', () => {
    expect(projectOntoSegment({ x: 4, y: 3 }, A, B)).toEqual({ x: 4, y: 0 })
  })

  it('returns a point already on the segment unchanged', () => {
    expect(projectOntoSegment({ x: 7, y: 0 }, A, B)).toEqual({ x: 7, y: 0 })
  })

  it('clamps to the nearer end when the point lies beyond the segment', () => {
    expect(projectOntoSegment({ x: -5, y: 2 }, A, B)).toEqual({ x: 0, y: 0 })
    expect(projectOntoSegment({ x: 15, y: -2 }, A, B)).toEqual({ x: 10, y: 0 })
  })

  it('works on a slanted segment', () => {
    const diagonal = { x: 10, y: 10 }

    expect(projectOntoSegment({ x: 0, y: 10 }, A, diagonal)).toEqual({ x: 5, y: 5 })
  })

  it('returns the start for a zero-length segment', () => {
    expect(projectOntoSegment({ x: 3, y: 4 }, A, A)).toEqual({ x: 0, y: 0 })
  })
})
