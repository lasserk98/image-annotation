import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'

const SHORTCUT_KEYS = [
  { key: 'N', labelKey: 'usage.shortcut.newShape' },
  { key: '1–9', labelKey: 'usage.shortcut.classNumber' },
  { key: 'Enter', labelKey: 'usage.shortcut.enter' },
  { key: 'Esc', labelKey: 'usage.shortcut.esc' },
  { key: 'Delete', labelKey: 'usage.shortcut.delete' },
  { key: 'Ctrl+Z', labelKey: 'usage.shortcut.undo' },
  { key: 'Ctrl+Shift+Z', labelKey: 'usage.shortcut.redo' },
  { key: '← →', labelKey: 'usage.shortcut.arrows' },
  { key: 'Double-click vertex', labelKey: 'usage.shortcut.dblClickVertex' },
  { key: 'Double-click edge', labelKey: 'usage.shortcut.dblClickEdge' },
]

const STEP_KEYS = ['usage.step1', 'usage.step2', 'usage.step3', 'usage.step4', 'usage.step5', 'usage.step6']

export default function UsageModal({ onClose }) {
  const { t, state } = useApp()
  const instructions =
    typeof study.instructions === 'object' ? study.instructions[state.lang] : study.instructions

  // Empty deps intentional: this component is freshly mounted each time the
  // modal opens (conditionally rendered), so the first-render closure over
  // onClose is always the current one. Depending on [onClose] would tear
  // down and rebuild this listener on every parent re-render — including
  // ones triggered by the very Escape keydown this listener needs to catch.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto scroll-thin rounded-2xl shadow-xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{t('usage.title')}</h2>
          <button
            onClick={onClose}
            className="text-sm px-1.5 rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {instructions && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t('usage.instructionsHeading')}
            </h3>
            <p className="text-sm leading-relaxed">{instructions}</p>
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {t('usage.stepsHeading')}
          </h3>
          <ol className="text-sm leading-relaxed space-y-1.5 list-decimal list-inside">
            {STEP_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {t('usage.shortcutsHeading')}
          </h3>
          <div className="space-y-1">
            {SHORTCUT_KEYS.map(({ key, labelKey }) => (
              <div key={key} className="flex items-center gap-3 text-sm py-0.5">
                <code
                  className="text-[11px] px-1.5 py-0.5 rounded flex-shrink-0 min-w-[7.5rem] text-center"
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  {key}
                </code>
                <span style={{ color: 'var(--text-muted)' }}>{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="toolbar-btn-primary w-full mt-6"
        >
          {t('usage.close')}
        </button>
      </div>
    </div>
  )
}
