import { uid } from './id'

const ACCEPTED = /\.(png|jpe?g|webp|bmp|gif)$/i

function loadOneImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({
        id: uid('img'),
        // A folder walk stamps `relativePath`, and an <input webkitdirectory>
        // picker sets `webkitRelativePath` natively — either lets same-named
        // files from different subfolders stay distinguishable instead of
        // colliding under one bare basename.
        name: file.relativePath || file.webkitRelativePath || file.name,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not read image: ${file.name}`))
    }
    img.src = url
  })
}

// Reads local image files entirely client-side (object URLs backed by
// in-memory Blobs) — nothing here ever touches the network. Accepts anything
// list-like: a plain <input multiple> FileList, or a flattened folder walk —
// so a folder is handled exactly like a set of individually-picked files.
// Promise.allSettled (rather than Promise.all) means one unreadable file
// among many — likely once folders can be dropped wholesale — doesn't
// discard every other image in the batch.
export async function filesToImages(fileList) {
  const files = Array.from(fileList).filter((f) => ACCEPTED.test(f.name))
  const settled = await Promise.allSettled(files.map(loadOneImage))
  return settled.filter((r) => r.status === 'fulfilled').map((r) => r.value)
}
