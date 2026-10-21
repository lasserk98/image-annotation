import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider } from '../context/AppContext'
import ExportFilenameModal from './ExportFilenameModal'

function renderModal(props = {}) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <AppProvider>
      <ExportFilenameModal
        defaultName="annotations.json"
        fallbackName="annotations"
        i18nPrefix="exportAnnotationsModal"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />
    </AppProvider>,
  )
  return { onConfirm, onCancel }
}

function typeName(value) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value } })
}

describe('ExportFilenameModal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('starts with the default file name', () => {
    renderModal()

    expect(screen.getByRole('textbox')).toHaveValue('annotations.json')
  })

  it('confirms with the typed name, forced to .json', () => {
    const { onConfirm } = renderModal()

    typeName('session-3.csv')
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onConfirm).toHaveBeenCalledWith('session-3.json')
  })

  it('falls back to the default base name when the field is blank', () => {
    const { onConfirm } = renderModal()

    typeName('')
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onConfirm).toHaveBeenCalledWith('annotations.json')
  })

  it('cancels on Escape without confirming', () => {
    const { onConfirm, onCancel } = renderModal()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('works for the class export defaults too', () => {
    renderModal({ defaultName: 'classes.json', fallbackName: 'classes', i18nPrefix: 'exportClassesModal' })

    expect(screen.getByRole('heading', { name: 'Export class list' })).toBeInTheDocument()
  })
})
