import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function DeleteClassModal({ className, count, onCancel, onConfirm }) {
  const { t } = useApp()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-class-title"
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
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
            }}
            aria-hidden="true"
          >
            !
          </span>
          <h2 id="delete-class-title" className="text-base font-semibold pt-1">
            {t('deleteClassModal.title', { name: className })}
          </h2>
        </div>

        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
          {t('deleteClassModal.body', { n: count })}
        </p>

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="toolbar-btn" autoFocus>
            {t('deleteClassModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="toolbar-btn-primary"
            style={{ background: 'var(--danger)', color: '#fff' }}
          >
            {t('deleteClassModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
