import { useApp } from '../context/AppContext'
import ScreenControls from './ScreenControls'

// Shown instead of the login when the page was opened without a usable
// personal link. The participant's ID only ever comes from that link, so there
// is nothing to type and no way past this screen.
export default function InvalidLinkScreen() {
  const { t } = useApp()

  return (
    <div
      className="h-full overflow-y-auto scroll-thin flex items-center justify-center px-4 py-10 relative"
      style={{ background: 'var(--bg)' }}
    >
      <ScreenControls />
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {t('invalidLink.title')}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('invalidLink.body')}
        </p>
      </div>
    </div>
  )
}
