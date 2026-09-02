import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'

export default function LoginScreen() {
  const { login } = useApp()
  const [studentId, setStudentId] = useState('')
  const [treatment, setTreatment] = useState('')
  const [error, setError] = useState('')
  const [rosterIds, setRosterIds] = useState(null) // null while loading

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}roster.json`)
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((data) => setRosterIds(Array.isArray(data.ids) ? data.ids : []))
      .catch(() => setRosterIds([]))
  }, [])

  const urlTreatment = useMemo(
    () => new URLSearchParams(window.location.search).get('treatment'),
    [],
  )
  const lockedTreatment = Boolean(urlTreatment)
  const rosterLoading = rosterIds === null
  const hasRoster = rosterIds && rosterIds.length > 0

  function handleSubmit(e) {
    e.preventDefault()
    const id = studentId.trim()
    if (!id) {
      setError('Please enter your student ID.')
      return
    }
    if (hasRoster && !rosterIds.includes(id)) {
      setError('That student ID was not found on the roster. Please double-check it.')
      return
    }
    const finalTreatment = urlTreatment || treatment || null
    login(id, finalTreatment)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
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
          {study.studyName}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Enter your student ID to start annotating. Your images never leave your browser.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Student ID
            </label>
            <input
              autoFocus
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value)
                setError('')
              }}
              placeholder="e.g. s1234567"
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
                Treatment
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
                <option value="">Select treatment…</option>
                {study.treatments.map((t) => (
                  <option key={t} value={t}>
                    {t}
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
            disabled={rosterLoading}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {rosterLoading ? 'Loading…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
