import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import ConsentScreen from './components/ConsentScreen'
import SurveyScreen from './components/SurveyScreen'
import Workspace from './components/Workspace'
import PostDoneScreen from './components/PostDoneScreen'
import { isCreatorVariant, isPostVariant } from './variant'

function Shell() {
  const { state } = useApp()
  // The Creator variant has no participant, so there is nothing to log into.
  if (isCreatorVariant) return <Workspace />
  // The study is a fixed sequence: log in, consent, survey, then annotate.
  if (!state.participantId) return <LoginScreen />
  // The post page is shorter: the participant consented at the start of the
  // study, so it goes from login straight to its survey.
  if (isPostVariant) return state.survey.completedAt ? <PostDoneScreen /> : <SurveyScreen />
  if (!state.survey.consentAcceptedAt) return <ConsentScreen />
  if (!state.survey.completedAt) return <SurveyScreen />
  return <Workspace />
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
