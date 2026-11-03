import { useEffect } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import ExportDoneModal from './ExportDoneModal'

// The saved language is read once at import time, so the language is switched
// through the app instead of through localStorage.
function InLanguage({ lang, children }) {
  const { setLang } = useApp()
  useEffect(() => setLang(lang), [lang, setLang])
  return children
}

function renderModal(lang, phaseId = 'phase1') {
  const onClose = vi.fn()
  render(
    <AppProvider>
      <InLanguage lang={lang}>
        <ExportDoneModal fileEnding={`_${phaseId}.json`} phaseId={phaseId} onClose={onClose} />
      </InLanguage>
    </AppProvider>,
  )
  return { onClose }
}

describe('ExportDoneModal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('says how the saved file name ends, without an ID, and to upload it', () => {
    renderModal('en')

    expect(screen.getByRole('dialog')).toHaveTextContent('_phase1.json')
    expect(screen.getByRole('dialog')).toHaveTextContent(/upload/i)
    expect(screen.getByRole('dialog')).not.toHaveTextContent('P-')
  })

  it('is in German when the interface is German', () => {
    renderModal('de')

    expect(screen.getByRole('dialog')).toHaveTextContent('_phase1.json')
    expect(screen.getByRole('dialog')).toHaveTextContent(/laden Sie diese Datei/i)
  })

  it('leads with the upload as the next step', () => {
    renderModal('en')

    expect(screen.getByRole('heading', { name: 'Next step: upload your file' })).toBeInTheDocument()
  })

  it.each([
    ['phase1', /upload.*watch the video.*Phase 2/is],
    ['phase2', /upload.*done.*follow-up/is],
    ['phase3', /upload.*done.*thank you/is],
  ])('names the upload and then what comes next after %s', (phaseId, expected) => {
    renderModal('en', phaseId)

    expect(screen.getByTestId('next-step')).toHaveTextContent(expected)
  })

  it.each(['phase1', 'phase2', 'phase3'])('addresses the participant formally in German after %s', (phaseId) => {
    renderModal('de', phaseId)

    const text = screen.getByRole('dialog').textContent
    expect(screen.getByTestId('next-step')).toHaveTextContent(/hoch/)
    expect(text).toMatch(/Sie|Ihre/)
    expect(text).not.toMatch(/\b(du|dein\w*|dir)\b/i)
  })

  it('does not close when the dimmed background is clicked', () => {
    const { onClose } = renderModal('en')

    fireEvent.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes with the button', () => {
    const { onClose } = renderModal('en')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes with Escape', () => {
    const { onClose } = renderModal('en')

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
