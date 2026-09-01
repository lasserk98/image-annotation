import { AppProvider, useApp } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import Workspace from './components/Workspace'

function Shell() {
  const { state } = useApp()
  return state.studentId ? <Workspace /> : <LoginScreen />
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
