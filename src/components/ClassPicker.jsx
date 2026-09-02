import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { parseClasses } from '../utils/classes'

export default function ClassPicker() {
  const { state, setActiveClass, setClasses, resetClasses, t } = useApp()
  const { classes, activeClassId, currentImageId, shapesByImage, classesAreCustom } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || []
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  async function handleFile(file) {
    setError('')
    try {
      const text = await file.text()
      const parsed = parseClasses(JSON.parse(text))
      setClasses(parsed)
    } catch (err) {
      setError(err.message || 'Could not read that file.')
    }
  }

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {t('classPicker.heading')}
          {classesAreCustom && (
            <span className="ml-1.5 normal-case font-normal" style={{ color: 'var(--accent)' }}>
              ({t('classPicker.custom')})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {classesAreCustom && (
            <button
              onClick={resetClasses}
              className="text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
              title={t('classPicker.resetTitle')}
            >
              {t('classPicker.reset')}
            </button>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium"
            style={{ color: 'var(--accent)' }}
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
      </div>

      {error && (
        <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      <div className="space-y-1">
        {classes.map((cls, i) => {
          const active = cls.id === activeClassId
          const count = shapes.filter((s) => s.classId === cls.id).length
          return (
            <button
              key={cls.id}
              onClick={() => setActiveClass(cls.id)}
              className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition"
              style={{
                background: active ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
                color: 'var(--text)',
              }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cls.color }}
              />
              <span className="flex-1 text-left truncate">{cls.name}</span>
              {count > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {count}
                </span>
              )}
              {i < 9 && (
                <span
                  className="text-[10px] rounded px-1 flex-shrink-0"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
