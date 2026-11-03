import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import classesConfig from '../config/classes.json'
import studyClassesConfig from '../config/studyClasses.json'
import {
  loadSession,
  saveSession,
  clearSession,
  loadClasses,
  saveClasses,
  clearClasses,
  loadLang,
  saveLang,
  loadTheme,
  saveTheme,
} from '../utils/storage'
import { parseClasses, sortClassesByName } from '../utils/classes'
import { emptySurvey, isSurveyComplete, sanitizeSurvey } from '../utils/survey'
import { ACTIVE_SURVEY } from '../survey/activeSurvey'
import { translate } from '../i18n/translations'
import { isCreatorVariant } from '../variant'
import { LINK_PARAMS } from '../utils/linkParams'

const AppContext = createContext(null)

const MAX_HISTORY = 50
const SURVEY_VERSION = ACTIVE_SURVEY.version

// The saved session is the participant ID, treatment and survey progress, so a
// reload resumes where the participant left off. The creator has no session.
function persistSession({ participantId, treatment, survey }) {
  if (isCreatorVariant) return
  saveSession({ participantId, treatment, survey })
}

function forgetSession() {
  if (isCreatorVariant) return
  clearSession()
}

function emptyHistory() {
  return { past: [], future: [] }
}

// Applying the attribute directly (rather than only storing `theme` in
// state) is what lets the CSS overrides in index.css win over
// prefers-color-scheme in both directions — see the :root[data-theme=...]
// rules there.
function applyTheme(theme) {
  if (typeof document === 'undefined') return
  if (theme === 'system') {
    delete document.documentElement.dataset.theme
  } else {
    document.documentElement.dataset.theme = theme
  }
}

// A saved session only counts for the personal link it was started from: the
// participant's ID comes from that link, so a session saved under another ID
// (a shared computer, or a link opened for someone else) must never be resumed
// and have its answers exported under the wrong ID. The same goes for the
// treatment: a link that names one wins over what the session saved, so a
// participant cannot end up exported under the wrong group.
function sessionForLink(session, linkId, linkTreatment) {
  // `studentId` is the pre-rename key of the participant ID.
  const savedId = session?.participantId ?? session?.studentId ?? null
  if (!linkId || savedId !== linkId) return null
  if (linkTreatment && (session.treatment ?? null) !== linkTreatment) return null
  return session
}

// The Creator variant has no participant, so a session saved by an earlier
// visit (or a study phase on the same origin) is ignored rather than shown.
const initialSession = isCreatorVariant
  ? null
  : sessionForLink(loadSession(), LINK_PARAMS.id, LINK_PARAMS.treatment)
// The creator starts from the (empty) bundled list and keeps whatever list they
// loaded; the study is locked to its fixed list, so a list saved in this
// browser is ignored rather than trusted.
const defaultClasses = isCreatorVariant ? classesConfig : parseClasses(studyClassesConfig)
const storedClasses = isCreatorVariant ? loadClasses() : null
// Every class list is sorted on the way in — whether it came from the bundled
// config or a JSON file a creator loaded — so the menu, the instance
// groups and the 1-9 shortcuts all share one alphabetical order.
const initialClasses = sortClassesByName(
  storedClasses && storedClasses.length > 0 ? storedClasses : defaultClasses,
)
const storedLang = loadLang()
const browserLang = typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en'
// The study is run in German; the creator follows the browser. A language the
// user picked themselves always wins over both.
const defaultLang = isCreatorVariant ? browserLang : 'de'
const storedTheme = loadTheme()
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system'
applyTheme(initialTheme)

const initialState = {
  // `studentId` is the pre-rename key: read it as a fallback so a session
  // stored by an older build doesn't silently log the participant out.
  participantId: initialSession?.participantId ?? initialSession?.studentId ?? null,
  treatment: initialSession?.treatment ?? null,
  // Consent and survey answers. A session saved before surveys existed, or
  // for another survey version, simply starts the survey from the beginning.
  survey: sanitizeSurvey(initialSession?.survey, ACTIVE_SURVEY),
  lang: storedLang === 'de' || storedLang === 'en' ? storedLang : defaultLang,
  theme: initialTheme,
  // Never persisted. The Creator variant is always unlocked; a study phase
  // has no way to edit classes at all.
  creatorMode: isCreatorVariant,
  classes: initialClasses,
  activeClassId: initialClasses[0]?.id ?? null,
  images: [], // { id, name, url, width, height }
  currentImageId: null,
  shapesByImage: {}, // imageId -> Shape[]
  historyByImage: {}, // imageId -> { past: Shape[][], future: Shape[][] }
  selection: { shapeId: null, vertexIndex: null },
  // Pointer-driven, not persisted: lets the instance list and the canvas
  // highlight the same shape from either side.
  hoveredShapeId: null,
  // In-memory only (never persisted): true for the render right after a
  // LOGIN action, so the workspace can auto-open the instructions modal
  // once without reshowing it on every reload of a saved session.
  justLoggedIn: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const session = {
        participantId: action.participantId,
        treatment: action.treatment ?? null,
        survey: emptySurvey(SURVEY_VERSION),
      }
      persistSession(session)
      return { ...state, ...session, justLoggedIn: true }
    }
    case 'CLEAR_JUST_LOGGED_IN':
      return { ...state, justLoggedIn: false }
    case 'LOGOUT': {
      forgetSession()
      // Everything the participant loaded or drew goes with them, so whoever
      // uses this browser next starts clean. Language, theme and the class
      // list are not theirs and stay.
      for (const img of state.images) URL.revokeObjectURL(img.url)
      return {
        ...state,
        participantId: null,
        treatment: null,
        survey: emptySurvey(SURVEY_VERSION),
        images: [],
        currentImageId: null,
        shapesByImage: {},
        historyByImage: {},
        selection: { shapeId: null, vertexIndex: null },
        hoveredShapeId: null,
        justLoggedIn: false,
      }
    }
    case 'ACCEPT_CONSENT': {
      // Keep the first time consent was given.
      if (state.survey.consentAcceptedAt) return state
      const survey = { ...state.survey, consentAcceptedAt: action.at }
      persistSession({ ...state, survey })
      return { ...state, survey }
    }
    case 'SET_SURVEY_ANSWER': {
      // Submitted answers are final.
      if (state.survey.completedAt) return state
      const answers = { ...state.survey.answers, [action.itemId]: action.value }
      const survey = { ...state.survey, answers }
      persistSession({ ...state, survey })
      return { ...state, survey }
    }
    case 'COMPLETE_SURVEY': {
      if (state.survey.completedAt || !isSurveyComplete(ACTIVE_SURVEY, state.survey.answers)) return state
      const survey = { ...state.survey, completedAt: action.at }
      persistSession({ ...state, survey })
      return { ...state, survey }
    }
    case 'SET_LANG': {
      saveLang(action.lang)
      return { ...state, lang: action.lang }
    }
    case 'SET_THEME': {
      saveTheme(action.theme)
      applyTheme(action.theme)
      return { ...state, theme: action.theme }
    }
    case 'SET_CLASSES': {
      const classes = sortClassesByName(action.classes)
      saveClasses(classes)
      const activeClassId = classes.some((c) => c.id === state.activeClassId)
        ? state.activeClassId
        : (classes[0]?.id ?? null)
      return { ...state, classes, activeClassId }
    }
    case 'ADD_CLASS': {
      const classes = sortClassesByName([...state.classes, action.cls])
      saveClasses(classes)
      return { ...state, classes, activeClassId: action.cls.id }
    }
    case 'RESET_CLASSES': {
      clearClasses()
      const classes = sortClassesByName(defaultClasses)
      const activeClassId = classes[0]?.id ?? null
      return { ...state, classes, activeClassId }
    }
    case 'RENAME_CLASS': {
      // Renaming never touches `id`, so every shape already tagged with this
      // class stays correctly labeled — only the sort order can change.
      const classes = sortClassesByName(
        state.classes.map((c) => (c.id === action.classId ? { ...c, name: action.name } : c)),
      )
      saveClasses(classes)
      return { ...state, classes }
    }
    case 'DELETE_CLASS': {
      const classes = state.classes.filter((c) => c.id !== action.classId)
      saveClasses(classes)
      const activeClassId =
        state.activeClassId === action.classId ? (classes[0]?.id ?? null) : state.activeClassId
      return { ...state, classes, activeClassId }
    }
    case 'ADD_IMAGES': {
      const images = [...state.images, ...action.images]
      const shapesByImage = { ...state.shapesByImage }
      const historyByImage = { ...state.historyByImage }
      for (const img of action.images) {
        shapesByImage[img.id] = []
        historyByImage[img.id] = emptyHistory()
      }
      return {
        ...state,
        images,
        shapesByImage,
        historyByImage,
        currentImageId: state.currentImageId ?? action.images[0]?.id ?? null,
      }
    }
    case 'REMOVE_IMAGE': {
      const removed = state.images.find((i) => i.id === action.imageId)
      if (removed) URL.revokeObjectURL(removed.url)
      const images = state.images.filter((i) => i.id !== action.imageId)
      const shapesByImage = { ...state.shapesByImage }
      const historyByImage = { ...state.historyByImage }
      delete shapesByImage[action.imageId]
      delete historyByImage[action.imageId]
      let currentImageId = state.currentImageId
      if (currentImageId === action.imageId) {
        currentImageId = images[0]?.id ?? null
      }
      return { ...state, images, shapesByImage, historyByImage, currentImageId }
    }
    case 'SELECT_IMAGE':
      return {
        ...state,
        currentImageId: action.imageId,
        selection: { shapeId: null, vertexIndex: null },
        hoveredShapeId: null,
      }
    case 'SET_ACTIVE_CLASS':
      return { ...state, activeClassId: action.classId }
    case 'SET_SHAPES': {
      const { imageId, shapes, pushHistory = true } = action
      const prevShapes = state.shapesByImage[imageId] || []
      const prevHistory = state.historyByImage[imageId] || emptyHistory()
      const historyByImage = pushHistory
        ? {
            ...state.historyByImage,
            [imageId]: {
              past: [...prevHistory.past, prevShapes].slice(-MAX_HISTORY),
              future: [],
            },
          }
        : state.historyByImage
      return {
        ...state,
        shapesByImage: { ...state.shapesByImage, [imageId]: shapes },
        historyByImage,
      }
    }
    case 'UNDO': {
      const { imageId } = action
      const history = state.historyByImage[imageId]
      if (!history || history.past.length === 0) return state
      const previous = history.past[history.past.length - 1]
      const current = state.shapesByImage[imageId] || []
      return {
        ...state,
        shapesByImage: { ...state.shapesByImage, [imageId]: previous },
        historyByImage: {
          ...state.historyByImage,
          [imageId]: {
            past: history.past.slice(0, -1),
            future: [current, ...history.future].slice(0, MAX_HISTORY),
          },
        },
        selection: { shapeId: null, vertexIndex: null },
        hoveredShapeId: null,
      }
    }
    case 'REDO': {
      const { imageId } = action
      const history = state.historyByImage[imageId]
      if (!history || history.future.length === 0) return state
      const next = history.future[0]
      const current = state.shapesByImage[imageId] || []
      return {
        ...state,
        shapesByImage: { ...state.shapesByImage, [imageId]: next },
        historyByImage: {
          ...state.historyByImage,
          [imageId]: {
            past: [...history.past, current].slice(-MAX_HISTORY),
            future: history.future.slice(1),
          },
        },
        selection: { shapeId: null, vertexIndex: null },
        hoveredShapeId: null,
      }
    }
    case 'SELECT_SHAPE':
      return {
        ...state,
        selection: { shapeId: action.shapeId, vertexIndex: action.vertexIndex ?? null },
      }
    case 'HOVER_SHAPE':
      if (state.hoveredShapeId === action.shapeId) return state
      return { ...state, hoveredShapeId: action.shapeId }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = useCallback(
    (participantId, treatment) => dispatch({ type: 'LOGIN', participantId, treatment }),
    [],
  )
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])
  const acceptConsent = useCallback(
    () => dispatch({ type: 'ACCEPT_CONSENT', at: new Date().toISOString() }),
    [],
  )
  const setSurveyAnswer = useCallback(
    (itemId, value) => dispatch({ type: 'SET_SURVEY_ANSWER', itemId, value }),
    [],
  )
  const completeSurvey = useCallback(
    () => dispatch({ type: 'COMPLETE_SURVEY', at: new Date().toISOString() }),
    [],
  )
  const clearJustLoggedIn = useCallback(() => dispatch({ type: 'CLEAR_JUST_LOGGED_IN' }), [])
  const addImages = useCallback((images) => dispatch({ type: 'ADD_IMAGES', images }), [])
  const removeImage = useCallback((imageId) => dispatch({ type: 'REMOVE_IMAGE', imageId }), [])
  const selectImage = useCallback((imageId) => dispatch({ type: 'SELECT_IMAGE', imageId }), [])
  const setActiveClass = useCallback(
    (classId) => dispatch({ type: 'SET_ACTIVE_CLASS', classId }),
    [],
  )
  const setShapes = useCallback(
    (imageId, shapes, pushHistory = true) =>
      dispatch({ type: 'SET_SHAPES', imageId, shapes, pushHistory }),
    [],
  )
  const undo = useCallback((imageId) => dispatch({ type: 'UNDO', imageId }), [])
  const redo = useCallback((imageId) => dispatch({ type: 'REDO', imageId }), [])
  const selectShape = useCallback(
    (shapeId, vertexIndex = null) => dispatch({ type: 'SELECT_SHAPE', shapeId, vertexIndex }),
    [],
  )
  const hoverShape = useCallback((shapeId) => dispatch({ type: 'HOVER_SHAPE', shapeId }), [])
  const setLang = useCallback((lang) => dispatch({ type: 'SET_LANG', lang }), [])
  const setTheme = useCallback((theme) => dispatch({ type: 'SET_THEME', theme }), [])
  const setClasses = useCallback((classes) => dispatch({ type: 'SET_CLASSES', classes }), [])
  const resetClasses = useCallback(() => dispatch({ type: 'RESET_CLASSES' }), [])
  const addClass = useCallback((cls) => dispatch({ type: 'ADD_CLASS', cls }), [])
  const renameClass = useCallback(
    (classId, name) => dispatch({ type: 'RENAME_CLASS', classId, name }),
    [],
  )
  const deleteClass = useCallback((classId) => dispatch({ type: 'DELETE_CLASS', classId }), [])

  const lang = state.lang
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])

  const value = useMemo(
    () => ({
      state,
      t,
      login,
      logout,
      acceptConsent,
      setSurveyAnswer,
      completeSurvey,
      clearJustLoggedIn,
      addImages,
      removeImage,
      selectImage,
      setActiveClass,
      setShapes,
      undo,
      redo,
      selectShape,
      hoverShape,
      setLang,
      setTheme,
      setClasses,
      resetClasses,
      addClass,
      renameClass,
      deleteClass,
    }),
    [
      state,
      t,
      login,
      logout,
      acceptConsent,
      setSurveyAnswer,
      completeSurvey,
      clearJustLoggedIn,
      addImages,
      removeImage,
      selectImage,
      setActiveClass,
      setShapes,
      undo,
      redo,
      selectShape,
      hoverShape,
      setLang,
      setTheme,
      setClasses,
      resetClasses,
      addClass,
      renameClass,
      deleteClass,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
