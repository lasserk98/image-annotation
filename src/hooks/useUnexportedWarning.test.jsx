import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useUnexportedWarning } from './useUnexportedWarning'

const SHAPE = { id: 's1', classId: 'c1', points: [] }

// Fires the browser's "page is closing" event and says whether it asked the
// user to confirm leaving.
function tryToLeave() {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe('useUnexportedWarning', () => {
  it('does not warn while nothing has been drawn', () => {
    renderHook(() => useUnexportedWarning({ a: [] }))

    expect(tryToLeave()).toBe(false)
  })

  it('warns once shapes exist that were never exported', () => {
    renderHook(() => useUnexportedWarning({ a: [SHAPE] }))

    expect(tryToLeave()).toBe(true)
  })

  it('stops warning after an export, and warns again when a shape is added', () => {
    const first = { a: [SHAPE] }
    const { result, rerender } = renderHook(({ shapes }) => useUnexportedWarning(shapes), {
      initialProps: { shapes: first },
    })

    act(() => result.current())
    expect(tryToLeave()).toBe(false)

    rerender({ shapes: { a: [SHAPE, { ...SHAPE, id: 's2' }] } })
    expect(tryToLeave()).toBe(true)
  })

  it('does not warn again when only an image without shapes is added after an export', () => {
    const shapes = [SHAPE]
    const { result, rerender } = renderHook(({ byImage }) => useUnexportedWarning(byImage), {
      initialProps: { byImage: { a: shapes } },
    })
    act(() => result.current())

    rerender({ byImage: { a: shapes, b: [] } })

    expect(tryToLeave()).toBe(false)
  })

  it('stops listening when the component goes away', () => {
    const { unmount } = renderHook(() => useUnexportedWarning({ a: [SHAPE] }))

    unmount()

    expect(tryToLeave()).toBe(false)
  })
})
