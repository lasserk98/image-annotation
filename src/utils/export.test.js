import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildExportData, downloadJSON, toJsonFilename } from './export'

const IMAGES = [{ id: 'img-1', name: 'a/scan.png', url: 'blob:x', width: 200, height: 100 }]
const CLASSES = [{ id: 'c1', name: 'Nerve' }]
const SHAPES = {
  'img-1': [
    {
      id: 's1',
      classId: 'c1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    },
  ],
}

describe('buildExportData', () => {
  it('exports shapes in image pixel space with class names', () => {
    const data = buildExportData({
      participantId: null,
      images: IMAGES,
      shapesByImage: SHAPES,
      classes: CLASSES,
    })

    expect(data.images).toHaveLength(1)
    expect(data.images[0]).toMatchObject({ filename: 'a/scan.png', width: 200, height: 100 })
    expect(data.images[0].shapes[0]).toMatchObject({
      classId: 'c1',
      className: 'Nerve',
      points: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      area: 100,
    })
  })

  it('records a null participant and treatment when none is given', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES })

    expect(data.participantId).toBeNull()
    expect(data.treatment).toBeNull()
  })

  it('never includes image data, only metadata and shapes', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES })

    expect(JSON.stringify(data)).not.toContain('blob:x')
  })

  it('falls back to the class id when the class no longer exists', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: [] })

    expect(data.images[0].shapes[0].className).toBe('c1')
  })

  it('exports an empty shape list for an unannotated image', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: {}, classes: CLASSES })

    expect(data.images[0].shapes).toEqual([])
  })
})

describe('toJsonFilename', () => {
  it('forces a .json extension', () => {
    expect(toJsonFilename('results.txt')).toBe('results.json')
  })

  it('keeps an existing .json name unchanged', () => {
    expect(toJsonFilename('results.json')).toBe('results.json')
  })

  it('uses the fallback for a blank name', () => {
    expect(toJsonFilename('   ', 'annotations')).toBe('annotations.json')
  })
})

describe('downloadJSON', () => {
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL

  beforeEach(() => {
    // jsdom has no object-URL support, so both are stubbed for the test.
    URL.createObjectURL = vi.fn(() => 'blob:fake')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
    vi.restoreAllMocks()
  })

  it('downloads pretty-printed JSON under the given file name', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadJSON('results.json', { a: 1 })

    expect(click).toHaveBeenCalledTimes(1)
    expect(click.mock.contexts[0].download).toBe('results.json')
    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(await blob.text()).toBe(JSON.stringify({ a: 1 }, null, 2))
    expect(blob.type).toBe('application/json')
  })

  it('releases the object URL and leaves no link in the page', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadJSON('results.json', {})

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
    expect(document.querySelector('a[download]')).toBeNull()
  })
})
