import { useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { LINK_PARAMS } from '../utils/linkParams'
import { ACTIVE_PHASE } from '../variant'
import PhaseBadge from './PhaseBadge'
import ScreenControls from './ScreenControls'

// The entry gate of a study phase. The participant only enters the password:
// their ID comes from the personal link in their email (and is never shown),
// and so does the treatment, when the link carries one.
export default function LoginScreen() {
  const { login, t, state } = useApp()
  const [password, setPassword] = useState('')
  const [treatment, setTreatment] = useState('')
  const [error, setError] = useState('')

  const lockedTreatment = Boolean(LINK_PARAMS.treatment)

  function handleSubmit(e) {
    e.preventDefault()
    // This only ever runs in the browser, so the password ships inside the
    // app bundle — it keeps casual visitors out of the study page, it is not
    // an access-control boundary.
    // All phase passwords live in study.json, so they ship in every bundle that
    // imports it: they keep casual visitors out, they do not gate by time.
    if (password !== study[ACTIVE_PHASE.passwordKey]) {
      setError(t('login.errorPassword'))
      return
    }
    login(LINK_PARAMS.id, LINK_PARAMS.treatment || treatment || null)
  }

  const studyName = typeof study.studyName === 'object' ? study.studyName[state.lang] : study.studyName

  return (
    // The document itself never scrolls, so this screen owns its overflow —
    // the card stays reachable on short viewports.
    <div
      className="h-full overflow-y-auto scroll-thin flex items-center justify-center px-4 py-10 relative"
      style={{ background: 'var(--bg)' }}
    >
      <ScreenControls />
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
        <div className="mb-2">
          <PhaseBadge />
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
              htmlFor="study-password"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('login.password')}
            </label>
            <input
              id="study-password"
              name="study-password"
              type="password"
              autoFocus
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="field"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
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
            <p id="login-error" className="text-xs" style={{ color: 'var(--danger)' }} role="alert">
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
