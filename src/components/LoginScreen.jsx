import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'

export default function LoginScreen() {
  const { login, t, state, setLang } = useApp()
  const [studentId, setStudentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [treatment, setTreatment] = useState('')
  const [error, setError] = useState('')

  const urlTreatment = useMemo(
    () => new URLSearchParams(window.location.search).get('treatment'),
    [],
  )
  const lockedTreatment = Boolean(urlTreatment)

  function handleSubmit(e) {
    e.preventDefault()
    const id = studentId.trim()
    if (!id) {
      setError(t('login.errorEmpty'))
      return
    }
    const finalTreatment = urlTreatment || treatment || null
    login(id, finalTreatment, studentName.trim())
  }

  const studyName = typeof study.studyName === 'object' ? study.studyName[state.lang] : study.studyName

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg)' }}>
      <button
        onClick={() => setLang(state.lang === 'en' ? 'de' : 'en')}
        className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-md transition"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        title={t('header.langTitle')}
      >
        {state.lang === 'en' ? 'DE' : 'EN'}
      </button>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl mb-6 flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7l6-3 4 2 6-3v14l-6 3-4-2-6 3V7z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {studyName}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {t('login.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('login.name')}
            </label>
            <input
              autoFocus
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={t('login.namePlaceholder')}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('login.studentId')}
            </label>
            <input
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value)
                setError('')
              }}
              placeholder={t('login.idPlaceholder')}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {!lockedTreatment && study.treatments?.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('login.treatment')}
              </label>
              <select
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
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
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            {t('login.continue')}
          </button>
        </form>
      </div>
    </div>
  )
}
