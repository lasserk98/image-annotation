import { useEffect } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import AnnotationCanvas from './AnnotationCanvas'

// jsdom has no layout: give the canvas a box so the image can be fitted. The
// view scales the image, so expectations are derived from the drawn points
// (screen and image space are linearly related) instead of hard-coded.
const SIZE = { clientWidth: 800, clientHeight: 600 }

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
const area = () => document.querySelector('[style*="crosshair"], [style*="grab"]')
const edges = () => [...document.querySelectorAll('line[style*="copy"]')]
const vertices = () => [...document.querySelectorAll('circle[style*="grab"]')]
const press = (key) => act(() => void fireEvent.keyDown(window, { key }))

// Draws a triangle; finishing it selects the new shape.
function drawTriangle() {
  render(
    <AppProvider>
      <Setup />
      <AnnotationCanvas />
    </AppProvider>,
  )
  press('n')
  for (const [x, y] of [[100, 100], [300, 100], [300, 300]]) {
    fireEvent.mouseDown(area(), { button: 0, clientX: x, clientY: y })
  }
  press('Enter')
}

// A real double click: press and release twice, then `dblclick`. Like a
// browser, each event goes to whatever is under the pointer at that moment, so
// if the edge disappeared after the first press the later events miss it.
function doubleClickEdge(index, x, y) {
  const pos = { button: 0, clientX: x, clientY: y }
  const target = () => edges()[index] ?? area()
  for (let press = 0; press < 2; press += 1) {
    fireEvent.mouseDown(target(), pos)
    fireEvent.mouseUp(window, pos)
    fireEvent.click(target(), pos)
  }
  fireEvent.doubleClick(target(), pos)
}

describe('inserting a vertex by double-clicking an edge', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    for (const [name, value] of Object.entries(SIZE)) {
      Object.defineProperty(HTMLElement.prototype, name, { configurable: true, value })
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    for (const name of Object.keys(SIZE)) delete HTMLElement.prototype[name]
    localStorage.clear()
  })

  it('keeps the shape selected while the edge is pressed', () => {
    drawTriangle()
    expect(edges()).toHaveLength(3)

    fireEvent.mouseDown(edges()[0], { button: 0, clientX: 200, clientY: 100 })

    expect(edges()).toHaveLength(3)
    expect(vertices()).toHaveLength(3)
  })

  it('inserts a vertex on the edge and keeps the shape selected', () => {
    drawTriangle()
    const [a, b] = shapes()[0].points

    doubleClickEdge(0, 200, 100)

    const { points } = shapes()[0]
    expect(points).toHaveLength(4)
    expect(points[1].x).toBeCloseTo((a.x + b.x) / 2)
    expect(points[1].y).toBeCloseTo(a.y)
    expect(vertices()).toHaveLength(4)
  })

  it('places the vertex exactly on the edge even if the click is a few pixels off', () => {
    drawTriangle()
    const [a, b] = shapes()[0].points

    doubleClickEdge(0, 200, 104)

    expect(shapes()[0].points[1].x).toBeCloseTo((a.x + b.x) / 2)
    expect(shapes()[0].points[1].y).toBeCloseTo(a.y)
  })

  it('inserts on the closing edge between the last and the first vertex', () => {
    drawTriangle()
    const [first, , last] = shapes()[0].points

    doubleClickEdge(2, 200, 200)

    const { points } = shapes()[0]
    expect(points).toHaveLength(4)
    expect(points[3].x).toBeCloseTo((first.x + last.x) / 2)
    expect(points[3].y).toBeCloseTo((first.y + last.y) / 2)
  })

  it('can insert several vertices in a row', () => {
    drawTriangle()

    doubleClickEdge(0, 200, 100)
    doubleClickEdge(0, 150, 100)

    expect(shapes()[0].points).toHaveLength(5)
  })
})
