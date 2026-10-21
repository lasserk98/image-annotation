import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { toJsonFilename } from '../utils/export'

// Asks for a file name before a JSON download. Shared by the class-list export
// and the annotation export: the caller supplies the default name, the base
// name used when the field is left blank, and the i18n key prefix for the copy.
export default function ExportFilenameModal({
  onCancel,
  onConfirm,
  defaultName = 'classes.json',
  fallbackName = 'classes',
  i18nPrefix = 'exportClassesModal',
}) {
  const { t } = useApp()
  const [name, setName] = useState(defaultName)
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
    onConfirm(toJsonFilename(name, fallbackName))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-filename-title"
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
        <h2 id="export-filename-title" className="text-base font-semibold mb-3">
          {t(`${i18nPrefix}.title`)}
        </h2>

        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
          {t(`${i18nPrefix}.filenameLabel`)}
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
          {t(`${i18nPrefix}.hint`)}
        </p>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="toolbar-btn">
            {t(`${i18nPrefix}.cancel`)}
          </button>
          <button type="submit" className="toolbar-btn-primary">
            {t(`${i18nPrefix}.confirm`)}
          </button>
        </div>
      </form>
    </div>
  )
}
