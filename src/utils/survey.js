import { SCALES } from '../survey/preSurvey'

// A fresh survey: nothing accepted, nothing answered, not submitted. Answers
// are kept raw, keyed by item id.
export function emptySurvey(version) {
  return { version, consentAcceptedAt: null, answers: {}, completedAt: null }
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

// Reads a survey back out of storage. Nothing from storage is trusted: a
// survey saved against a different version, or in a malformed shape, starts
// again; answers are kept only for items the survey really has and only if the
// value is valid for that item; and a completion time only survives if the
// answers behind it are actually complete.
export function sanitizeSurvey(raw, definition) {
  const version = definition.version
  if (!isPlainObject(raw) || raw.version !== version) return emptySurvey(version)

  const itemsById = new Map(definition.sections.flatMap((s) => s.items).map((item) => [item.id, item]))
  const savedAnswers = isPlainObject(raw.answers) ? raw.answers : {}
  const answers = {}
  for (const [id, value] of Object.entries(savedAnswers)) {
    const item = itemsById.get(id)
    if (item && isAnswered(item, value)) answers[id] = value
  }

  const completed = typeof raw.completedAt === 'string' && isSurveyComplete(definition, answers)
  return {
    version,
    consentAcceptedAt: typeof raw.consentAcceptedAt === 'string' ? raw.consentAcceptedAt : null,
    answers,
    completedAt: completed ? raw.completedAt : null,
  }
}

// Whether `value` is a valid answer for `item`. Only whole numbers count for
// number and Likert items, and a choice must be one of the listed options.
export function isAnswered(item, value) {
  switch (item.type) {
    case 'number':
      return Number.isInteger(value) && value >= item.min && value <= item.max
    case 'choice':
      return item.options.some((option) => option.value === value)
    case 'likert': {
      const scale = SCALES[item.scale]
      return Number.isInteger(value) && value >= scale.min && value <= scale.max
    }
    case 'text':
      return typeof value === 'string' && value.trim() !== ''
    default:
      return false
  }
}

// Required items with no valid answer yet, in the order they appear.
export function missingItemIds(section, answers) {
  return section.items
    .filter((item) => !item.optional && !isAnswered(item, answers[item.id]))
    .map((item) => item.id)
}

export function isSectionComplete(section, answers) {
  return missingItemIds(section, answers).length === 0
}

export function isSurveyComplete(definition, answers) {
  return definition.sections.every((section) => isSectionComplete(section, answers))
}

// The pages a participant steps through, in order. A normal section is one
// page with all its items; a section marked `perItem` is one page per item.
// Each step has `items` like a section does, so it can be checked the same way.
// `question` is `{ n, total }` for a one-question page and null otherwise.
export function surveySteps(definition) {
  return definition.sections.flatMap((section, sectionIndex) => {
    if (!section.perItem) return [{ section, sectionIndex, items: section.items, question: null }]
    return section.items.map((item, i) => ({
      section,
      sectionIndex,
      items: [item],
      question: { n: i + 1, total: section.items.length },
    }))
  })
}

// Where to resume: the first step that still has gaps, or the last one when
// everything is answered.
export function firstIncompleteStep(steps, answers) {
  const index = steps.findIndex((step) => !isSectionComplete(step, answers))
  return index === -1 ? steps.length - 1 : index
}
