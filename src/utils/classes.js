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

// Pinned to one locale on purpose: the sort decides both the menu order and
// which classes the 1-9 shortcuts address, so it has to come out identical for
// every participant rather than following whatever locale their browser
// reports. `sensitivity: 'base'` folds case and accents, so Ä sorts with A
// (German dictionary order, DIN 5007-1); `numeric` keeps "Class 2" ahead of
// "Class 10".
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

// Array.prototype.sort is stable, so equal names keep their authored order.
export function sortClassesByName(classes) {
  return [...classes].sort((a, b) => collator.compare(a.name, b.name))
}

// Washes a row in its class colour. Class colours come from user-authored
// JSON, so they aren't guaranteed to be hex: hex is converted to rgba directly
// (no reliance on color-mix support), anything else — a named colour, rgb() —
// goes through color-mix, and a browser without it simply renders no tint.
export function tintColor(color, alpha) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color))
  if (hex) {
    const digits =
      hex[1].length === 3
        ? hex[1]
            .split('')
            .map((c) => c + c)
            .join('')
        : hex[1]
    const r = parseInt(digits.slice(0, 2), 16)
    const g = parseInt(digits.slice(2, 4), 16)
    const b = parseInt(digits.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
}

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
