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

function renderModal(lang) {
  const onClose = vi.fn()
  render(
    <AppProvider>
      <InLanguage lang={lang}>
        <ExportDoneModal filename="P-1.json" onClose={onClose} />
      </InLanguage>
    </AppProvider>,
  )
  return { onClose }
}

describe('ExportDoneModal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('names the saved file and says to upload it', () => {
    renderModal('en')

    expect(screen.getByRole('dialog')).toHaveTextContent('P-1.json')
    expect(screen.getByRole('dialog')).toHaveTextContent(/upload/i)
  })

  it('is in German when the interface is German', () => {
    renderModal('de')

    expect(screen.getByRole('dialog')).toHaveTextContent('P-1.json')
    expect(screen.getByRole('dialog')).toHaveTextContent(/lade diese Datei/i)
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
