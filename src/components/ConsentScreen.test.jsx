import { useEffect, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import { CONSENT_TEXT } from '../survey/consentText'
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
    <>
      <p data-testid="state">
        {state.participantId ?? 'no-participant'}|{state.survey.consentAcceptedAt ? 'consented' : 'pending'}
      </p>
      <p data-testid="consent-version">{state.survey.consentVersion ?? 'none'}</p>
    </>
  )
}

const participationBox = () => screen.getByRole('checkbox', { name: /freiwillig an der Studie teilzunehmen/ })
const dataProtectionBox = () => screen.getByRole('checkbox', { name: /Verarbeitung meiner personenbezogenen Daten/ })

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

  it('shows the study title, the information and the full Datenschutz notices', () => {
    renderConsent()

    expect(
      screen.getByRole('heading', { name: 'Studie zur KI-gestützten Annotation von Lehrvideos in der Cochleaimplantation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Information zur Studie' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Freiwilligkeit und Rechte' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vertraulichkeit der Lehrmaterialien' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datenschutzhinweise' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Einverständniserklärung' })).toBeInTheDocument()
    expect(screen.getByText(/Die Teilnahme ist freiwillig\./)).toBeInTheDocument()
  })

  it('shows every data protection subsection, with the contacts', () => {
    renderConsent()

    for (const name of [
      'Verantwortliche Stelle',
      'Zweck und Rechtsgrundlage',
      'Codierung und Anonymisierung',
      'Zugriff und Weitergabe',
      'Speicherdauer',
      'Ihre Datenschutzrechte',
      'Kontakt für Datenschutzfragen',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(/datenschutz@med\.uni-rostock\.de/)).toBeInTheDocument()
    expect(screen.getByText(/solenne\.sandkoetter@uni-rostock\.de/)).toBeInTheDocument()
  })

  it('is no longer a placeholder and has no signature lines', () => {
    renderConsent()

    expect(screen.queryByText(/PLATZHALTER/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Unterschrift/)).not.toBeInTheDocument()
  })

  it('asks for the data processing consent as the second agreement', () => {
    renderConsent()

    expect(dataProtectionBox()).toHaveAccessibleName(/wie in den Datenschutzhinweisen beschrieben/)
  })

  it('stores which version of the consent text was accepted', () => {
    renderConsent()
    expect(screen.getByTestId('consent-version')).toHaveTextContent('none')

    fireEvent.click(participationBox())
    fireEvent.click(dataProtectionBox())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByTestId('consent-version')).toHaveTextContent(CONSENT_TEXT.version)
  })

  it('keeps Continue disabled until both agreements are ticked', () => {
    renderConsent()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    fireEvent.click(participationBox())
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    fireEvent.click(dataProtectionBox())
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps Continue disabled when only the data protection agreement is ticked', () => {
    renderConsent()

    fireEvent.click(dataProtectionBox())

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('disables Continue again when an agreement is unticked', () => {
    renderConsent()
    fireEvent.click(participationBox())
    fireEvent.click(dataProtectionBox())

    fireEvent.click(participationBox())

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('records consent when continuing with both agreements', () => {
    renderConsent()
    expect(screen.getByTestId('state')).toHaveTextContent('P-1|pending')

    fireEvent.click(participationBox())
    fireEvent.click(dataProtectionBox())
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByTestId('state')).toHaveTextContent('P-1|consented')
  })

  it('does not record consent with only one agreement', () => {
    renderConsent()

    fireEvent.click(participationBox())
    fireEvent.submit(screen.getByRole('button', { name: 'Continue' }).closest('form'))

    expect(screen.getByTestId('state')).toHaveTextContent('P-1|pending')
  })

  it('does not record consent without any agreement', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByTestId('state')).toHaveTextContent('P-1|pending')
  })

  it('has no log-out button, since the participant ID comes from the link and cannot be mistyped', () => {
    renderConsent()

    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('lets the participant switch the interface language, not the German consent text', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Einverständniserklärung' })).toBeInTheDocument()
  })

  it('lets the participant cycle the theme', () => {
    renderConsent()

    fireEvent.click(screen.getByRole('button', { name: /^Theme:/ }))

    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
