// Flattens whatever was dropped — files, folders, or a mix of both — into a
// plain File[], so the caller never has to branch on what the user dropped.
// Folder walking uses the (Chromium/WebKit/Firefox) FileSystemEntry API; a
// browser without it falls back to the plain file list, which never
// contains directories in the first place.
export async function collectFilesFromDataTransfer(dataTransfer) {
  const items = dataTransfer.items
  if (!items || items.length === 0) {
    return Array.from(dataTransfer.files || [])
  }

  const files = []
  await Promise.all(Array.from(items).map((item) => collectFromItem(item, files)))
  return files
}

// webkitGetAsEntry() can return null for a genuine file item — not just for
// non-file drag data — e.g. drops that didn't originate from the OS file
// manager, or browsers/embeddings with partial support. Falling back to
// item.getAsFile() there (rather than dropping the item) is what keeps a
// plain file drag working even when the richer entry API comes up empty.
async function collectFromItem(item, files) {
  const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null
  if (entry) {
    await walkEntry(entry, files)
    return
  }
  const file = item.getAsFile?.()
  if (file) files.push(file)
}

async function walkEntry(entry, files) {
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
    files.push(file)
    return
  }
  if (entry.isDirectory) {
    const children = await readAllEntries(entry.createReader())
    await Promise.all(children.map((child) => walkEntry(child, files)))
  }
}

// DirectoryReader.readEntries only returns one batch per call (a spec
// quirk), so it must be called repeatedly until a call resolves empty.
function readAllEntries(reader) {
  return new Promise((resolve, reject) => {
    const all = []
    function readBatch() {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all)
        } else {
          all.push(...batch)
          readBatch()
        }
      }, reject)
    }
    readBatch()
  })
}
