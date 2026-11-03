import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CONSENT_TEXT } from '../survey/consentText'
import ScreenControls from './ScreenControls'

function renderParagraph(paragraph) {
  return (
    <p key={paragraph} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
      {paragraph}
    </p>
  )
}

function renderSubsection({ heading, paragraphs }) {
  return (
    <div key={heading}>
      <h3 className="text-sm font-semibold mt-4 mb-1" style={{ color: 'var(--text)' }}>
        {heading}
      </h3>
      {paragraphs.map(renderParagraph)}
    </div>
  )
}

function renderSection({ heading, paragraphs, subsections = [] }) {
  return (
    <section key={heading}>
      <h2 className="text-base font-semibold mt-5 mb-2" style={{ color: 'var(--text)' }}>
        {heading}
      </h2>
      {paragraphs.map(renderParagraph)}
      {subsections.map(renderSubsection)}
    </section>
  )
}

// Shown after login and before the survey. The participant has to tick every
// agreement before they can continue; the time they did is stored with the
// survey answers.
export default function ConsentScreen() {
  const { acceptConsent, t } = useApp()
  const [agreed, setAgreed] = useState({})
  const isAllAgreed = CONSENT_TEXT.agreements.every(({ id }) => agreed[id])

  function handleSubmit(e) {
    e.preventDefault()
    if (isAllAgreed) acceptConsent()
  }

  return (
    // The card centres itself with `m-auto`, which (unlike centring on the
    // container) never pushes a tall card's top edge out of reach.
    <div className="h-full overflow-y-auto scroll-thin flex px-4 py-10 relative" style={{ background: 'var(--bg)' }}>
      <ScreenControls />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl p-8 m-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {CONSENT_TEXT.title}
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {CONSENT_TEXT.subtitle}
        </p>
        {CONSENT_TEXT.sections.map(renderSection)}

        <h2 className="text-base font-semibold mt-5 mb-2" style={{ color: 'var(--text)' }}>
          {CONSENT_TEXT.declaration.heading}
        </h2>
        {renderParagraph(CONSENT_TEXT.declaration.intro)}

        {CONSENT_TEXT.agreements.map(({ id, label }) => (
          <label key={id} className="flex items-start gap-2 text-sm mt-3" style={{ color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={Boolean(agreed[id])}
              onChange={(e) => setAgreed((prev) => ({ ...prev, [id]: e.target.checked }))}
              className="mt-0.5"
            />
            <span>{label}</span>
          </label>
        ))}

        <div className="flex gap-2 justify-end mt-6">
          <button type="submit" disabled={!isAllAgreed} className="toolbar-btn-primary">
            {t('consent.continue')}
          </button>
        </div>
      </form>
    </div>
  )
}
