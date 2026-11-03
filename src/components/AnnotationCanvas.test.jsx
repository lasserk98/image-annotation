import { useEffect } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import AnnotationCanvas from './AnnotationCanvas'

// jsdom has no layout, so the canvas would fit the image into a 0-sized box.
const SIZE = { clientWidth: 800, clientHeight: 600 }

// Gives the provider an image and a class, and prints the drawn shapes.
function Setup() {
  const { state, addImages, addClass } = useApp()
  useEffect(() => {
    addImages([{ id: 'img-1', name: 'scan.png', url: 'blob:x', width: 800, height: 600 }])
    addClass({ id: 'c1', name: 'Nerve', color: '#ff0000' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <pre data-testid="shapes">{JSON.stringify(state.shapesByImage['img-1'] ?? [])}</pre>
}

const shapes = () => JSON.parse(screen.getByTestId('shapes').textContent)
const drawingArea = () => document.querySelector('[style*="crosshair"]')
const press = (key) => act(() => void fireEvent.keyDown(window, { key }))
const clickAt = (x, y, at) => {
  vi.setSystemTime(at)
  fireEvent.mouseDown(drawingArea(), { button: 0, clientX: x, clientY: y })
}

function renderCanvas() {
  render(
    <AppProvider>
      <Setup />
      <AnnotationCanvas />
    </AppProvider>,
  )
  press('n')
}

const T0 = new Date('2026-11-03T10:00:00.000Z')
const at = (seconds) => new Date(T0.getTime() + seconds * 1000)

describe('AnnotationCanvas timestamps', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    for (const [name, value] of Object.entries(SIZE)) {
      Object.defineProperty(HTMLElement.prototype, name, { configurable: true, value })
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    for (const name of Object.keys(SIZE)) delete HTMLElement.prototype[name]
    localStorage.clear()
  })

  it('records the first point and the Enter that finishes the shape', () => {
    renderCanvas()

    clickAt(100, 100, at(0))
    clickAt(300, 100, at(4))
    clickAt(300, 300, at(9))
    vi.setSystemTime(at(15))
    press('Enter')

    expect(shapes()).toHaveLength(1)
    expect(shapes()[0]).toMatchObject({
      classId: 'c1',
      startedAt: at(0).toISOString(),
      finishedAt: at(15).toISOString(),
    })
    expect(shapes()[0].points).toHaveLength(3)
  })

  it('records the click on the first point that closes the shape as its end', () => {
    renderCanvas()

    clickAt(100, 100, at(0))
    clickAt(300, 100, at(4))
    clickAt(300, 300, at(9))
    clickAt(100, 100, at(20))

    expect(shapes()).toHaveLength(1)
    expect(shapes()[0].points).toHaveLength(3)
    expect(shapes()[0].startedAt).toBe(at(0).toISOString())
    expect(shapes()[0].finishedAt).toBe(at(20).toISOString())
  })

  it('does not start the clock before the first point is placed', () => {
    renderCanvas()
    vi.setSystemTime(at(30))

    clickAt(100, 100, at(50))
    clickAt(300, 100, at(51))
    clickAt(300, 300, at(52))
    press('Enter')

    expect(shapes()[0].startedAt).toBe(at(50).toISOString())
  })

  it('restarts the clock when a cancelled drawing is begun again', () => {
    renderCanvas()
    clickAt(100, 100, at(0))
    press('Escape')
    press('n')

    clickAt(100, 100, at(60))
    clickAt(300, 100, at(61))
    clickAt(300, 300, at(62))
    press('Enter')

    expect(shapes()).toHaveLength(1)
    expect(shapes()[0].startedAt).toBe(at(60).toISOString())
  })

  it('restarts the clock when Backspace removes every point', () => {
    renderCanvas()
    clickAt(100, 100, at(0))
    press('Backspace')

    clickAt(100, 100, at(40))
    clickAt(300, 100, at(41))
    clickAt(300, 300, at(42))
    press('Enter')

    expect(shapes()[0].startedAt).toBe(at(40).toISOString())
  })

  it('keeps the original clock when only a later point is taken back', () => {
    renderCanvas()
    clickAt(100, 100, at(0))
    clickAt(300, 100, at(4))
    press('Backspace')

    clickAt(300, 100, at(8))
    clickAt(300, 300, at(9))
    press('Enter')

    expect(shapes()[0].startedAt).toBe(at(0).toISOString())
  })
})
