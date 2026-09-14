import { useEffect, useRef, useState } from 'react'

const DEFAULT_BUTTON_CLASS = 'group flex items-center gap-1 text-[13px] font-semibold rounded px-1 -mx-1'
const DEFAULT_INPUT_CLASS = 'field field-sm text-right'

export default function EditableField({
  value,
  placeholder,
  title,
  onCommit,
  className = DEFAULT_BUTTON_CLASS,
  inputClassName = DEFAULT_INPUT_CLASS,
  style,
  inputStyle,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  // onCommit may throw (e.g. a duplicate-name check) to reject the edit —
  // in that case editing stays open with the error shown, instead of
  // silently discarding what was typed.
  function commit() {
    try {
      onCommit(draft.trim())
      setEditing(false)
      setError('')
    } catch (err) {
      setError(err.message || 'Invalid value.')
    }
  }

  if (editing) {
    return (
      <span className="inline-flex flex-col items-end gap-0.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(value ?? '')
              setError('')
              setEditing(false)
            }
          }}
          className={inputClassName}
          style={{ width: 128, background: 'var(--surface)', borderColor: 'var(--accent)', ...inputStyle }}
          aria-label={title}
        />
        {error && (
          <span className="text-[10px]" style={{ color: 'var(--danger)' }} role="alert">
            {error}
          </span>
        )}
      </span>
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(value ?? '')
        setError('')
        setEditing(true)
      }}
      className={className}
      style={{ color: value ? 'var(--text)' : 'var(--accent-ink)', ...style }}
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
