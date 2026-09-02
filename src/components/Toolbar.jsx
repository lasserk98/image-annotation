import { useApp } from '../context/AppContext'

export default function Toolbar({ mode, onToggleDraw, onCancelDraw, scale, onZoom, onFit }) {
  const { state, undo, redo, selectImage, t } = useApp()
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
        title={t('toolbar.prevTitle')}
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
        title={t('toolbar.nextTitle')}
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
            {t('toolbar.drawingHint')}
          </span>
          <button onClick={onCancelDraw} className="toolbar-btn" title={t('toolbar.cancelTitle')}>
            {t('toolbar.cancel')}
          </button>
        </>
      ) : (
        <button onClick={onToggleDraw} className="toolbar-btn-primary" title={t('toolbar.newShapeTitle')}>
          {t('toolbar.newShape')}
        </button>
      )}

      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      <button onClick={() => undo(currentImageId)} disabled={history.past.length === 0} className="toolbar-btn" title={t('toolbar.undoTitle')}>
        ↺
      </button>
      <button onClick={() => redo(currentImageId)} disabled={history.future.length === 0} className="toolbar-btn" title={t('toolbar.redoTitle')}>
        ↻
      </button>

      <div className="flex-1" />

      <button onClick={() => onZoom(1 / 1.2)} className="toolbar-btn" title={t('toolbar.zoomOut')}>
        −
      </button>
      <span className="text-xs w-10 text-center tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {Math.round(scale * 100)}%
      </span>
      <button onClick={() => onZoom(1.2)} className="toolbar-btn" title={t('toolbar.zoomIn')}>
        +
      </button>
      <button onClick={onFit} className="toolbar-btn" title={t('toolbar.fitTitle')}>
        {t('toolbar.fit')}
      </button>
    </div>
  )
}
