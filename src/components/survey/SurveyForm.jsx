import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { firstIncompleteStep, missingItemIds, surveySteps } from '../../utils/survey'
import SurveyItem, { SURVEY_ERROR_ID } from './SurveyItem'

// Generic multi-section survey: one page per section (or per question, for
// sections marked `perItem`) with Back/Next, and the last page submits. It owns no answers — they come in as `answers` and go out
// through `onAnswer(itemId, value)` — so any survey definition can reuse it.
// Opens on the first page that still has gaps, which is how a reload
// resumes where the participant left off.
export default function SurveyForm({ definition, answers, onAnswer, onSubmit }) {
  const { t } = useApp()
  const steps = useMemo(() => surveySteps(definition), [definition])
  const [index, setIndex] = useState(() => firstIncompleteStep(steps, answers))
  const [attempted, setAttempted] = useState(false)
  const topRef = useRef(null)
  const isFirstRender = useRef(true)

  const step = steps[index]
  const { section } = step
  const missing = missingItemIds(step, answers)
  const isLast = index === steps.length - 1

  // Moving to another page should start at the top of the form, not wherever
  // the last page was scrolled. Not on first load, where the page is already at
  // its top.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    topRef.current?.scrollIntoView?.({ block: 'start' })
  }, [index])

  function goNext() {
    if (missing.length > 0) {
      setAttempted(true)
      // Focus the item's first control: that is what a keyboard or screen-reader
      // user needs to answer it.
      document.getElementById(`item-${missing[0]}`)?.querySelector('input')?.focus()
      return
    }
    setAttempted(false)
    if (isLast) onSubmit()
    else setIndex(index + 1)
  }

  function goBack() {
    setAttempted(false)
    setIndex(index - 1)
  }

  return (
    <div ref={topRef}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
        {definition.title}
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        {t('survey.progress', { n: step.sectionIndex + 1, total: definition.sections.length })}
        {step.question && ` · ${t('survey.question', step.question)}`}
      </p>
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {section.title}
      </h2>
      {section.intro && (
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          {section.intro}
        </p>
      )}

      <div>
        {step.items.map((item) => (
          <SurveyItem
            key={item.id}
            item={item}
            value={answers[item.id]}
            onChange={onAnswer}
            invalid={attempted && missing.includes(item.id)}
          />
        ))}
      </div>

      {attempted && missing.length > 0 && (
        <p id={SURVEY_ERROR_ID} className="text-sm mt-4" style={{ color: 'var(--danger)' }} role="alert">
          {t('survey.incomplete', { n: missing.length })}
        </p>
      )}

      <div className="flex gap-2 justify-between mt-6">
        {index > 0 ? (
          <button type="button" onClick={goBack} className="toolbar-btn">
            {t('survey.back')}
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={goNext} className="toolbar-btn-primary">
          {isLast ? t('survey.submit') : t('survey.next')}
        </button>
      </div>
    </div>
  )
}
