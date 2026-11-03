import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

// Shown to a study participant right after the export downloads. The file
// just lands in the browser's download folder, so this says which file to
// upload — by how its name ends, never with the participant ID in front of it,
// since the ID is not shown to participants. It names no upload location: the
// repo is public, and the folder is given in the participant's invitation
// email. `phaseId` picks what the participant is told to do next.
export default function ExportDoneModal({ fileEnding, phaseId, onClose }) {
  const { t } = useApp()

  // Empty deps intentional, as in UsageModal: mounted fresh each time it opens.
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
      aria-labelledby="export-done-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 id="export-done-title" className="text-base font-semibold mb-3">
          {t('exportDone.title')}
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('exportDone.saved')}
        </p>
        <p
          className="text-sm font-semibold rounded-lg px-3 py-2 mb-3 break-all"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {fileEnding}
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
          {t('exportDone.upload')}
        </p>
        {phaseId && (
          <p className="text-sm leading-relaxed mb-5 font-semibold">{t(`exportDone.next.${phaseId}`)}</p>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="toolbar-btn-primary" autoFocus>
            {t('usage.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
