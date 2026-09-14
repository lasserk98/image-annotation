import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'

export default function CreatorModeModal({ onCancel, onSuccess }) {
  const { t } = useApp()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    // This only ever runs in the browser, so the password ships inside the
    // app bundle — it's a deliberate "are you sure?" speed bump against
    // accidental clicks, not a real access-control boundary.
    if (password === study.creatorPassword) {
      onSuccess()
    } else {
      setError(t('creatorModal.wrongPassword'))
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-modal-title"
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
        <h2 id="creator-modal-title" className="text-base font-semibold mb-1.5">
          {t('creatorModal.title')}
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('creatorModal.description')}
        </p>

        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
          {t('creatorModal.passwordLabel')}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          placeholder={t('creatorModal.passwordLabel')}
          className="field w-full mb-1.5"
          autoFocus
        />
        {error && (
          <p className="text-xs mb-2" style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <button type="button" onClick={onCancel} className="toolbar-btn">
            {t('creatorModal.cancel')}
          </button>
          <button type="submit" className="toolbar-btn-primary">
            {t('creatorModal.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
