import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  createClass,
  parseClasses,
  tintColor,
  validateRenamedName,
  countClassUsage,
} from '../utils/classes'
import { downloadJSON } from '../utils/export'
import EditableField from './EditableField'
import DeleteClassModal from './DeleteClassModal'
import ExportClassesModal from './ExportClassesModal'

// Above this many classes the list stops being scannable by eye, so a filter
// box appears. The sample surgical class list has 34 entries.
const FILTER_THRESHOLD = 8

// Shared so "no image selected" doesn't hand the memos below a fresh array on
// every render.
const NO_SHAPES = []

export default function ClassPicker() {
  const { state, setActiveClass, setClasses, resetClasses, addClass, renameClass, deleteClass, t } =
    useApp()
  const { classes, activeClassId, currentImageId, shapesByImage, creatorMode } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || NO_SHAPES
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null) // { cls, usage }
  const [showExportModal, setShowExportModal] = useState(false)

  const countByClass = useMemo(() => {
    const counts = {}
    for (const s of shapes) counts[s.classId] = (counts[s.classId] ?? 0) + 1
    return counts
  }, [shapes])

  // Keep the original index alongside each entry: the 1–9 keyboard shortcuts
  // address the unfiltered list, so the hint must not renumber while filtering.
  const visible = useMemo(() => {
    const indexed = classes.map((cls, index) => ({ cls, index }))
    const q = query.trim().toLowerCase()
    if (!q) return indexed
    return indexed.filter(({ cls }) => cls.name.toLowerCase().includes(q))
  }, [classes, query])

  async function handleFile(file) {
    setError('')
    try {
      const text = await file.text()
      const parsed = parseClasses(JSON.parse(text))
      setClasses(parsed)
      setQuery('')
    } catch (err) {
      setError(err.message || 'Could not read that file.')
    }
  }

  function handleCreateClass(e) {
    e.preventDefault()
    setError('')
    try {
      const cls = createClass(newClassName, classes)
      addClass(cls)
      setNewClassName('')
    } catch (err) {
      setError(err.message || 'Could not create that class.')
    }
  }

  // Throws back through EditableField's onCommit on a bad name, so the field
  // stays open with the error shown instead of silently discarding it.
  function handleRename(cls, name) {
    const validated = validateRenamedName(cls.id, name, classes)
    renameClass(cls.id, validated)
  }

  function handleDeleteClick(cls) {
    const usage = countClassUsage(cls.id, shapesByImage)
    if (usage === 0) {
      deleteClass(cls.id)
    } else {
      setDeleteTarget({ cls, usage })
    }
  }

  return (
    <>
      {/* Load sits in the header next to the heading, same as the "+ Add"
          button in ImageGallery's panel-header — and it's available in both
          modes, since a participant in the default Annotation Mode still
          needs to be able to pick up a config a coordinator hands them, even
          though creating, renaming, deleting, resetting or exporting the
          list stays gated to Creator Mode below. */}
      <div className="panel-header">
        <span className="panel-title">{t('classPicker.heading')}</span>
        <span className="count-badge">{classes.length}</span>
        <span className="flex-1" />
        <button
          onClick={() => inputRef.current?.click()}
          className="link-btn"
          title={t('classPicker.loadTitle')}
        >
          {t('classPicker.load')}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {/* Everything here edits the class list itself — gated to Creator
          Mode so a participant in the default Annotation Mode can only ever
          pick from whatever list a coordinator already set up. */}
      {creatorMode && (
        <>
          {/* Its own row, and one that's allowed to wrap: both action
              buttons plus the heading above would overflow the fixed-width
              side panel on one non-wrapping line. */}
          <div
            className="px-3 py-2 flex-shrink-0 flex items-center flex-wrap gap-1.5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {classes.length > 0 && (
              <button
                onClick={resetClasses}
                className="link-btn link-btn-muted"
                title={t('classPicker.resetTitle')}
              >
                {t('classPicker.reset')}
              </button>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              disabled={classes.length === 0}
              className="link-btn"
              title={t('classPicker.exportTitle')}
            >
              {t('classPicker.export')}
            </button>
          </div>

          <form
            onSubmit={handleCreateClass}
            className="px-3 py-2 flex-shrink-0 flex items-center gap-1.5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder={t('classPicker.newClassPlaceholder')}
              className="field field-sm flex-1"
              aria-label={t('classPicker.newClassPlaceholder')}
            />
            <button type="submit" className="link-btn" title={t('classPicker.addClassTitle')}>
              {t('classPicker.addClass')}
            </button>
          </form>
        </>
      )}

      {classes.length > FILTER_THRESHOLD && (
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('classPicker.filterPlaceholder')}
            className="field field-sm"
            aria-label={t('classPicker.filterPlaceholder')}
          />
        </div>
      )}

      {error && (
        <p
          className="text-xs px-3 py-2 flex-shrink-0"
          style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="panel-body" aria-label={t('classPicker.heading')}>
        {classes.length === 0 ? (
          <p className="panel-empty">{t(creatorMode ? 'classPicker.empty' : 'classPicker.emptyLocked')}</p>
        ) : visible.length === 0 ? (
          <p className="panel-empty">{t('classPicker.noMatches', { q: query.trim() })}</p>
        ) : (
          <div className="space-y-0.5">
            {visible.map(({ cls, index }) => {
              const active = cls.id === activeClassId
              const count = countByClass[cls.id] ?? 0
              return (
                // A plain <button> can no longer wrap the whole row once it
                // needs to contain its own interactive children (rename
                // field, delete button) in Creator Mode, hence div+role
                // instead. Its onKeyDown below only reacts when the row
                // itself is the event target, not a bubbled keydown from
                // one of those nested children.
                <div
                  key={cls.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveClass(cls.id)}
                  onKeyDown={(e) => {
                    // Only react when the row itself has focus — Space/Enter
                    // keydowns bubble up from the nested rename input and
                    // delete button too, and preventDefault-ing Space there
                    // would swallow the space character before it's typed.
                    if (e.target !== e.currentTarget) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveClass(cls.id)
                    }
                  }}
                  className="list-row"
                  aria-pressed={active}
                  title={active ? t('classPicker.activeTitle') : cls.name}
                  style={{
                    cursor: 'pointer',
                    // Same colour treatment as the instance rows, so a class
                    // looks the same in the menu as the shapes it produces.
                    background: tintColor(cls.color, active ? 0.32 : 0.1),
                    borderWidth: 1,
                    borderStyle: 'solid',
                    // Per-side colours, not the `borderColor` shorthand: React
                    // only reapplies a style key to the DOM when its own value
                    // changes between renders, but writing the `border-color`
                    // shorthand resets all four side colours in the CSSOM at
                    // once. Toggling `active` only changes these three sides —
                    // it was clobbering the still-unchanged left colour below,
                    // which React then never reapplied to fix.
                    borderTopColor: active ? cls.color : 'transparent',
                    borderRightColor: active ? cls.color : 'transparent',
                    borderBottomColor: active ? cls.color : 'transparent',
                    borderLeftWidth: 3,
                    borderLeftColor: cls.color,
                  }}
                >
                  {creatorMode ? (
                    <EditableField
                      value={cls.name}
                      title={t('classPicker.renameTitle')}
                      onCommit={(name) => handleRename(cls, name)}
                      className="flex-1 min-w-0 group flex items-center gap-1 text-[13px] rounded"
                      style={{ fontWeight: active ? 700 : 500, color: 'var(--text)' }}
                      inputClassName="field field-sm"
                      inputStyle={{ width: '100%', textAlign: 'left' }}
                    />
                  ) : (
                    <span
                      className="flex-1 min-w-0 truncate text-[13px]"
                      style={{ fontWeight: active ? 700 : 500 }}
                    >
                      {cls.name}
                    </span>
                  )}
                  {count > 0 && <span className="count-badge">{count}</span>}
                  {index < 9 && <span className="kbd-hint">{index + 1}</span>}
                  {creatorMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(cls)
                      }}
                      className="row-action"
                      title={t('classPicker.deleteTitle')}
                      aria-label={t('classPicker.deleteTitle')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteClassModal
          className={deleteTarget.cls.name}
          count={deleteTarget.usage}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteClass(deleteTarget.cls.id)
            setDeleteTarget(null)
          }}
        />
      )}

      {showExportModal && (
        <ExportClassesModal
          onCancel={() => setShowExportModal(false)}
          onConfirm={(filename) => {
            downloadJSON(filename, classes)
            setShowExportModal(false)
          }}
        />
      )}
    </>
  )
}
