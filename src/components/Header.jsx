import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { buildExportData, downloadJSON } from '../utils/export'
import UsageModal from './UsageModal'
import ExportWarningModal from './ExportWarningModal'
import CreatorModeModal from './CreatorModeModal'
import EditableField from './EditableField'
import { ThemeIcon } from './ThemeToggle'
import { THEME_CYCLE, THEME_LABEL_KEYS } from '../utils/theme'

function LockIcon({ locked }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7.2" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      {locked ? (
        <path d="M5.2 7.2V5a2.8 2.8 0 0 1 5.6 0v2.2" stroke="currentColor" strokeWidth="1.3" />
      ) : (
        <path d="M5.2 7.2V5a2.8 2.8 0 0 1 5.3-1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  )
}

export default function Header({ leftOpen, rightOpen, onToggleLeft, onToggleRight }) {
  const { state, logout, clearJustLoggedIn, updateParticipantId, setLang, setTheme, enterCreatorMode, exitCreatorMode, t } =
    useApp()
  const { participantId, treatment, images, shapesByImage, classes, lang, theme, creatorMode } = state
  const [showUsage, setShowUsage] = useState(false)
  const [showExportWarning, setShowExportWarning] = useState(false)
  const [showCreatorModal, setShowCreatorModal] = useState(false)

  // Header is remounted fresh each time Workspace swaps in for LoginScreen,
  // so this only fires once per actual login — not on every reload of a
  // session already saved in localStorage.
  useEffect(() => {
    if (state.justLoggedIn) {
      setShowUsage(true)
      clearJustLoggedIn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unannotated = images.filter((img) => (shapesByImage[img.id]?.length ?? 0) === 0)
  const annotatedCount = images.length - unannotated.length
  const studyName = typeof study.studyName === 'object' ? study.studyName[lang] : study.studyName
  const progress = images.length > 0 ? annotatedCount / images.length : 0
  const incomplete = images.length > 0 && unannotated.length > 0

  function runExport() {
    const data = buildExportData({ participantId, treatment, images, shapesByImage, classes })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJSON(`annotations_${participantId}_${stamp}.json`, data)
    setShowExportWarning(false)
  }

  // Leaving a frame unannotated is usually an oversight rather than a
  // deliberate "nothing here", so confirm before the file is written.
  function handleExport() {
    if (incomplete) setShowExportWarning(true)
    else runExport()
  }

  return (
    <header
      className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onToggleLeft}
          className="toolbar-btn"
          data-active={leftOpen}
          title={t('header.toggleLeftPanel')}
          aria-label={t('header.toggleLeftPanel')}
          aria-pressed={leftOpen}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
        <button
          onClick={onToggleRight}
          className="toolbar-btn"
          data-active={rightOpen}
          title={t('header.toggleRightPanel')}
          aria-label={t('header.toggleRightPanel')}
          aria-pressed={rightOpen}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 2.5v11" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6" style={{ background: 'var(--border)' }} />

      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* CSS custom properties don't resolve in SVG presentation
              attributes, so the stroke colour has to come through style. */}
          <path
            d="M4 7l6-3 4 2 6-3v14l-6 3-4-2-6 3V7z"
            style={{ stroke: 'var(--accent-contrast)' }}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold truncate min-w-0" style={{ color: 'var(--text)' }}>
        {studyName}
      </p>

      {/* Always visible while unlocked, not just on the toggle button — a
          creator shouldn't have to remember which mode they left it in
          before deleting or renaming a class. */}
      {creatorMode && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
        >
          {t('header.creatorModeBadge')}
        </span>
      )}

      <button
        onClick={() => setShowUsage(true)}
        className="toolbar-btn-info flex-shrink-0"
        title={t('header.usageTitle')}
        aria-label={t('header.usageTitle')}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 7.1v4M8 4.7v.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden md:inline">{t('header.usage')}</span>
      </button>

      <div className="flex-1 min-w-[8px]" />

      {/* Progress reads faster as a bar than as a fraction alone. */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 56, height: 5, background: 'var(--surface-3)' }}
          role="progressbar"
          aria-valuenow={annotatedCount}
          aria-valuemin={0}
          aria-valuemax={images.length}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: incomplete ? 'var(--accent)' : 'var(--success)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
        <span
          className="text-xs tabular-nums whitespace-nowrap"
          style={{ color: incomplete ? 'var(--accent-ink)' : 'var(--text-muted)' }}
          title={incomplete ? t('header.incompleteTitle', { n: unannotated.length }) : undefined}
        >
          {incomplete
            ? t('header.incompleteCount', { n: unannotated.length, total: images.length })
            : t('header.annotatedCount', { n: annotatedCount, total: images.length })}
        </span>
      </div>

      <button
        onClick={handleExport}
        disabled={images.length === 0}
        className="toolbar-btn-primary flex-shrink-0"
        title={t('header.exportTitle')}
      >
        ⬇ {t('header.export')}
      </button>

      <div
        className="flex items-center gap-2 pl-2 ml-1 flex-shrink-0"
        style={{ borderLeft: '1px solid var(--border)' }}
      >
        <div className="text-right leading-tight">
          <p
            className="text-[10px] uppercase tracking-wide"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
          >
            {t('header.participantIdLabel')}
          </p>
          <div className="flex justify-end">
            <EditableField
              value={participantId}
              placeholder={t('login.idPlaceholder')}
              title={t('header.editIdTitle')}
              onCommit={(v) => v && updateParticipantId(v)}
            />
          </div>
          {treatment && (
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {t('header.treatmentLabel', { t: treatment })}
            </p>
          )}
        </div>
        <button
          onClick={() => setTheme(THEME_CYCLE[theme])}
          className="toolbar-btn"
          title={t('header.themeTitle', { mode: t(THEME_LABEL_KEYS[theme]) })}
          aria-label={t('header.themeTitle', { mode: t(THEME_LABEL_KEYS[theme]) })}
        >
          <ThemeIcon theme={theme} />
        </button>
        <button
          // Locking never needs the password, only unlocking does — a
          // participant should always be able to back out with one click.
          onClick={() => (creatorMode ? exitCreatorMode() : setShowCreatorModal(true))}
          className="toolbar-btn"
          data-active={creatorMode}
          title={t(creatorMode ? 'header.creatorModeExitTitle' : 'header.creatorModeEnterTitle')}
          aria-label={t(creatorMode ? 'header.creatorModeExitTitle' : 'header.creatorModeEnterTitle')}
        >
          <LockIcon locked={!creatorMode} />
        </button>
        <button
          onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
          className="toolbar-btn"
          title={t('header.langTitle')}
        >
          {lang === 'en' ? 'DE' : 'EN'}
        </button>
        <button onClick={logout} className="toolbar-btn" title={t('header.logoutTitle')}>
          {t('header.logout')}
        </button>
      </div>

      {showUsage && <UsageModal onClose={() => setShowUsage(false)} />}
      {showExportWarning && (
        <ExportWarningModal
          unannotated={unannotated}
          total={images.length}
          onCancel={() => setShowExportWarning(false)}
          onConfirm={runExport}
        />
      )}
      {showCreatorModal && (
        <CreatorModeModal
          onCancel={() => setShowCreatorModal(false)}
          onSuccess={() => {
            enterCreatorMode()
            setShowCreatorModal(false)
          }}
        />
      )}
    </header>
  )
}
