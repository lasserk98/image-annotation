import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { buildExportData, downloadJSON } from '../utils/export'
import UsageModal from './UsageModal'

function EditableField({ value, placeholder, title, className, onCommit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
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
        className={`${className} rounded px-1 outline-none w-28`}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--accent)', color: 'var(--text)' }}
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(value ?? '')
        setEditing(true)
      }}
      className={className}
      style={{ color: value ? 'var(--text)' : 'var(--accent)' }}
      title={title}
    >
      {value ? `${value} ✎` : placeholder}
    </button>
  )
}

export default function Header() {
  const { state, logout, updateStudentId, setLang, t } = useApp()
  const { studentId, treatment, images, shapesByImage, classes, lang } = state
  const [showUsage, setShowUsage] = useState(false)

  const annotatedCount = images.filter((img) => (shapesByImage[img.id]?.length ?? 0) > 0).length
  const studyName = typeof study.studyName === 'object' ? study.studyName[lang] : study.studyName

  function handleExport() {
    const data = buildExportData({ studentId, treatment, images, shapesByImage, classes })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJSON(`annotations_${studentId}_${stamp}.json`, data)
  }

  return (
    <header
      className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 relative"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M4 7l6-3 4 2 6-3v14l-6 3-4-2-6 3V7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
          {studyName}
        </p>
      </div>

      <button
        onClick={() => setShowUsage(true)}
        className="ml-1 text-xs px-1.5 rounded"
        style={{ color: 'var(--text-muted)' }}
        title={t('header.usageTitle')}
      >
        ⓘ
      </button>

      <div className="flex-1" />

      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('header.annotatedCount', { n: annotatedCount, total: images.length })}
      </span>

      <button
        onClick={handleExport}
        disabled={images.length === 0}
        className="toolbar-btn-primary"
        title={t('header.exportTitle')}
      >
        ⬇ {t('header.export')}
      </button>

      <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid var(--border)' }}>
        <div className="text-right leading-tight">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {t('header.studentIdLabel')}
          </p>
          <EditableField
            value={studentId}
            placeholder={t('login.idPlaceholder')}
            title={t('header.editIdTitle')}
            className="text-xs font-medium text-right block"
            onCommit={(v) => v && updateStudentId(v)}
          />
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
    </header>
  )
}
