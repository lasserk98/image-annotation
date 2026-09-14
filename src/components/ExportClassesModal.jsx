import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { toJsonFilename } from '../utils/export'

export default function ExportClassesModal({ onCancel, onConfirm }) {
  const { t } = useApp()
  const [name, setName] = useState('classes.json')
  const inputRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm(toJsonFilename(name))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-classes-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 id="export-classes-title" className="text-base font-semibold mb-3">
          {t('exportClassesModal.title')}
        </h2>

        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
          {t('exportClassesModal.filenameLabel')}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field w-full mb-1.5"
          autoFocus
        />
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('exportClassesModal.hint')}
        </p>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="toolbar-btn">
            {t('exportClassesModal.cancel')}
          </button>
          <button type="submit" className="toolbar-btn-primary">
            {t('exportClassesModal.confirm')}
          </button>
        </div>
      </form>
    </div>
  )
}
