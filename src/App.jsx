import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import Workspace from './components/Workspace'
import { isCreatorVariant } from './variant'

function Shell() {
  const { state } = useApp()
  // The Creator variant has no participant, so there is nothing to log into.
  if (isCreatorVariant || state.participantId) return <Workspace />
  return <LoginScreen />
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
