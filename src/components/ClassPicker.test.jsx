import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProvider } from '../context/AppContext'
import ClassPicker from './ClassPicker'

// AppProvider always boots with creatorMode: false, matching a fresh page
// load in the deployed default Annotation Mode.
function renderInAnnotationMode() {
  render(
    <AppProvider>
      <ClassPicker />
    </AppProvider>,
  )
}

describe('ClassPicker in Annotation Mode (creatorMode: false)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows a button to load a class config file', () => {
    renderInAnnotationMode()

    expect(screen.getByRole('button', { name: '+ Load config' })).toBeInTheDocument()
  })

  it('keeps class-editing controls hidden outside Creator Mode', () => {
    renderInAnnotationMode()

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add class' })).not.toBeInTheDocument()
  })
})
