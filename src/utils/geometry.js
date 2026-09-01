export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Shoelace formula; returns a signed area (sign encodes winding order).
export function polygonArea(points) {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.y - b.x * a.y
  }
  return sum / 2
}

export function polygonCentroid(points) {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length
  return { x: cx, y: cy }
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
