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
    expect(screen.getByRole('dialog')).toHaveTextContent(/lade diese Datei/i)
  })

  it.each([
    ['phase1', /watch the video/i],
    ['phase2', /Phase 2 is done/i],
    ['phase3', /follow-up/i],
  ])('tells the participant what comes next after %s', (phaseId, expected) => {
    renderModal('en', phaseId)

    expect(screen.getByRole('dialog')).toHaveTextContent(expected)
  })

  it('tells the participant what comes next in German too', () => {
    renderModal('de', 'phase1')

    expect(screen.getByRole('dialog')).toHaveTextContent(/Video/)
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
