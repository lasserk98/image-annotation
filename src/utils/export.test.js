import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildExportData,
  buildPostExportData,
  downloadJSON,
  participantFilename,
  toJsonFilename,
} from './export'

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

const SURVEY = {
  version: 'pre-1',
  consentAcceptedAt: '2026-10-21T11:50:00.000Z',
  answers: { 'demo.age': 24, 'pre.1': 2, 'mc.1': 'C' },
  completedAt: '2026-10-21T11:58:00.000Z',
}

describe('buildExportData with a survey', () => {
  it('writes the survey, consent and completion times and raw answers into the file', () => {
    const data = buildExportData({
      participantId: 'P-1',
      images: IMAGES,
      shapesByImage: SHAPES,
      classes: CLASSES,
      survey: SURVEY,
    })

    expect(data.survey).toEqual(SURVEY)
  })

  it('exports a copy, so later edits to the state cannot change the file', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES, survey: SURVEY })

    expect(data.survey).not.toBe(SURVEY)
    expect(data.survey.answers).not.toBe(SURVEY.answers)
  })

  it('has no survey key when none is given, as in the Creator export', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES })

    expect(data).not.toHaveProperty('survey')
  })

  it('is schema version 3', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES })

    expect(data.schemaVersion).toBe(3)
  })

  it('still contains no image data and nothing that could hold a score or answer key', () => {
    const data = buildExportData({ images: IMAGES, shapesByImage: SHAPES, classes: CLASSES, survey: SURVEY })

    const text = JSON.stringify(data)
    expect(text).not.toContain('blob:x')
    expect(text).not.toMatch(/score|correct|answerKey/i)
  })
})

describe('participantFilename', () => {
  it('names the file after the participant ID', () => {
    expect(participantFilename('P-1234567')).toBe('P-1234567.json')
  })

  it('replaces characters that are unsafe in a file name', () => {
    expect(participantFilename('a b/c\\d:e')).toBe('a_b_c_d_e.json')
  })

  it('keeps dots in the ID instead of treating them as an extension', () => {
    expect(participantFilename('P.12')).toBe('P.12.json')
  })

  it('does not let the ID climb out of the download folder', () => {
    expect(participantFilename('../../x')).not.toMatch(/[\\/]/)
    expect(participantFilename('..')).toBe('study.json')
  })

  it('falls back to a fixed name when nothing usable is left', () => {
    expect(participantFilename('   ')).toBe('study.json')
    expect(participantFilename(null)).toBe('study.json')
  })
})

const POST_SURVEY_STATE = {
  version: 'post-1',
  consentAcceptedAt: null,
  answers: { 'post.1': 2, 'ai.1': 1, 'conv.3': 3 },
  completedAt: '2026-12-01T11:58:00.000Z',
}

describe('buildPostExportData', () => {
  it('holds the participant, the times and the raw answers, and nothing else', () => {
    const data = buildPostExportData({ participantId: 'P-1', survey: POST_SURVEY_STATE })

    expect(Object.keys(data).sort()).toEqual(
      ['exportedAt', 'participantId', 'schemaVersion', 'survey', 'tool'].sort(),
    )
    expect(data).toMatchObject({ participantId: 'P-1', tool: 'image-annotation', schemaVersion: 3 })
    expect(data.survey).toEqual(POST_SURVEY_STATE)
  })

  it('has no images, shapes or treatment', () => {
    const data = buildPostExportData({ participantId: 'P-1', survey: POST_SURVEY_STATE })

    expect(data).not.toHaveProperty('images')
    expect(data).not.toHaveProperty('treatment')
  })

  it('exports a copy of the survey and a current timestamp', () => {
    const data = buildPostExportData({ participantId: 'P-1', survey: POST_SURVEY_STATE })

    expect(data.survey).not.toBe(POST_SURVEY_STATE)
    expect(data.survey.answers).not.toBe(POST_SURVEY_STATE.answers)
    expect(Number.isNaN(Date.parse(data.exportedAt))).toBe(false)
  })

  it('contains nothing that could hold a score or answer key', () => {
    const data = buildPostExportData({ participantId: 'P-1', survey: POST_SURVEY_STATE })

    expect(JSON.stringify(data)).not.toMatch(/score|correct|answerKey/i)
  })
})

describe('participantFilename with a suffix', () => {
  it('adds the suffix before the extension', () => {
    expect(participantFilename('P-1', 'post')).toBe('P-1_post.json')
  })

  it('cleans the ID the same way', () => {
    expect(participantFilename('a b/c', 'post')).toBe('a_b_c_post.json')
  })

  it('uses the fallback name with the suffix', () => {
    expect(participantFilename('  ', 'post')).toBe('study_post.json')
  })

  it('is unchanged without a suffix, so the study file name stays <id>.json', () => {
    expect(participantFilename('P-1')).toBe('P-1.json')
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
