import { useEffect, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import ConsentScreen from './ConsentScreen'

// Logs a participant in before showing the screen, and prints what the tests
// need to observe from app state.
function LoggedIn({ children }) {
  const { login } = useApp()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    login('P-1', null)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ready ? children : null
}

function State() {
  const { state } = useApp()
  return (
    <p data-testid="state">
      {state.participantId ?? 'no-participant'}|{state.survey.consentAcceptedAt ? 'consented' : 'pending'}
    </p>
  )
}

function renderConsent() {
  render(
    <AppProvider>
      <LoggedIn>
        <ConsentScreen />
        <State />
      </LoggedIn>
    </AppProvider>,
  )
}

describe('ConsentScreen', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('shows the German consent text, marked as a placeholder for now', () => {
    renderConsent()

    expect(screen.getByRole('heading', { name: 'Einwilligungserklärung' })).toBeInTheDocument()
    expect(screen.getByText(/PLATZHALTER/)).toBeInTheDocument()
  })

  it('keeps Continue disabled until the agreement is ticked', () => {
    renderConsent()

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    fireEvent.click(screen.getByRole('checkbox', { name: /Ich habe die obigen Informationen gelesen/ }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('records consent when continuing', () => {
    renderConsent()
    expect(screen.getByTestId('state')).toHaveTextContent('P-1|pending')

    fireEvent.click(screen.getByRole('checkbox', { name: /Ich habe die obigen Informationen gelesen/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByTestId('state')).toHaveTextContent('P-1|consented')
  })

  it('does not record consent without the agreement', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByTestId('state')).toHaveTextContent('P-1|pending')
  })

  it('lets the participant log out to correct a wrong ID', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(screen.getByTestId('state')).toHaveTextContent('no-participant')
  })

  it('lets the participant switch the interface language, not the German consent text', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Einwilligungserklärung' })).toBeInTheDocument()
  })

  it('lets the participant cycle the theme', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: /^Theme:/ }))

    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
