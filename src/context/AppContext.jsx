import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import classesConfig from '../config/classes.json'
import {
  loadSession,
  saveSession,
  clearSession,
  loadClasses,
  saveClasses,
  clearClasses,
  loadLang,
  saveLang,
} from '../utils/storage'
import { translate } from '../i18n/translations'

const AppContext = createContext(null)

const MAX_HISTORY = 50

function emptyHistory() {
  return { past: [], future: [] }
}

const initialSession = loadSession()
const storedClasses = loadClasses()
const initialClasses = storedClasses && storedClasses.length > 0 ? storedClasses : classesConfig
const storedLang = loadLang()
const browserLang = typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en'

const initialState = {
  studentId: initialSession?.studentId ?? null,
  treatment: initialSession?.treatment ?? null,
  lang: storedLang === 'de' || storedLang === 'en' ? storedLang : browserLang,
  classes: initialClasses,
  classesAreCustom: Boolean(storedClasses && storedClasses.length > 0),
  activeClassId: initialClasses[0]?.id ?? null,
  images: [], // { id, name, url, width, height }
  currentImageId: null,
  shapesByImage: {}, // imageId -> Shape[]
  historyByImage: {}, // imageId -> { past: Shape[][], future: Shape[][] }
  selection: { shapeId: null, vertexIndex: null },
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const session = { studentId: action.studentId, treatment: action.treatment ?? null }
      saveSession(session)
      return { ...state, ...session }
    }
    case 'LOGOUT': {
      clearSession()
      return { ...state, studentId: null, treatment: null }
    }
    case 'UPDATE_STUDENT_ID': {
      const studentId = action.studentId
      saveSession({ studentId, treatment: state.treatment })
      return { ...state, studentId }
    }
    case 'SET_LANG': {
      saveLang(action.lang)
      return { ...state, lang: action.lang }
    }
    case 'SET_CLASSES': {
      saveClasses(action.classes)
      const activeClassId = action.classes.some((c) => c.id === state.activeClassId)
        ? state.activeClassId
        : (action.classes[0]?.id ?? null)
      return { ...state, classes: action.classes, classesAreCustom: true, activeClassId }
    }
    case 'RESET_CLASSES': {
      clearClasses()
      const activeClassId = classesConfig[0]?.id ?? null
      return { ...state, classes: classesConfig, classesAreCustom: false, activeClassId }
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
      }
    }
    case 'SELECT_SHAPE':
      return {
        ...state,
        selection: { shapeId: action.shapeId, vertexIndex: action.vertexIndex ?? null },
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = useCallback(
    (studentId, treatment) => dispatch({ type: 'LOGIN', studentId, treatment }),
    [],
  )
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])
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
  const updateStudentId = useCallback(
    (studentId) => dispatch({ type: 'UPDATE_STUDENT_ID', studentId }),
    [],
  )
  const setLang = useCallback((lang) => dispatch({ type: 'SET_LANG', lang }), [])
  const setClasses = useCallback((classes) => dispatch({ type: 'SET_CLASSES', classes }), [])
  const resetClasses = useCallback(() => dispatch({ type: 'RESET_CLASSES' }), [])

  const lang = state.lang
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])

  const value = useMemo(
    () => ({
      state,
      t,
      login,
      logout,
      addImages,
      removeImage,
      selectImage,
      setActiveClass,
      setShapes,
      undo,
      redo,
      selectShape,
      updateStudentId,
      setLang,
      setClasses,
      resetClasses,
    }),
    [
      state,
      t,
      login,
      logout,
      addImages,
      removeImage,
      selectImage,
      setActiveClass,
      setShapes,
      undo,
      redo,
      selectShape,
      updateStudentId,
      setLang,
      setClasses,
      resetClasses,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
