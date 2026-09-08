import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

// How many filenames to spell out before falling back to a count.
const MAX_LISTED = 8

export default function ExportWarningModal({ unannotated, total, onCancel, onConfirm }) {
  const { t } = useApp()

  // Empty deps intentional, as in UsageModal: this component is mounted fresh
  // each time the dialog opens, so the first-render closure is current.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const listed = unannotated.slice(0, MAX_LISTED)
  const remaining = unannotated.length - listed.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <span
            className="flex-shrink-0 flex items-center justify-center rounded-full text-[15px]"
            style={{
              width: 30,
              height: 30,
              background: 'var(--accent-soft-strong)',
              color: 'var(--accent-ink)',
            }}
            aria-hidden="true"
          >
            !
          </span>
          <h2 id="export-warning-title" className="text-base font-semibold pt-1">
            {t('export.incompleteTitle')}
          </h2>
        </div>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('export.incompleteBody', { n: unannotated.length, total })}
        </p>

        <div
          className="rounded-lg mb-5 max-h-44 overflow-y-auto scroll-thin"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <ul className="text-xs px-3 py-2 space-y-1">
            {listed.map((img) => (
              <li key={img.id} className="truncate" style={{ color: 'var(--text)' }} title={img.name}>
                {img.name}
              </li>
            ))}
            {remaining > 0 && (
              <li style={{ color: 'var(--text-muted)' }}>{t('export.andMore', { n: remaining })}</li>
            )}
          </ul>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="toolbar-btn" style={{ borderColor: 'var(--border)' }} autoFocus>
            {t('export.goBack')}
          </button>
          <button onClick={onConfirm} className="toolbar-btn-primary">
            {t('export.exportAnyway')}
          </button>
        </div>
      </div>
    </div>
  )
}
