import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ACTIVE_SURVEY } from '../survey/activeSurvey'
import { buildPostExportData, downloadJSON, participantFilename } from '../utils/export'
import { sanitizeSurvey } from '../utils/survey'
import ExportDoneModal from './ExportDoneModal'
import ScreenControls from './ScreenControls'

const FILE_SUFFIX = 'post'

// Last step of the post page, shown once the survey is submitted (and again
// after a reload, since the finished survey is kept). The answers only exist
// in this browser until exported, so Export is the one thing to do here.
export default function PostDoneScreen() {
  const { state, logout, t } = useApp()
  const [exportedFilename, setExportedFilename] = useState(null)
  const { participantId } = state
  const filename = participantFilename(participantId, FILE_SUFFIX)

  function handleExport() {
    // The same check as for a stored survey, so only valid answers are written.
    const survey = sanitizeSurvey(state.survey, ACTIVE_SURVEY)
    downloadJSON(filename, buildPostExportData({ participantId, survey }))
    setExportedFilename(filename)
  }

  return (
    <div className="h-full overflow-y-auto scroll-thin flex px-4 py-10 relative" style={{ background: 'var(--bg)' }}>
      <ScreenControls />
      <div
        className="w-full max-w-2xl rounded-2xl p-8 m-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 className="text-xl font-semibold mb-3">{t('postDone.title')}</h1>
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
          {t('postDone.body')}
        </p>

        <dl className="text-sm mb-6 space-y-2">
          <div className="flex gap-3">
            <dt style={{ color: 'var(--text-muted)' }}>{t('postDone.idLabel')}</dt>
            <dd className="font-semibold break-all">{participantId}</dd>
          </div>
          <div className="flex gap-3">
            <dt style={{ color: 'var(--text-muted)' }}>{t('postDone.fileLabel')}</dt>
            <dd className="font-semibold break-all">{filename}</dd>
          </div>
        </dl>

        <button type="button" onClick={handleExport} className="toolbar-btn-primary">
          {t('postDone.export')}
        </button>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={logout} className="link-btn link-btn-muted">
            {t('header.logout')}
          </button>
        </div>
      </div>
      {exportedFilename && (
        <ExportDoneModal filename={exportedFilename} onClose={() => setExportedFilename(null)} />
      )}
    </div>
  )
}
