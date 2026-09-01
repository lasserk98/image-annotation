import { useApp } from '../context/AppContext'

export default function Toolbar({ mode, onToggleDraw, onCancelDraw, scale, onZoom, onFit }) {
  const { state, undo, redo, selectImage } = useApp()
  const { images, currentImageId, historyByImage } = state
  const index = images.findIndex((i) => i.id === currentImageId)
  const history = (currentImageId && historyByImage[currentImageId]) || { past: [], future: [] }

  function go(delta) {
    const next = images[index + delta]
    if (next) selectImage(next.id)
  }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <button
        onClick={() => go(-1)}
        disabled={index <= 0}
        className="toolbar-btn"
        title="Previous image (←)"
      >
        ‹
      </button>
      <span className="text-xs px-1 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {images.length ? `${index + 1} / ${images.length}` : '0 / 0'}
      </span>
      <button
        onClick={() => go(1)}
        disabled={index >= images.length - 1}
        className="toolbar-btn"
        title="Next image (→)"
      >
        ›
      </button>

      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      {mode === 'draw' ? (
        <>
          <span
            className="text-xs font-medium px-2 py-1 rounded-md"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Drawing… click to add points, Enter to finish
          </span>
          <button onClick={onCancelDraw} className="toolbar-btn" title="Cancel (Esc)">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={onToggleDraw} className="toolbar-btn-primary" title="New shape (N)">
          + New shape
        </button>
      )}

      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      <button onClick={() => undo(currentImageId)} disabled={history.past.length === 0} className="toolbar-btn" title="Undo (Ctrl+Z)">
        ↺
      </button>
      <button onClick={() => redo(currentImageId)} disabled={history.future.length === 0} className="toolbar-btn" title="Redo (Ctrl+Shift+Z)">
        ↻
      </button>

      <div className="flex-1" />

      <button onClick={() => onZoom(1 / 1.2)} className="toolbar-btn" title="Zoom out">
        −
      </button>
      <span className="text-xs w-10 text-center tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {Math.round(scale * 100)}%
      </span>
      <button onClick={() => onZoom(1.2)} className="toolbar-btn" title="Zoom in">
        +
      </button>
      <button onClick={onFit} className="toolbar-btn" title="Fit to screen">
        Fit
      </button>
    </div>
  )
}
