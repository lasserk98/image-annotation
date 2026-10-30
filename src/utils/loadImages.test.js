import { zipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZipError } from './extractZip'
import { filesToImages } from './loadImages'

const PNG_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

// jsdom never decodes images, so a stand-in `Image` reports a fixed size.
class FakeImage {
  naturalWidth = 4
  naturalHeight = 3
  set src(_url) {
    queueMicrotask(() => this.onload())
  }
}

describe('filesToImages', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage)
    URL.createObjectURL = vi.fn(() => 'blob:fake')
    URL.revokeObjectURL = vi.fn()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('loads the images inside a zip, named by their path in the zip', async () => {
    const zip = new File([zipSync({ 'a.png': PNG_BYTES, 'sub/b.jpg': PNG_BYTES })], 'set.zip')

    const images = await filesToImages([zip])

    expect(images.map((i) => i.name).sort()).toEqual(['set/a.png', 'set/sub/b.jpg'])
    expect(images[0]).toMatchObject({ width: 4, height: 3 })
  })

  it('loads plain image files next to a zip', async () => {
    const zip = new File([zipSync({ 'a.png': PNG_BYTES })], 'set.zip')
    const plain = new File([PNG_BYTES], 'plain.png', { type: 'image/png' })

    const images = await filesToImages([plain, zip])

    expect(images.map((i) => i.name).sort()).toEqual(['plain.png', 'set/a.png'])
  })

  it('ignores files that are not images', async () => {
    const images = await filesToImages([new File(['x'], 'notes.txt')])

    expect(images).toEqual([])
  })

  it('rejects with a ZipError for a damaged zip', async () => {
    await expect(filesToImages([new File(['not a zip'], 'bad.zip')])).rejects.toBeInstanceOf(ZipError)
  })
})
