import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { parseClasses, tintColor } from '../utils/classes'

// Above this many classes the list stops being scannable by eye, so a filter
// box appears. The sample surgical class list has 34 entries.
const FILTER_THRESHOLD = 8

// Shared so "no image selected" doesn't hand the memos below a fresh array on
// every render.
const NO_SHAPES = []

export default function ClassPicker() {
  const { state, setActiveClass, setClasses, resetClasses, t } = useApp()
  const { classes, activeClassId, currentImageId, shapesByImage, classesAreCustom } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || NO_SHAPES
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

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

  return (
    <>
      <div className="panel-header">
        <span className="panel-title">{t('classPicker.heading')}</span>
        <span className="count-badge">{classes.length}</span>
        {classesAreCustom && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: 'var(--accent-soft-strong)', color: 'var(--accent-ink)' }}
          >
            {t('classPicker.custom')}
          </span>
        )}
        <span className="flex-1" />
        {classesAreCustom && (
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
        {visible.length === 0 ? (
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
