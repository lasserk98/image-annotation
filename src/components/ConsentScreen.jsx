import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CONSENT_TEXT } from '../survey/consentText'
import ScreenControls from './ScreenControls'

// Shown after login and before the survey. The participant has to tick the
// agreement before they can continue; the time they did is stored with the
// survey answers.
export default function ConsentScreen() {
  const { acceptConsent, logout, t } = useApp()
  const [agreed, setAgreed] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (agreed) acceptConsent()
  }

  return (
    // The card centres itself with `m-auto`, which (unlike centring on the
    // container) never pushes a tall card's top edge out of reach.
    <div className="h-full overflow-y-auto scroll-thin flex px-4 py-10 relative" style={{ background: 'var(--bg)' }}>
      <ScreenControls />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl p-8 m-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {CONSENT_TEXT.title}
        </h1>
        {CONSENT_TEXT.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
            {paragraph}
          </p>
        ))}

        <label className="flex items-start gap-2 text-sm mt-5" style={{ color: 'var(--text)' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>{CONSENT_TEXT.agreement}</span>
        </label>

        <div className="flex gap-2 justify-between mt-6">
          <button type="button" onClick={logout} className="toolbar-btn">
            {t('header.logout')}
          </button>
          <button type="submit" disabled={!agreed} className="toolbar-btn-primary">
            {t('consent.continue')}
          </button>
        </div>
      </form>
    </div>
  )
}
