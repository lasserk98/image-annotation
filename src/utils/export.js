import { polygonArea } from './geometry'

// Builds the full submission payload for the current session. Coordinates
// are recorded in original-image pixel space so they can be compared
// directly against ground-truth masks regardless of how the browser
// happened to render/zoom the image during annotation.
// schemaVersion 2 renamed the top-level `studentId` field to `participantId`;
// nothing else about the payload changed.
export function buildExportData({ participantId, treatment, images, shapesByImage, classes }) {
  const classById = Object.fromEntries(classes.map((c) => [c.id, c]))

  return {
    participantId,
    treatment: treatment || null,
    exportedAt: new Date().toISOString(),
    tool: 'image-annotation',
    schemaVersion: 2,
    images: images.map((img) => {
      const shapes = shapesByImage[img.id] || []
      return {
        filename: img.name,
        width: img.width,
        height: img.height,
        shapes: shapes.map((shape) => ({
          id: shape.id,
          classId: shape.classId,
          className: classById[shape.classId]?.name ?? shape.classId,
          points: shape.points.map((p) => [round(p.x), round(p.y)]),
          area: Math.abs(polygonArea(shape.points)),
        })),
      }
    }),
  }
}

function round(n) {
  return Math.round(n * 100) / 100
}

// Guarantees a ".json" extension regardless of what the user typed (or left
// blank), so an exported class list can never end up saved under some other
// file type. Replaces a trailing extension rather than appending blindly, so
// re-submitting an unchanged "classes.json" round-trips to itself.
export function toJsonFilename(name, fallback = 'classes') {
  const base =
    String(name)
      .trim()
      .replace(/\.[A-Za-z0-9]{1,10}$/, '')
      .replace(/\.+$/, '') || fallback
  return `${base}.json`
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
