import { uid } from './id'

const ACCEPTED = /\.(png|jpe?g|webp|bmp|gif)$/i

// Reads local image files entirely client-side (object URLs backed by
// in-memory Blobs) — nothing here ever touches the network.
export async function filesToImages(fileList) {
  const files = Array.from(fileList).filter((f) => ACCEPTED.test(f.name))
  const results = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const url = URL.createObjectURL(file)
          const img = new Image()
          img.onload = () => {
            resolve({
              id: uid('img'),
              name: file.name,
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
        }),
    ),
  )
  return results
}
