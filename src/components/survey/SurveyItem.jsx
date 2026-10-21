import { useApp } from '../../context/AppContext'
import { SCALES } from '../../survey/preSurvey'

// One question, rendered by its type. Answers go up as raw values through
// `onChange(itemId, value)`; the survey wording is always the definition's
// (German), never translated.
// Tied to the form's error message, so a screen reader reads "please answer
// all required questions" with the unanswered item it just moved focus to.
export const SURVEY_ERROR_ID = 'survey-error'

export default function SurveyItem({ item, value, onChange, invalid }) {
  const { t } = useApp()
  const describedBy = invalid ? SURVEY_ERROR_ID : undefined
  const wrapperProps = {
    id: `item-${item.id}`,
    'data-invalid': invalid || undefined,
    className: 'survey-item py-3 px-3 -mx-3 outline-none',
    style: {
      borderBottom: '1px solid var(--border)',
      ...(invalid ? { background: 'var(--danger-soft)' } : {}),
    },
  }

  if (item.type === 'number') {
    return (
      <div {...wrapperProps}>
        <label htmlFor={`field-${item.id}`} className="block text-sm font-medium mb-1.5">
          {item.label}
        </label>
        <input
          id={`field-${item.id}`}
          type="number"
          inputMode="numeric"
          min={item.min}
          max={item.max}
          value={value ?? ''}
          onChange={(e) => onChange(item.id, e.target.value === '' ? null : Number(e.target.value))}
          className="field"
          style={{ maxWidth: 140 }}
          aria-invalid={Boolean(invalid)}
          aria-describedby={describedBy}
        />
      </div>
    )
  }

  if (item.type === 'text') {
    return (
      <div {...wrapperProps}>
        <label htmlFor={`field-${item.id}`} className="block text-sm font-medium mb-1.5">
          {item.text}
          {item.optional && (
            <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              ({t('survey.optional')})
            </span>
          )}
        </label>
        <input
          id={`field-${item.id}`}
          type="text"
          maxLength={500}
          value={value ?? ''}
          onChange={(e) => onChange(item.id, e.target.value)}
          className="field"
          autoComplete="off"
        />
      </div>
    )
  }

  if (item.type === 'choice') {
    return (
      <div {...wrapperProps}>
        <fieldset aria-describedby={describedBy}>
          <legend className="text-sm font-medium mb-2">{item.text ?? item.label}</legend>
          <div className="space-y-1.5">
            {item.options.map((option) => (
              <label key={option.value} className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={item.id}
                  checked={value === option.value}
                  onChange={() => onChange(item.id, option.value)}
                  className="mt-0.5"
                />
                <span>{item.lettered ? `${option.value}) ${option.label}` : option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }

  // Likert: one radio per scale point, captioned where the scale has a label.
  const scale = SCALES[item.scale]
  const points = Array.from({ length: scale.max - scale.min + 1 }, (_, n) => scale.min + n)
  return (
    <div {...wrapperProps}>
      <fieldset aria-describedby={describedBy}>
        <legend className="text-sm mb-2">
          {item.topic && (
            <span className="block text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {item.topic}
            </span>
          )}
          <span className="font-medium">{item.text}</span>
        </legend>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
          {points.map((point) => (
            <label key={point} className="flex flex-col items-center gap-0.5 text-center cursor-pointer">
              <input
                type="radio"
                name={item.id}
                checked={value === point}
                onChange={() => onChange(item.id, point)}
              />
              <span className="text-sm">{point}</span>
              {scale.labels[point] && (
                <span className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {scale.labels[point]}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
