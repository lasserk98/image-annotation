import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'

export default function LoginScreen() {
  const { login, t, state, setLang } = useApp()
  const [participantId, setParticipantId] = useState('')
  const [treatment, setTreatment] = useState('')
  const [error, setError] = useState('')

  const urlTreatment = useMemo(
    () => new URLSearchParams(window.location.search).get('treatment'),
    [],
  )
  const lockedTreatment = Boolean(urlTreatment)

  function handleSubmit(e) {
    e.preventDefault()
    const id = participantId.trim()
    if (!id) {
      setError(t('login.errorEmpty'))
      return
    }
    const finalTreatment = urlTreatment || treatment || null
    login(id, finalTreatment)
  }

  const studyName = typeof study.studyName === 'object' ? study.studyName[state.lang] : study.studyName

  return (
    // The document itself never scrolls, so this screen owns its overflow —
    // the card stays reachable on short viewports.
    <div
      className="h-full overflow-y-auto scroll-thin flex items-center justify-center px-4 py-10 relative"
      style={{ background: 'var(--bg)' }}
    >
      <button
        onClick={() => setLang(state.lang === 'en' ? 'de' : 'en')}
        className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1.5 rounded-md transition"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
        title={t('header.langTitle')}
      >
        {state.lang === 'en' ? 'DE' : 'EN'}
      </button>
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl mb-6 flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {/* CSS custom properties don't resolve in SVG presentation
                attributes, so the stroke colour has to come through style. */}
            <path
              d="M4 7l6-3 4 2 6-3v14l-6 3-4-2-6 3V7z"
              style={{ stroke: 'var(--accent-contrast)' }}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
          {studyName}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {t('login.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="participant-id"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('login.participantId')}
            </label>
            <input
              id="participant-id"
              name="participant-id"
              autoFocus
              autoComplete="off"
              value={participantId}
              onChange={(e) => {
                setParticipantId(e.target.value)
                setError('')
              }}
              placeholder={t('login.idPlaceholder')}
              className="field"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'participant-id-error' : undefined}
            />
          </div>

          {!lockedTreatment && study.treatments?.length > 0 && (
            <div>
              <label
                htmlFor="treatment"
                className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('login.treatment')}
              </label>
              <select
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="field"
              >
                <option value="">{t('login.selectTreatment')}</option>
                {study.treatments.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p id="participant-id-error" className="text-xs" style={{ color: 'var(--danger)' }} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="toolbar-btn-primary w-full" style={{ padding: '10px 12px' }}>
            {t('login.continue')}
          </button>
        </form>
      </div>
    </div>
  )
}
