import { useApp } from '../context/AppContext'

export default function ShapeList() {
  const { state, setShapes, selectShape } = useApp()
  const { classes, currentImageId, shapesByImage, selection } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || []
  const classById = Object.fromEntries(classes.map((c) => [c.id, c]))

  function updateShapeClass(shapeId, classId) {
    const next = shapes.map((s) => (s.id === shapeId ? { ...s, classId } : s))
    setShapes(currentImageId, next)
  }

  function deleteShape(shapeId) {
    const next = shapes.filter((s) => s.id !== shapeId)
    setShapes(currentImageId, next)
    if (selection.shapeId === shapeId) selectShape(null)
  }

  return (
    <div className="px-3 py-3 flex-1 overflow-y-auto scroll-thin" style={{ borderTop: '1px solid var(--border)' }}>
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Shapes ({shapes.length})
      </h2>
      {shapes.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          No shapes yet. Pick a class, then click on the image to start drawing.
        </p>
      ) : (
        <div className="space-y-1">
          {shapes.map((shape, i) => {
            const cls = classById[shape.classId]
            const selected = selection.shapeId === shape.id
            return (
              <div
                key={shape.id}
                onClick={() => selectShape(shape.id)}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition"
                style={{
                  background: selected ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${selected ? 'var(--accent)' : 'transparent'}`,
                }}
              >
                <span className="text-[11px] w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cls?.color ?? '#999' }}
                />
                <select
                  value={shape.classId}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateShapeClass(shape.id, e.target.value)}
                  className="flex-1 min-w-0 text-xs bg-transparent outline-none truncate"
                  style={{ color: 'var(--text)' }}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteShape(shape.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs px-1 transition flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  title="Delete shape"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
