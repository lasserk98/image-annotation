import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import { clamp, distance } from '../utils/geometry'
import Toolbar from './Toolbar'

const MIN_SCALE = 0.05
const MAX_SCALE = 8
const CLOSE_HIT_RADIUS = 10 // css px, tolerance for clicking near the first point to close a polygon
const VERTEX_R = 5 // css px, constant regardless of zoom
const EDGE_HIT_R = 6 // css px, tolerance for double-clicking an edge to insert a vertex

export default function AnnotationCanvas() {
  const { state, setShapes, selectShape, setActiveClass, selectImage, undo, redo, t } = useApp()
  const { classes, activeClassId, currentImageId, images, shapesByImage, selection } = state
  const image = images.find((i) => i.id === currentImageId) || null
  const shapes = (currentImageId && shapesByImage[currentImageId]) || []
  const classById = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes])
  const activeColor = classById[activeClassId]?.color ?? '#888'

  const containerRef = useRef(null)
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [mode, setMode] = useState('select') // 'select' | 'draw'
  const [draftPoints, setDraftPoints] = useState([])
  const [cursor, setCursor] = useState(null)
  const [dragPoint, setDragPoint] = useState(null) // { index, x, y } live override while dragging a vertex

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

  useEffect(() => {
    const onResize = () => fit()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fit])

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

  function handleBackgroundMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // middle-click or alt+drag always pans
      dragRef.current = { type: 'pan', startClientX: e.clientX, startClientY: e.clientY, start: transform }
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
      dragRef.current = { type: 'pan', startClientX: e.clientX, startClientY: e.clientY, start: transform }
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

  function handleWheel(e) {
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const imgX = (mx - transform.x) / transform.scale
    const imgY = (my - transform.y) / transform.scale
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const newScale = clamp(transform.scale * factor, MIN_SCALE, MAX_SCALE)
    setTransform({
      scale: newScale,
      x: mx - imgX * newScale,
      y: my - imgY * newScale,
    })
  }

  function zoomBy(factor) {
    const el = containerRef.current
    if (!el) return
    const mx = el.clientWidth / 2
    const my = el.clientHeight / 2
    const imgX = (mx - transform.x) / transform.scale
    const imgY = (my - transform.y) / transform.scale
    const newScale = clamp(transform.scale * factor, MIN_SCALE, MAX_SCALE)
    setTransform({ scale: newScale, x: mx - imgX * newScale, y: my - imgY * newScale })
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
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">{t('canvas.empty')}</p>
      </div>
    )
  }

  const boxW = image.width * transform.scale
  const boxH = image.height * transform.scale
  const invScale = 1 / transform.scale

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Toolbar
        mode={mode}
        onToggleDraw={startDraw}
        onCancelDraw={cancelDraw}
        scale={transform.scale}
        onZoom={zoomBy}
        onFit={fit}
      />
      <div
        ref={containerRef}
        onMouseDown={handleBackgroundMouseDown}
        onWheel={handleWheel}
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'repeating-conic-gradient(var(--surface-2) 0% 25%, var(--bg) 0% 50%) 0 0 / 20px 20px',
          cursor: mode === 'draw' ? 'crosshair' : dragRef.current?.type === 'pan' ? 'grabbing' : 'default',
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
              const selected = selection.shapeId === shape.id
              const points = shape.points.map((pt, i) =>
                dragPoint && dragPoint.shapeId === shape.id && dragPoint.index === i
                  ? { x: dragPoint.x, y: dragPoint.y }
                  : pt,
              )
              const d = points.map((p) => `${p.x},${p.y}`).join(' ')
              return (
                <g key={shape.id}>
                  <polygon
                    points={d}
                    fill={cls?.color ?? '#888'}
                    fillOpacity={selected ? 0.32 : 0.2}
                    stroke={cls?.color ?? '#888'}
                    strokeWidth={(selected ? 2.5 : 1.5) * invScale}
                    onMouseDown={(e) => {
                      if (mode !== 'select') return
                      e.stopPropagation()
                      selectShape(shape.id)
                    }}
                    style={{ cursor: mode === 'select' ? 'pointer' : 'default' }}
                  />
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
                        fill={selection.vertexIndex === i ? '#fff' : cls?.color ?? '#888'}
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
      </div>
    </div>
  )
}
