import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import { clamp, distance, polygonCentroid } from '../utils/geometry'
import Toolbar from './Toolbar'

const MIN_SCALE = 0.05
const MAX_SCALE = 8
const CLOSE_HIT_RADIUS = 10 // css px, tolerance for clicking near the first point to close a polygon
const VERTEX_R = 5 // css px, constant regardless of zoom
const EDGE_HIT_R = 6 // css px, tolerance for double-clicking an edge to insert a vertex
const ZOOM_PER_PIXEL = 0.0015 // wheel travel -> zoom, applied exponentially

// Wheel deltas arrive in pixels, lines or pages depending on the device and
// browser; normalise them to pixels so zoom speed feels the same everywhere.
function wheelDeltaPx(e, viewportHeight) {
  if (e.deltaMode === 1) return e.deltaY * 16
  if (e.deltaMode === 2) return e.deltaY * viewportHeight
  return e.deltaY
}

export default function AnnotationCanvas() {
  const { state, setShapes, selectShape, hoverShape, setActiveClass, selectImage, undo, redo, t } =
    useApp()
  const { classes, activeClassId, currentImageId, images, shapesByImage, selection, hoveredShapeId } =
    state
  const image = images.find((i) => i.id === currentImageId) || null
  const shapes = (currentImageId && shapesByImage[currentImageId]) || []
  const classById = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes])
  const activeClass = classById[activeClassId] ?? null
  const activeColor = activeClass?.color ?? '#888'

  const containerRef = useRef(null)
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [mode, setMode] = useState('select') // 'select' | 'draw'
  const [draftPoints, setDraftPoints] = useState([])
  const [cursor, setCursor] = useState(null)
  const [dragPoint, setDragPoint] = useState(null) // { index, x, y } live override while dragging a vertex
  const [panning, setPanning] = useState(false)

  const dragRef = useRef(null) // { type: 'pan'|'vertex', ... }

  const fit = useMemo(
    () => () => {
      const el = containerRef.current
      if (!el || !image) return
      const pad = 32
      const availW = el.clientWidth - pad
      const availH = el.clientHeight - pad
      const scale = clamp(Math.min(availW / image.width, availH / image.height), MIN_SCALE, MAX_SCALE)
      const x = (el.clientWidth - image.width * scale) / 2
      const y = (el.clientHeight - image.height * scale) / 2
      setTransform({ scale, x, y })
    },
    [image],
  )

  // Reset drawing/selection state and re-fit whenever the active image changes.
  useEffect(() => {
    setMode('select')
    setDraftPoints([])
    setCursor(null)
    fit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageId])

  // React attaches its `wheel` handler passively at the root, so an
  // onWheel={...} preventDefault() is ignored and the gesture leaks out to the
  // browser (page rubber-banding, pinch-zoom of the whole document). The
  // listener has to be registered natively with passive: false.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Shift turns the wheel into a horizontal pan, matching the convention
      // in most canvas tools.
      if (e.shiftKey) {
        const dx = wheelDeltaPx(e, el.clientHeight)
        setTransform((prev) => ({ ...prev, x: prev.x - dx }))
        return
      }

      const dy = wheelDeltaPx(e, el.clientHeight)
      const factor = Math.exp(-dy * ZOOM_PER_PIXEL)
      // Functional update: this listener is registered once, so it must not
      // close over a stale transform.
      setTransform((prev) => {
        const scale = clamp(prev.scale * factor, MIN_SCALE, MAX_SCALE)
        if (scale === prev.scale) return prev
        const imgX = (mx - prev.x) / prev.scale
        const imgY = (my - prev.y) / prev.scale
        return { scale, x: mx - imgX * scale, y: my - imgY * scale }
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [image?.id])

  // Keep the view centre anchored when the container resizes (window resize,
  // or a side panel being collapsed) instead of re-fitting, which used to
  // throw away whatever zoom the participant had dialled in.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let last = { w: el.clientWidth, h: el.clientHeight }
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      const dx = (w - last.w) / 2
      const dy = (h - last.h) / 2
      last = { w, h }
      if (dx === 0 && dy === 0) return
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [image?.id])

  function toImageSpace(clientX, clientY) {
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale,
    }
  }

  function commitShapes(next) {
    setShapes(currentImageId, next)
  }

  function startDraw() {
    setMode('draw')
    setDraftPoints([])
    selectShape(null)
  }

  function cancelDraw() {
    setMode('select')
    setDraftPoints([])
  }

  function finishDraw() {
    if (draftPoints.length < 3) return
    const shape = { id: uid('shape'), classId: activeClassId, points: draftPoints }
    commitShapes([...shapes, shape])
    setMode('select')
    setDraftPoints([])
    selectShape(shape.id)
  }

  function beginPan(e) {
    dragRef.current = {
      type: 'pan',
      startClientX: e.clientX,
      startClientY: e.clientY,
      start: transform,
    }
    setPanning(true)
  }

  function handleBackgroundMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // middle-click or alt+drag always pans
      beginPan(e)
      return
    }
    if (mode === 'draw') {
      if (e.button !== 0) return
      const p = toImageSpace(e.clientX, e.clientY)
      if (draftPoints.length >= 3) {
        const first = draftPoints[0]
        if (distance(p, first) * transform.scale < CLOSE_HIT_RADIUS) {
          finishDraw()
          return
        }
      }
      setDraftPoints((pts) => [...pts, p])
      return
    }
    if (e.button === 0) {
      selectShape(null)
      beginPan(e)
    }
  }

  function handleMouseMove(e) {
    if (mode === 'draw') {
      setCursor(toImageSpace(e.clientX, e.clientY))
    }
    const drag = dragRef.current
    if (!drag) return
    if (drag.type === 'pan') {
      const dx = e.clientX - drag.startClientX
      const dy = e.clientY - drag.startClientY
      setTransform({ ...drag.start, x: drag.start.x + dx, y: drag.start.y + dy })
    } else if (drag.type === 'vertex') {
      const p = toImageSpace(e.clientX, e.clientY)
      setDragPoint({ shapeId: drag.shapeId, index: drag.index, x: p.x, y: p.y })
    }
  }

  function endDrag() {
    const drag = dragRef.current
    if (drag?.type === 'vertex') {
      const shape = shapes.find((s) => s.id === drag.shapeId)
      if (shape && dragPoint) {
        const points = shape.points.map((pt, i) => (i === drag.index ? { x: dragPoint.x, y: dragPoint.y } : pt))
        commitShapes(shapes.map((s) => (s.id === shape.id ? { ...s, points } : s)))
      }
      setDragPoint(null)
    }
    if (drag?.type === 'pan') setPanning(false)
    dragRef.current = null
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', endDrag)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', endDrag)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  function zoomBy(factor) {
    const el = containerRef.current
    if (!el) return
    const mx = el.clientWidth / 2
    const my = el.clientHeight / 2
    setTransform((prev) => {
      const scale = clamp(prev.scale * factor, MIN_SCALE, MAX_SCALE)
      if (scale === prev.scale) return prev
      const imgX = (mx - prev.x) / prev.scale
      const imgY = (my - prev.y) / prev.scale
      return { scale, x: mx - imgX * scale, y: my - imgY * scale }
    })
  }

  function vertexMouseDown(e, shapeId, index) {
    e.stopPropagation()
    if (e.button !== 0) return
    selectShape(shapeId, index)
    dragRef.current = { type: 'vertex', shapeId, index, moved: false }
  }

  function deleteVertex(shapeId, index) {
    const shape = shapes.find((s) => s.id === shapeId)
    if (!shape || shape.points.length <= 3) return
    const points = shape.points.filter((_, i) => i !== index)
    commitShapes(shapes.map((s) => (s.id === shapeId ? { ...s, points } : s)))
    selectShape(shapeId)
  }

  function insertVertexOnEdge(e, shape, edgeIndex) {
    e.stopPropagation()
    const p = toImageSpace(e.clientX, e.clientY)
    const points = [...shape.points]
    points.splice(edgeIndex + 1, 0, p)
    commitShapes(shapes.map((s) => (s.id === shape.id ? { ...s, points } : s)))
  }

  function deleteSelected() {
    if (!selection.shapeId) return
    if (selection.vertexIndex != null) {
      deleteVertex(selection.shapeId, selection.vertexIndex)
    } else {
      commitShapes(shapes.filter((s) => s.id !== selection.shapeId))
      selectShape(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (document.querySelector('[role="dialog"]')) return

      if (e.key === 'Escape') {
        if (mode === 'draw') cancelDraw()
        else selectShape(null)
      } else if (e.key === 'Enter') {
        if (mode === 'draw') finishDraw()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && mode === 'select') {
        if (selection.shapeId) {
          e.preventDefault()
          deleteSelected()
        }
      } else if (e.key === 'Backspace' && mode === 'draw') {
        setDraftPoints((pts) => pts.slice(0, -1))
      } else if ((e.key === 'n' || e.key === 'N') && mode === 'select') {
        startDraw()
      } else if (e.key >= '1' && e.key <= '9') {
        const cls = classes[Number(e.key) - 1]
        if (cls) {
          setActiveClass(cls.id)
          if (selection.shapeId && selection.vertexIndex == null) {
            commitShapes(shapes.map((s) => (s.id === selection.shapeId ? { ...s, classId: cls.id } : s)))
          }
        }
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (e.shiftKey) window.dispatchEvent(new CustomEvent('seg-redo'))
        else window.dispatchEvent(new CustomEvent('seg-undo'))
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && mode === 'select') {
        const idx = images.findIndex((i) => i.id === currentImageId)
        const next = images[idx + (e.key === 'ArrowRight' ? 1 : -1)]
        if (next) selectImage(next.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selection, shapes, classes, draftPoints, images, currentImageId])

  useEffect(() => {
    const onUndo = () => undo(currentImageId)
    const onRedo = () => redo(currentImageId)
    window.addEventListener('seg-undo', onUndo)
    window.addEventListener('seg-redo', onRedo)
    return () => {
      window.removeEventListener('seg-undo', onUndo)
      window.removeEventListener('seg-redo', onRedo)
    }
  }, [currentImageId, undo, redo])

  if (!image) {
    return (
      <div
        className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text)' }}>
          {t('canvas.empty')}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: 320 }}>
          {t('canvas.emptyHint')}
        </p>
      </div>
    )
  }

  const boxW = image.width * transform.scale
  const boxH = image.height * transform.scale
  const invScale = 1 / transform.scale

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <Toolbar
        mode={mode}
        onToggleDraw={startDraw}
        onCancelDraw={cancelDraw}
        scale={transform.scale}
        onZoom={zoomBy}
        onFit={fit}
        activeClass={activeClass}
      />
      <div
        ref={containerRef}
        onMouseDown={handleBackgroundMouseDown}
        className="flex-1 relative overflow-hidden min-h-0"
        style={{
          background: 'repeating-conic-gradient(var(--surface-2) 0% 25%, var(--bg) 0% 50%) 0 0 / 20px 20px',
          // The canvas handles its own gestures; without this, touch and
          // trackpad scrolling would still try to move an ancestor.
          touchAction: 'none',
          cursor: mode === 'draw' ? 'crosshair' : panning ? 'grabbing' : 'grab',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: transform.x,
            top: transform.y,
            width: boxW,
            height: boxH,
          }}
        >
          <img
            src={image.url}
            alt={image.name}
            draggable={false}
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${image.width} ${image.height}`}
            style={{ overflow: 'visible' }}
          >
            {shapes.map((shape) => {
              const cls = classById[shape.classId]
              const color = cls?.color ?? '#888'
              const selected = selection.shapeId === shape.id
              const hovered = hoveredShapeId === shape.id
              const emphasised = selected || hovered
              const points = shape.points.map((pt, i) =>
                dragPoint && dragPoint.shapeId === shape.id && dragPoint.index === i
                  ? { x: dragPoint.x, y: dragPoint.y }
                  : pt,
              )
              const d = points.map((p) => `${p.x},${p.y}`).join(' ')
              const centre = polygonCentroid(points)
              return (
                <g key={shape.id}>
                  <polygon
                    points={d}
                    fill={color}
                    fillOpacity={selected ? 0.34 : hovered ? 0.28 : 0.18}
                    stroke={color}
                    strokeWidth={(selected ? 2.5 : hovered ? 2.2 : 1.5) * invScale}
                    onMouseDown={(e) => {
                      if (mode !== 'select') return
                      e.stopPropagation()
                      selectShape(shape.id)
                    }}
                    onMouseEnter={() => hoverShape(shape.id)}
                    onMouseLeave={() => hoverShape(null)}
                    style={{ cursor: mode === 'select' ? 'pointer' : 'default' }}
                  />

                  {/* Name the shape only while it is the focus of attention —
                      labelling every polygon at once buries the image. */}
                  {emphasised && cls && (
                    <text
                      x={centre.x}
                      y={centre.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={12 * invScale}
                      paintOrder="stroke"
                      style={{
                        fill: color,
                        stroke: 'var(--surface)',
                        strokeWidth: 3.5 * invScale,
                        strokeLinejoin: 'round',
                        fontWeight: 700,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {cls.name}
                    </text>
                  )}

                  {selected &&
                    mode === 'select' &&
                    points.map((p, i) => {
                      const next = points[(i + 1) % points.length]
                      return (
                        <line
                          key={`edge-${i}`}
                          x1={p.x}
                          y1={p.y}
                          x2={next.x}
                          y2={next.y}
                          stroke="transparent"
                          strokeWidth={EDGE_HIT_R * 2 * invScale}
                          onDoubleClick={(e) => insertVertexOnEdge(e, shape, i)}
                          style={{ cursor: 'copy' }}
                        />
                      )
                    })}
                  {selected &&
                    mode === 'select' &&
                    points.map((p, i) => (
                      <circle
                        key={`v-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={VERTEX_R * invScale}
                        fill={selection.vertexIndex === i ? '#fff' : color}
                        stroke="#fff"
                        strokeWidth={1.5 * invScale}
                        onMouseDown={(e) => vertexMouseDown(e, shape.id, i)}
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          deleteVertex(shape.id, i)
                        }}
                        style={{ cursor: 'grab' }}
                      />
                    ))}
                </g>
              )
            })}

            {mode === 'draw' && draftPoints.length > 0 && (
              <g>
                <polyline
                  points={draftPoints.map((p) => `${p.x},${p.y}`).join(' ') + (cursor ? ` ${cursor.x},${cursor.y}` : '')}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={2 * invScale}
                  strokeDasharray={`${4 * invScale} ${4 * invScale}`}
                />
                {draftPoints.length >= 3 && cursor && (
                  <line
                    x1={draftPoints[0].x}
                    y1={draftPoints[0].y}
                    x2={cursor.x}
                    y2={cursor.y}
                    stroke={activeColor}
                    strokeWidth={1 * invScale}
                    strokeDasharray={`${2 * invScale} ${3 * invScale}`}
                    opacity={0.5}
                  />
                )}
                {draftPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={(i === 0 ? VERTEX_R + 1.5 : VERTEX_R) * invScale}
                    fill={i === 0 ? '#fff' : activeColor}
                    stroke={activeColor}
                    strokeWidth={1.5 * invScale}
                  />
                ))}
              </g>
            )}
          </svg>
        </div>

        <div
          className="absolute pointer-events-none select-none text-[11px] px-2 py-1 rounded-md"
          style={{
            right: 10,
            bottom: 10,
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            opacity: 0.85,
          }}
        >
          {t('canvas.panHint')}
        </div>
      </div>
    </div>
  )
}
