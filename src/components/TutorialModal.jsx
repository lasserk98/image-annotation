import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { TUTORIAL_FRAMES } from '../tutorial/tutorialFrames'
import TutorialFigure from './TutorialFigure'

const LAST_INDEX = TUTORIAL_FRAMES.length - 1

// A tiny stand-in for the real left panel / toolbar / instances list, with
// the part the current frame is about emphasised.
function MockUi({ highlight, t }) {
  const ring = (active) => ({
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
    boxShadow: active ? '0 0 0 2px var(--ring)' : 'none',
  })
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs" aria-hidden="true">
      <span className="px-2 py-1 rounded" style={ring(highlight === 'class')}>
        {t('tutorial.className')}
      </span>
      <span className="px-2 py-1 rounded font-semibold" style={ring(highlight === 'newShape')}>
        {t('toolbar.newShape')}
      </span>
      <span className="px-2 py-1 rounded ml-auto" style={ring(highlight === 'instances')}>
        {t('instances.heading')}: ■ {t('tutorial.className')}
      </span>
    </div>
  )
}

// `onFinish` runs after the last frame; `onClose` is only given for a replay
// (the first run must be clicked through, so it has no close button/Escape).
export default function TutorialModal({ onFinish, onClose }) {
  const { t } = useApp()
  const [index, setIndex] = useState(0)
  const frame = TUTORIAL_FRAMES[index]
  const isLast = index === LAST_INDEX

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, LAST_INDEX))
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
      else if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // Empty deps intentional, as in UsageModal: mounted fresh each time it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('tutorial.title')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto scroll-thin rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">{t('tutorial.title')}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm px-1.5 rounded"
              style={{ color: 'var(--text-muted)' }}
              aria-label={t('tutorial.close')}
            >
              ✕
            </button>
          )}
        </div>

        <MockUi highlight={frame.highlight} t={t} />
        <TutorialFigure frame={frame} label={t('tutorial.figureLabel')} />

        <div className="mt-4" aria-live="polite">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('tutorial.progress', { n: index + 1, total: TUTORIAL_FRAMES.length })}
          </p>
          <h3 className="text-sm font-semibold mb-1">{t(`tutorial.${frame.id}.title`)}</h3>
          <p className="text-sm leading-relaxed">{t(`tutorial.${frame.id}.text`)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0}
            className="toolbar-btn"
          >
            {t('tutorial.back')}
          </button>
          <div className="flex gap-1.5" aria-hidden="true">
            {TUTORIAL_FRAMES.map((f, i) => (
              <span
                key={f.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i === index ? 'var(--accent)' : 'var(--border-strong)' }}
              />
            ))}
          </div>
          <button
            onClick={() => (isLast ? onFinish() : setIndex((i) => i + 1))}
            className="toolbar-btn-primary"
          >
            {isLast ? t('tutorial.finish') : t('tutorial.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
