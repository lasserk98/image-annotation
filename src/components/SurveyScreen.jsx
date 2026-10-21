import { useApp } from '../context/AppContext'
import { ACTIVE_SURVEY } from '../survey/activeSurvey'
import { isPostVariant } from '../variant'
import ScreenControls from './ScreenControls'
import SurveyForm from './survey/SurveyForm'

// The pre-study survey as a full-screen step, wired to the app's saved survey
// state. Shown after consent; submitting it opens the annotation workspace.
export default function SurveyScreen() {
  const { state, setSurveyAnswer, completeSurvey, logout, t } = useApp()

  return (
    // `m-auto` on the card centres it without ever pushing its top edge out of
    // reach, which matters for a page this long.
    <div className="h-full overflow-y-auto scroll-thin flex px-4 py-10 relative" style={{ background: 'var(--bg)' }}>
      <ScreenControls />
      <div
        className="w-full max-w-2xl rounded-2xl p-8 m-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <SurveyForm
          definition={ACTIVE_SURVEY}
          answers={state.survey.answers}
          onAnswer={setSurveyAnswer}
          onSubmit={completeSurvey}
          submitKey={isPostVariant ? 'survey.submitPost' : 'survey.submit'}
        />
        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={logout} className="link-btn link-btn-muted">
            {t('header.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
