import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'

// Shared so "no image selected" doesn't hand the grouping memo a fresh array
// on every render.
const NO_SHAPES = []

export default function InstanceList() {
  const { state, setShapes, selectShape, hoverShape, t } = useApp()
  const { classes, currentImageId, shapesByImage, selection } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || NO_SHAPES
  const selectedRowRef = useRef(null)

  // Group by class, ordered by the configured class order, so the panel reads
  // as "what did I mark, of which kind" rather than a flat draw-order log.
  const groups = useMemo(() => {
    const byClass = new Map()
    for (const shape of shapes) {
      if (!byClass.has(shape.classId)) byClass.set(shape.classId, [])
      byClass.get(shape.classId).push(shape)
    }
    const ordered = classes
      .filter((cls) => byClass.has(cls.id))
      .map((cls) => ({ cls, items: byClass.get(cls.id) }))
    // Shapes whose class is no longer in the list (a class list was swapped
    // out mid-session) would otherwise vanish from the panel.
    const known = new Set(classes.map((c) => c.id))
    const orphans = [...byClass.entries()].filter(([id]) => !known.has(id))
    for (const [id, items] of orphans) {
      ordered.push({ cls: { id, name: id, color: '#8f96a2' }, items })
    }
    return ordered
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
        {shapes.length === 0 ? (
          <p className="panel-empty">
            {currentImageId ? t('instances.empty') : t('instances.emptyNoImage')}
          </p>
        ) : (
          <div className="space-y-2.5">
            {groups.map(({ cls, items }) => (
              <div key={cls.id}>
                <div
                  className="flex items-center gap-2 px-2 pb-1"
                  title={t('instances.groupTitle', { name: cls.name, n: items.length })}
                >
                  <span
                    className="swatch"
                    style={{ background: cls.color, width: 10, height: 10 }}
                  />
                  <span
                    className="flex-1 min-w-0 truncate text-[12px] font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    {cls.name}
                  </span>
                  <span className="count-badge">{items.length}</span>
                </div>

                <div
                  className="space-y-0.5 pl-2"
                  style={{ borderLeft: `2px solid ${cls.color}`, marginLeft: 6 }}
                >
                  {items.map((shape, i) => {
                    const selected = selection.shapeId === shape.id
                    return (
                      <div
                        key={shape.id}
                        ref={selected ? selectedRowRef : null}
                        onClick={() => selectShape(shape.id)}
                        onMouseEnter={() => hoverShape(shape.id)}
                        className="group list-row"
                        data-active={selected}
                        style={{ cursor: 'pointer' }}
                      >
                        <span
                          className="text-[11px] tabular-nums flex-shrink-0"
                          style={{ color: 'var(--text-faint)', minWidth: 14 }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 min-w-0 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          {t('instances.pointCount', { n: shape.points.length })}
                        </span>

                        {/* A value-less select: the closed control stays a
                            compact glyph (the class is already named by the
                            group header) while the popup lists the classes
                            this instance can be moved to. */}
                        <select
                          value=""
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value) updateShapeClass(shape.id, e.target.value)
                          }}
                          className="select-inline row-action"
                          title={t('instances.classTitle')}
                          aria-label={t('instances.classTitle')}
                        >
                          <option value="">⇄</option>
                          {classes
                            .filter((c) => c.id !== shape.classId)
                            .map((c) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
