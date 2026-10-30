import { unzipSync } from 'fflate'

export const IMAGE_PATTERN = /\.(png|jpe?g|webp|bmp|gif)$/i

// A study set is a handful of images; these only stop a runaway archive from
// being inflated into memory.
const MAX_TOTAL_BYTES = 200 * 1024 * 1024
const MAX_ENTRIES = 100

const ZIP_PATTERN = /\.zip$/i
const MIME_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  bmp: 'image/bmp',
  gif: 'image/gif',
}

export class ZipError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'ZipError'
  }
}

function isImageEntry(path) {
  const basename = path.split('/').pop()
  return IMAGE_PATTERN.test(basename) && !path.startsWith('__MACOSX/') && !basename.startsWith('._')
}

// Rejects before inflating: `originalSize` comes from the zip's directory, so
// an oversized archive never reaches memory.
function createImageFilter({ maxTotalBytes, maxEntries }) {
  let totalBytes = 0
  let entryCount = 0
  return ({ name, originalSize }) => {
    if (!isImageEntry(name)) return false
    entryCount += 1
    totalBytes += originalSize
    if (entryCount > maxEntries) throw new ZipError(`Zip holds more than ${maxEntries} images`)
    if (totalBytes > maxTotalBytes) throw new ZipError('Zip images are too large once unpacked')
    return true
  }
}

async function extractImages(zipFile, limits) {
  const prefix = zipFile.name.replace(ZIP_PATTERN, '')
  let entries
  try {
    entries = unzipSync(new Uint8Array(await zipFile.arrayBuffer()), { filter: createImageFilter(limits) })
  } catch (error) {
    if (error instanceof ZipError) throw error
    throw new ZipError(`Could not read zip: ${zipFile.name}`, { cause: error })
  }

  return Object.entries(entries).map(([path, bytes]) => {
    const extension = path.split('.').pop().toLowerCase()
    const file = new File([bytes], path.split('/').pop(), { type: MIME_BY_EXTENSION[extension] })
    // Same convention as a dropped folder: the container's name leads the
    // path, so images from different sets stay distinguishable.
    file.relativePath = `${prefix}/${path}`
    return file
  })
}

// Replaces every .zip in `files` with the image files it holds and leaves
// everything else as is, so callers can treat a zip like a dropped folder.
export async function expandZips(files, limits = {}) {
  const resolvedLimits = { maxTotalBytes: MAX_TOTAL_BYTES, maxEntries: MAX_ENTRIES, ...limits }
  const expanded = await Promise.all(
    Array.from(files).map((file) => (ZIP_PATTERN.test(file.name) ? extractImages(file, resolvedLimits) : [file])),
  )
  return expanded.flat()
}
