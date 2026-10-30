import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppProvider } from '../context/AppContext'
import ImageGallery from './ImageGallery'

function renderGallery() {
  return render(
    <AppProvider>
      <ImageGallery />
    </AppProvider>,
  )
}

// The "+ Add" picker is the first file input; "+ Add folder" is the second.
const addInput = (container) => container.querySelector('input[type="file"]')

describe('ImageGallery zip support', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('lets the "+ Add" picker choose a zip as well as images', () => {
    const { container } = renderGallery()

    expect(addInput(container).accept).toContain('.zip')
    expect(addInput(container).accept).toContain('image/*')
  })

  it('labels the "+ Add" button so a zip is discoverable', () => {
    renderGallery()

    const button = screen.getByRole('button', { name: '+ Add / .zip' })
    expect(button).toHaveAttribute('title', 'Add image files, or a .zip with images')
  })

  it('says zips can be dropped', () => {
    renderGallery()

    expect(screen.getByText('Drop images, a folder or a .zip here')).toBeInTheDocument()
  })

  it('shows an error for a damaged zip', async () => {
    const { container } = renderGallery()
    const bad = new File(['not a zip'], 'bad.zip', { type: 'application/zip' })

    fireEvent.change(addInput(container), { target: { files: [bad] } })

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not read this .zip')
  })

  it('clears the error when the next batch loads', async () => {
    const { container } = renderGallery()
    fireEvent.change(addInput(container), {
      target: { files: [new File(['not a zip'], 'bad.zip')] },
    })
    await screen.findByRole('alert')

    fireEvent.change(addInput(container), { target: { files: [new File(['x'], 'notes.txt')] } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
