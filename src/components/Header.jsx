import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { buildExportData, downloadJSON } from '../utils/export'
import UsageModal from './UsageModal'

export default function Header() {
  const { state, logout, updateStudentId, setLang, t } = useApp()
  const { studentId, treatment, images, shapesByImage, classes, lang } = state
  const [showUsage, setShowUsage] = useState(false)
  const [editingId, setEditingId] = useState(false)
  const [idDraft, setIdDraft] = useState(studentId ?? '')
  const idInputRef = useRef(null)

  useEffect(() => {
    if (editingId) idInputRef.current?.focus()
  }, [editingId])

  const annotatedCount = images.filter((img) => (shapesByImage[img.id]?.length ?? 0) > 0).length
  const studyName = typeof study.studyName === 'object' ? study.studyName[lang] : study.studyName

  function handleExport() {
    const data = buildExportData({ studentId, treatment, images, shapesByImage, classes })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJSON(`annotations_${studentId}_${stamp}.json`, data)
  }

  function commitIdEdit() {
    const trimmed = idDraft.trim()
    if (trimmed) updateStudentId(trimmed)
    else setIdDraft(studentId ?? '')
    setEditingId(false)
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
          {editingId ? (
            <input
              ref={idInputRef}
              value={idDraft}
              onChange={(e) => setIdDraft(e.target.value)}
              onBlur={commitIdEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitIdEdit()
                if (e.key === 'Escape') {
                  setIdDraft(studentId ?? '')
                  setEditingId(false)
                }
              }}
              className="text-xs font-medium text-right rounded px-1 outline-none w-24"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--accent)', color: 'var(--text)' }}
            />
          ) : (
            <button
              onClick={() => {
                setIdDraft(studentId ?? '')
                setEditingId(true)
              }}
              className="text-xs font-medium"
              style={{ color: 'var(--text)' }}
              title={t('header.editIdTitle')}
            >
              {studentId} ✎
            </button>
          )}
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
