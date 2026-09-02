const PALETTE = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
  '#0ea5e9',
  '#f97316',
]

function slug(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'class'
  )
}

// Accepts either ["Name", ...] or [{ name, color?, id? }, ...] so a class
// list can be authored by hand with minimal ceremony.
export function parseClasses(json) {
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('Expected a non-empty JSON array of classes.')
  }
  const seen = new Set()
  return json.map((item, i) => {
    const raw = typeof item === 'string' ? { name: item } : item
    if (!raw || typeof raw.name !== 'string' || !raw.name.trim()) {
      throw new Error(`Class at index ${i} is missing a "name".`)
    }
    const base = raw.id && String(raw.id).trim() ? String(raw.id).trim() : slug(raw.name)
    let id = base
    let n = 2
    while (seen.has(id)) id = `${base}-${n++}`
    seen.add(id)
    return { id, name: raw.name.trim(), color: raw.color || PALETTE[i % PALETTE.length] }
  })
}
