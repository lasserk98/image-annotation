import { useApp } from '../context/AppContext'

export default function ClassPicker() {
  const { state, setActiveClass } = useApp()
  const { classes, activeClassId, currentImageId, shapesByImage } = state
  const shapes = (currentImageId && shapesByImage[currentImageId]) || []

  return (
    <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Class
      </h2>
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
