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
  // allSettled at every fan-out level in this module: one item/entry that
  // fails to read (a deleted file, a cloud-sync placeholder, a permission
  // error) must not discard every other file already collected from the
  // same drop.
  await Promise.allSettled(Array.from(items).map((item) => collectFromItem(item, files)))
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
    await walkEntry(entry, files, '')
    return
  }
  const file = item.getAsFile?.()
  if (file) files.push(file)
}

async function walkEntry(entry, files, parentPath) {
  const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name
  if (entry.isFile) {
    try {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
      // A folder drop never populates File#webkitRelativePath (that's only
      // set by an <input webkitdirectory> picker) — stamping our own keeps
      // same-named files from different subfolders distinguishable
      // downstream instead of colliding under one bare basename.
      file.relativePath = relativePath
      files.push(file)
    } catch {
      // Skip a file that vanishes or fails to read mid-walk rather than
      // letting it sink every other file already found in this folder.
    }
    return
  }
  if (entry.isDirectory) {
    const children = await readAllEntries(entry.createReader())
    await Promise.allSettled(children.map((child) => walkEntry(child, files, relativePath)))
  }
}

// DirectoryReader.readEntries only returns one batch per call (a spec
// quirk), so it must be called repeatedly until a call resolves empty. A
// failed read resolves with whatever was already read rather than
// rejecting, so one unreadable subfolder doesn't discard sibling entries.
function readAllEntries(reader) {
  return new Promise((resolve) => {
    const all = []
    function readBatch() {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all)
        } else {
          all.push(...batch)
          readBatch()
        }
      }, () => resolve(all))
    }
    readBatch()
  })
}
