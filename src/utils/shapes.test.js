import { describe, expect, it } from 'vitest'
import { createShape } from './shapes'

const POINTS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
]

describe('createShape', () => {
  it('keeps the polygon and the class, and records when drawing began and ended', () => {
    const shape = createShape({
      classId: 'c1',
      points: POINTS,
      startedAt: '2026-11-03T10:00:00.000Z',
      finishedAt: '2026-11-03T10:00:12.500Z',
    })

    expect(shape).toMatchObject({
      classId: 'c1',
      points: POINTS,
      startedAt: '2026-11-03T10:00:00.000Z',
      finishedAt: '2026-11-03T10:00:12.500Z',
    })
    expect(shape.id).toMatch(/^shape-/)
  })

  it('gives every shape its own id', () => {
    const a = createShape({ classId: 'c1', points: POINTS, startedAt: 'x', finishedAt: 'y' })
    const b = createShape({ classId: 'c1', points: POINTS, startedAt: 'x', finishedAt: 'y' })

    expect(a.id).not.toBe(b.id)
  })

  it('copies the points, so later edits to the draft cannot change the shape', () => {
    const points = [...POINTS]
    const shape = createShape({ classId: 'c1', points, startedAt: 'x', finishedAt: 'y' })
    points.push({ x: 99, y: 99 })

    expect(shape.points).toHaveLength(3)
  })
})
