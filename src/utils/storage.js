import { ACTIVE_PHASE } from '../variant'

// The study phases are served from one origin, so each keeps its session under
// its own key and can never read another's. The creator has no session; the
// fallback key is never used for one.
const SESSION_KEY = ACTIVE_PHASE?.sessionKey ?? 'seg-annotate:session'
const CLASSES_KEY = 'seg-annotate:classes'
const LANG_KEY = 'seg-annotate:lang'
const THEME_KEY = 'seg-annotate:theme'
const TUTORIAL_SEEN_KEY = 'seg-annotate:tutorial-seen'

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

// 'light' | 'dark' means an explicit override; no stored value (null) means
// "follow the OS/browser preference", which is the default.
export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

export function saveTheme(theme) {
  try {
    if (theme === 'system') {
      localStorage.removeItem(THEME_KEY)
    } else {
      localStorage.setItem(THEME_KEY, theme)
    }
  } catch {
    // ignore
  }
}

// Whether the participant has already clicked through the picture tutorial.
// Without storage it reads as "not seen", so the tutorial simply shows again.
export function loadTutorialSeen() {
  try {
    return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function saveTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1')
  } catch {
    // ignore
  }
}
