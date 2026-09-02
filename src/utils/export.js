import { polygonArea } from './geometry'

// Builds the full submission payload for the current session. Coordinates
// are recorded in original-image pixel space so they can be compared
// directly against ground-truth masks regardless of how the browser
// happened to render/zoom the image during annotation.
export function buildExportData({ studentId, studentName, treatment, images, shapesByImage, classes }) {
  const classById = Object.fromEntries(classes.map((c) => [c.id, c]))

  return {
    studentId,
    studentName: studentName || null,
    treatment: treatment || null,
    exportedAt: new Date().toISOString(),
    tool: 'image-annotation',
    schemaVersion: 1,
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
