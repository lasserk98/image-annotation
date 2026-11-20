import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppProvider } from '../context/AppContext'
import TutorialModal from './TutorialModal'
import { CAT_OUTLINE, TUTORIAL_FRAMES } from '../tutorial/tutorialFrames'

function renderModal(props) {
  return render(
    <AppProvider>
      <TutorialModal {...props} />
    </AppProvider>,
  )
}

describe('TutorialModal', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('seg-annotate:lang', 'en')
  })
  afterEach(() => localStorage.clear())

  it('starts on the first frame with Back disabled', () => {
    renderModal({ onFinish: () => {} })

    expect(screen.getByText('This is what an annotation looks like')).toBeInTheDocument()
    expect(screen.getByText(`Step 1 of ${TUTORIAL_FRAMES.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('walks through every frame with Next and finishes on the last', () => {
    const onFinish = vi.fn()
    renderModal({ onFinish })

    for (let i = 0; i < TUTORIAL_FRAMES.length - 1; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }
    expect(onFinish).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Continue to the instructions' }))

    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('grows the outline while points are being placed', () => {
    renderModal({ onFinish: () => {} })
    expect(screen.queryAllByTestId('vertex').length).toBe(CAT_OUTLINE.length)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByTestId('outline-open')).toBeInTheDocument()
    expect(screen.queryAllByTestId('vertex').length).toBeLessThan(CAT_OUTLINE.length)
  })

  it('navigates with the arrow keys', () => {
    renderModal({ onFinish: () => {} })

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(screen.getByText('Pick the class')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('This is what an annotation looks like')).toBeInTheDocument()
  })

  it('cannot be dismissed on the first run', () => {
    const onFinish = vi.fn()
    renderModal({ onFinish })

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('can be closed with the button or Escape on a replay', () => {
    const onClose = vi.fn()
    renderModal({ onFinish: () => {}, onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
