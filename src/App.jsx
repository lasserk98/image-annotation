import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import ConsentScreen from './components/ConsentScreen'
import InvalidLinkScreen from './components/InvalidLinkScreen'
import SurveyScreen from './components/SurveyScreen'
import Workspace from './components/Workspace'
import { LINK_PARAMS } from './utils/linkParams'
import { ACTIVE_PHASE, isCreatorVariant } from './variant'

function Shell() {
  const { state } = useApp()
  // The Creator variant has no participant, so there is nothing to log into.
  if (isCreatorVariant) return <Workspace />
  // The participant's ID comes from the personal link in their email and is
  // never typed, so a page opened without one cannot be used at all.
  if (!LINK_PARAMS.id) return <InvalidLinkScreen />
  // Every phase is the same sequence: password, consent (first phase only),
  // survey, then annotate one image.
  if (!state.participantId) return <LoginScreen />
  if (ACTIVE_PHASE.hasConsent && !state.survey.consentAcceptedAt) return <ConsentScreen />
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
