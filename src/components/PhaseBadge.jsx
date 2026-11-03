import { useApp } from '../context/AppContext'
import { PHASE_COUNT } from '../phases'
import { ACTIVE_PHASE } from '../variant'

// Says which phase of the study this page is, so the links in a participant's
// email cannot be mixed up. Shows nothing in the creator, which has no phases.
export default function PhaseBadge() {
  const { t } = useApp()
  if (!ACTIVE_PHASE) return null

  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
    >
      {t('phase.badge', { n: ACTIVE_PHASE.number, total: PHASE_COUNT })}
    </span>
  )
}
