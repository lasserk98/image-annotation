import { useState } from 'react'
import { useApp } from '../context/AppContext'
import study from '../config/study.json'
import { buildExportData, downloadJSON } from '../utils/export'

export default function Header() {
  const { state, logout } = useApp()
  const { studentId, treatment, images, shapesByImage, classes } = state
  const [showInfo, setShowInfo] = useState(false)

  const annotatedCount = images.filter((img) => (shapesByImage[img.id]?.length ?? 0) > 0).length

  function handleExport() {
    const data = buildExportData({ studentId, treatment, images, shapesByImage, classes })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJSON(`annotations_${studentId}_${stamp}.json`, data)
  }

  return (
    <header
      className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
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
          {study.studyName}
        </p>
      </div>

      <button
        onClick={() => setShowInfo((v) => !v)}
        className="ml-1 text-xs px-1.5 rounded"
        style={{ color: 'var(--text-muted)' }}
        title="Instructions"
      >
        ⓘ
      </button>
      {showInfo && (
        <div
          className="absolute top-12 left-4 z-20 max-w-md rounded-xl p-4 text-xs shadow-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {study.instructions}
        </div>
      )}

      <div className="flex-1" />

      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {annotatedCount}/{images.length} annotated
      </span>

      <button
        onClick={handleExport}
        disabled={images.length === 0}
        className="toolbar-btn-primary"
        title="Download all annotations as JSON"
      >
        ⬇ Export
      </button>

      <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: '1px solid var(--border)' }}>
        <div className="text-right leading-tight">
          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {studentId}
          </p>
          {treatment && (
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              treatment {treatment}
            </p>
          )}
        </div>
        <button onClick={logout} className="toolbar-btn" title="Switch student">
          Log out
        </button>
      </div>
    </header>
  )
}
