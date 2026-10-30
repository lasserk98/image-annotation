import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { expandZips, ZipError } from './extractZip'

const PNG_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

function zipFile(name, entries) {
  return new File([zipSync(entries)], name, { type: 'application/zip' })
}

describe('expandZips', () => {
  it('replaces a zip with its images, named by their path inside the zip', async () => {
    const zip = zipFile('set-a.zip', {
      'one.png': PNG_BYTES,
      'nested/two.jpg': PNG_BYTES,
    })

    const files = await expandZips([zip])

    expect(files.map((f) => f.relativePath).sort()).toEqual(['set-a/nested/two.jpg', 'set-a/one.png'])
    expect(files.map((f) => f.name).sort()).toEqual(['one.png', 'two.jpg'])
  })

  it('gives each extracted image a type and its bytes', async () => {
    const files = await expandZips([zipFile('s.zip', { 'a.png': PNG_BYTES })])

    expect(files[0].type).toBe('image/png')
    expect(new Uint8Array(await files[0].arrayBuffer())).toEqual(PNG_BYTES)
  })

  it('skips non-image entries and macOS metadata', async () => {
    const zip = zipFile('s.zip', {
      'keep.png': PNG_BYTES,
      'notes.txt': strToU8('hello'),
      '__MACOSX/._keep.png': PNG_BYTES,
      '._hidden.png': PNG_BYTES,
    })

    const files = await expandZips([zip])

    expect(files.map((f) => f.relativePath)).toEqual(['s/keep.png'])
  })

  it('passes files that are not zips through untouched', async () => {
    const image = new File([PNG_BYTES], 'plain.png', { type: 'image/png' })

    const files = await expandZips([image])

    expect(files).toEqual([image])
  })

  it('expands several zips mixed with plain files', async () => {
    const image = new File([PNG_BYTES], 'plain.png', { type: 'image/png' })

    const files = await expandZips([
      zipFile('a.zip', { 'x.png': PNG_BYTES }),
      image,
      zipFile('b.zip', { 'x.png': PNG_BYTES }),
    ])

    expect(files.map((f) => f.relativePath ?? f.name)).toEqual(['a/x.png', 'plain.png', 'b/x.png'])
  })

  it('returns nothing for a zip without images', async () => {
    const files = await expandZips([zipFile('s.zip', { 'notes.txt': strToU8('hello') })])

    expect(files).toEqual([])
  })

  it('throws a ZipError for a corrupt zip', async () => {
    const corrupt = new File([strToU8('this is not a zip archive')], 'bad.zip')

    await expect(expandZips([corrupt])).rejects.toBeInstanceOf(ZipError)
  })

  it('throws a ZipError when the images are too large once unpacked', async () => {
    const zip = zipFile('big.zip', { 'a.png': new Uint8Array(2000) })

    await expect(expandZips([zip], { maxTotalBytes: 1000 })).rejects.toBeInstanceOf(ZipError)
  })

  it('throws a ZipError when the zip has too many images', async () => {
    const zip = zipFile('many.zip', { 'a.png': PNG_BYTES, 'b.png': PNG_BYTES, 'c.png': PNG_BYTES })

    await expect(expandZips([zip], { maxEntries: 2 })).rejects.toBeInstanceOf(ZipError)
  })
})
