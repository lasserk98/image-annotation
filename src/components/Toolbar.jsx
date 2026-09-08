import { useApp } from '../context/AppContext'

function Divider() {
  return <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: 'var(--border)' }} />
}

export default function Toolbar({ mode, onToggleDraw, onCancelDraw, scale, onZoom, onFit, activeClass }) {
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
      className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0 overflow-x-auto scroll-thin"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <button
        onClick={() => go(-1)}
        disabled={index <= 0}
        className="toolbar-btn"
        title={t('toolbar.prevTitle')}
        aria-label={t('toolbar.prevTitle')}
      >
        ‹
      </button>
      <span
        className="text-xs px-1 tabular-nums flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {images.length ? `${index + 1} / ${images.length}` : '0 / 0'}
      </span>
      <button
        onClick={() => go(1)}
        disabled={index >= images.length - 1}
        className="toolbar-btn"
        title={t('toolbar.nextTitle')}
        aria-label={t('toolbar.nextTitle')}
      >
        ›
      </button>

      <Divider />

      {mode === 'draw' ? (
        <>
          <span
            className="text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap"
            style={{ background: 'var(--accent-soft-strong)', color: 'var(--accent-ink)' }}
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

      {/* Which class the next shape gets is otherwise only visible in the left
          panel, which can be collapsed — surface it next to the draw button. */}
      {activeClass && (
        <span
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md min-w-0"
          style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
          title={t('toolbar.activeClass')}
        >
          <span
            className="swatch"
            style={{ background: activeClass.color, width: 9, height: 9 }}
          />
          <span className="truncate" style={{ maxWidth: 150 }}>
            {activeClass.name}
          </span>
        </span>
      )}

      <Divider />

      <button
        onClick={() => undo(currentImageId)}
        disabled={history.past.length === 0}
        className="toolbar-btn"
        title={t('toolbar.undoTitle')}
        aria-label={t('toolbar.undoTitle')}
      >
        ↺
      </button>
      <button
        onClick={() => redo(currentImageId)}
        disabled={history.future.length === 0}
        className="toolbar-btn"
        title={t('toolbar.redoTitle')}
        aria-label={t('toolbar.redoTitle')}
      >
        ↻
      </button>

      <div className="flex-1 min-w-[8px]" />

      <button
        onClick={() => onZoom(1 / 1.2)}
        className="toolbar-btn"
        title={t('toolbar.zoomOut')}
        aria-label={t('toolbar.zoomOut')}
      >
        −
      </button>
      <span
        className="text-xs w-11 text-center tabular-nums flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => onZoom(1.2)}
        className="toolbar-btn"
        title={t('toolbar.zoomIn')}
        aria-label={t('toolbar.zoomIn')}
      >
        +
      </button>
      <button onClick={onFit} className="toolbar-btn" title={t('toolbar.fitTitle')}>
        {t('toolbar.fit')}
      </button>
    </div>
  )
}
