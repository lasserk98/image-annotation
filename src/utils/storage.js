const SESSION_KEY = 'seg-annotate:session'
const CLASSES_KEY = 'seg-annotate:classes'
const LANG_KEY = 'seg-annotate:lang'

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore storage failures (e.g. private browsing quota)
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

// Custom class lists persist indefinitely (until reset), unlike the
// per-session data above — loading one is meant to stick across reloads.
export function loadClasses() {
  try {
    const raw = localStorage.getItem(CLASSES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveClasses(classes) {
  try {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes))
  } catch {
    // ignore
  }
}

export function clearClasses() {
  try {
    localStorage.removeItem(CLASSES_KEY)
  } catch {
    // ignore
  }
}

export function loadLang() {
  try {
    return localStorage.getItem(LANG_KEY)
  } catch {
    return null
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // ignore
  }
}
