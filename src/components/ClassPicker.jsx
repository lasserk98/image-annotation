import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { createClass, parseClasses, tintColor } from '../utils/classes'
import { downloadJSON } from '../utils/export'

// Above this many classes the list stops being scannable by eye, so a filter
// box appears. The sample surgical class list has 34 entries.
const FILTER_THRESHOLD = 8

// Shared so "no image selected" doesn't hand the memos below a fresh array on
// every render.
const NO_SHAPES = []

export default function ClassPicker() {
  const { state, setActiveClass, setClasses, resetClasses, addClass, t } = useApp()
  const { classes, activeClassId, currentImageId, shapesByImage } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || NO_SHAPES
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [newClassName, setNewClassName] = useState('')

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

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">{t('classPicker.heading')}</span>
        <span className="count-badge">{classes.length}</span>
        <span className="flex-1" />
      </div>

      {/* Its own row, and one that's allowed to wrap: three action buttons
          plus the heading above would overflow the fixed-width side panel
          on one non-wrapping line. */}
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
          onClick={() => inputRef.current?.click()}
          className="link-btn"
          title={t('classPicker.loadTitle')}
        >
          {t('classPicker.load')}
        </button>
        <button
          onClick={() => downloadJSON('classes.json', classes)}
          disabled={classes.length === 0}
          className="link-btn"
          title={t('classPicker.exportTitle')}
        >
          {t('classPicker.export')}
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
          <p className="panel-empty">{t('classPicker.empty')}</p>
        ) : visible.length === 0 ? (
          <p className="panel-empty">{t('classPicker.noMatches', { q: query.trim() })}</p>
        ) : (
          <div className="space-y-0.5">
            {visible.map(({ cls, index }) => {
              const active = cls.id === activeClassId
              const count = countByClass[cls.id] ?? 0
              return (
                <button
                  key={cls.id}
                  onClick={() => setActiveClass(cls.id)}
                  className="list-row"
                  aria-pressed={active}
                  title={active ? t('classPicker.activeTitle') : cls.name}
                  style={{
                    // Same colour treatment as the instance rows, so a class
                    // looks the same in the menu as the shapes it produces.
                    background: tintColor(cls.color, active ? 0.32 : 0.1),
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: active ? cls.color : 'transparent',
                    borderLeftWidth: 3,
                    borderLeftColor: cls.color,
                  }}
                >
                  <span
                    className="flex-1 min-w-0 truncate text-[13px]"
                    style={{ fontWeight: active ? 700 : 500 }}
                  >
                    {cls.name}
                  </span>
                  {count > 0 && <span className="count-badge">{count}</span>}
                  {index < 9 && <span className="kbd-hint">{index + 1}</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
