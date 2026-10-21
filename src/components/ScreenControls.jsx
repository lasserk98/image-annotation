import { useApp } from '../context/AppContext'
import { ThemeIcon } from './ThemeToggle'
import { THEME_CYCLE, THEME_LABEL_KEYS } from '../utils/theme'

// Theme and language switches pinned to the top right of a full-screen step
// (login, consent, survey), where the workspace header is not yet shown.
export default function ScreenControls() {
  const { t, state, setLang, setTheme } = useApp()
  const themeTitle = t('header.themeTitle', { mode: t(THEME_LABEL_KEYS[state.theme]) })

  return (
    <div className="absolute top-4 right-4 flex items-center gap-1.5">
      <button
        onClick={() => setTheme(THEME_CYCLE[state.theme])}
        className="flex items-center justify-center rounded-md transition"
        style={{
          width: 30,
          height: 30,
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          background: 'var(--surface)',
        }}
        title={themeTitle}
        aria-label={themeTitle}
      >
        <ThemeIcon theme={state.theme} />
      </button>
      <button
        onClick={() => setLang(state.lang === 'en' ? 'de' : 'en')}
        className="text-xs font-semibold px-2.5 py-1.5 rounded-md transition"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
        title={t('header.langTitle')}
      >
        {state.lang === 'en' ? 'DE' : 'EN'}
      </button>
    </div>
  )
}
