import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { buildExportData, downloadJSON } from '../utils/export'
import UsageModal from './UsageModal'
import ExportWarningModal from './ExportWarningModal'

function EditableField({ value, placeholder, title, onCommit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commit() {
    onCommit(draft.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(value ?? '')
            setEditing(false)
          }
        }}
        className="field field-sm text-right"
        style={{ width: 128, background: 'var(--surface)', borderColor: 'var(--accent)' }}
        aria-label={title}
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(value ?? '')
        setEditing(true)
      }}
      className="group flex items-center gap-1 text-[13px] font-semibold rounded px-1 -mx-1"
      style={{ color: value ? 'var(--text)' : 'var(--accent-ink)' }}
      title={title}
    >
      <span className="truncate" style={{ maxWidth: 140 }}>
        {value || placeholder}
      </span>
      <span
        className="text-[10px] opacity-0 group-hover:opacity-100 transition"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden="true"
      >
        ✎
      </span>
    </button>
  )
}

export default function Header({ leftOpen, rightOpen, onToggleLeft, onToggleRight }) {
  const { state, logout, updateParticipantId, setLang, t } = useApp()
  const { participantId, treatment, images, shapesByImage, classes, lang } = state
  const [showUsage, setShowUsage] = useState(false)
  const [showExportWarning, setShowExportWarning] = useState(false)

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

      <button
        onClick={() => setShowUsage(true)}
        className="toolbar-btn flex-shrink-0"
        title={t('header.usageTitle')}
        aria-label={t('header.usageTitle')}
        style={{ color: 'var(--text-muted)' }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 7.1v4M8 4.7v.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
    </header>
  )
}
