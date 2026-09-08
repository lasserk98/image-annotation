import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { tintColor } from '../utils/classes'

// Shared so "no image selected" doesn't hand the ordering memo a fresh array
// on every render.
const NO_SHAPES = []

const UNKNOWN_COLOR = '#8f96a2'

export default function InstanceList() {
  const { state, setShapes, selectShape, hoverShape, t } = useApp()
  const { classes, currentImageId, shapesByImage, selection, hoveredShapeId } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || NO_SHAPES
  const selectedRowRef = useRef(null)

  // Flat list, but ordered by class so instances of the same kind sit together
  // and their shared row colour reads as a block. Each row names its own class,
  // so no group headers are needed — the per-class totals are already on the
  // class list in the left panel.
  const rows = useMemo(() => {
    const order = new Map(classes.map((c, i) => [c.id, i]))
    const byClass = new Map()
    for (const shape of shapes) {
      if (!byClass.has(shape.classId)) byClass.set(shape.classId, [])
      byClass.get(shape.classId).push(shape)
    }
    const groupIds = [...byClass.keys()].sort(
      // A class the current list no longer contains (the list was swapped
      // mid-session) sorts last rather than disappearing from the panel.
      (a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER),
    )
    return groupIds.flatMap((classId) =>
      byClass.get(classId).map((shape, i) => ({
        shape,
        // Numbered within its class: "Stapes 1", "Stapes 2".
        indexInClass: i + 1,
        cls: classes.find((c) => c.id === classId) ?? {
          id: classId,
          name: classId,
          color: UNKNOWN_COLOR,
        },
        known: order.has(classId),
      })),
    )
  }, [shapes, classes])

  // When a shape is picked on the canvas, bring its row into view.
  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selection.shapeId])

  function updateShapeClass(shapeId, classId) {
    setShapes(
      currentImageId,
      shapes.map((s) => (s.id === shapeId ? { ...s, classId } : s)),
    )
  }

  function deleteShape(shapeId) {
    setShapes(
      currentImageId,
      shapes.filter((s) => s.id !== shapeId),
    )
    if (selection.shapeId === shapeId) selectShape(null)
    hoverShape(null)
  }

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">{t('instances.heading')}</span>
        <span className="count-badge">{shapes.length}</span>
      </div>

      <div className="panel-body" onMouseLeave={() => hoverShape(null)}>
        {rows.length === 0 ? (
          <p className="panel-empty">
            {currentImageId ? t('instances.empty') : t('instances.emptyNoImage')}
          </p>
        ) : (
          <div className="space-y-1">
            {rows.map(({ shape, cls, indexInClass, known }) => {
              const selected = selection.shapeId === shape.id
              const hovered = hoveredShapeId === shape.id
              return (
                <div
                  key={shape.id}
                  ref={selected ? selectedRowRef : null}
                  onClick={() => selectShape(shape.id)}
                  onMouseEnter={() => hoverShape(shape.id)}
                  className="group list-row"
                  style={{
                    cursor: 'pointer',
                    // The whole row carries the class colour, so a glance down
                    // the panel shows which classes are present and how often.
                    background: tintColor(cls.color, selected ? 0.34 : hovered ? 0.24 : 0.12),
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: selected ? cls.color : 'transparent',
                    borderLeftWidth: 3,
                    borderLeftColor: cls.color,
                  }}
                >
                  <span
                    className="text-[11px] tabular-nums flex-shrink-0 text-right"
                    style={{ color: 'var(--text-muted)', minWidth: 12 }}
                  >
                    {indexInClass}
                  </span>

                  {/* The class name is the control: clicking it opens the class
                      list for this instance. */}
                  <select
                    value={shape.classId}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateShapeClass(shape.id, e.target.value)}
                    className="row-select"
                    title={t('instances.classTitle')}
                    aria-label={t('instances.classTitle')}
                  >
                    {!known && (
                      <option value={shape.classId}>{cls.name}</option>
                    )}
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <span
                    className="text-[11px] tabular-nums flex-shrink-0 whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t('instances.pointCount', { n: shape.points.length })}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteShape(shape.id)
                    }}
                    className="row-action"
                    title={t('instances.deleteTitle')}
                    aria-label={t('instances.deleteTitle')}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
