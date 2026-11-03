import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

// A study phase has one image to annotate and names it. The phase is read at
// import time, so the module graph is reset per test and the render is
// unmounted explicitly.
describe('ImageGallery in a study phase', () => {
  let unmountCurrent = () => {}

  async function renderPhaseGallery(phase, imageNames = []) {
    vi.resetModules()
    localStorage.setItem('seg-annotate:lang', 'en')
    vi.stubEnv('VITE_APP_VARIANT', phase)
    const { useEffect } = await import('react')
    const rtl = await import('@testing-library/react')
    const { AppProvider, useApp } = await import('../context/AppContext')
    const { default: Gallery } = await import('./ImageGallery')

    function Harness() {
      const { addImages } = useApp()
      useEffect(() => {
        if (imageNames.length === 0) return
        addImages(imageNames.map((name, i) => ({ id: `i${i}`, name, url: 'blob:x', width: 1, height: 1, size: 1 })))
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <Gallery />
    }

    unmountCurrent = rtl.render(
      <AppProvider>
        <Harness />
      </AppProvider>,
    ).unmount
    return rtl.screen
  }

  beforeEach(() => localStorage.clear())
  afterEach(() => {
    unmountCurrent()
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  it.each([
    ['phase1', 'phase1'],
    ['phase2', 'phase2'],
  ])('tells the participant which image to load in %s', async (phase, name) => {
    const screen = await renderPhaseGallery(phase)

    expect(screen.getByText(`Load the image “${name}” that you downloaded.`)).toBeInTheDocument()
  })

  it('names no image in phase 3, where the image is not decided yet', async () => {
    const screen = await renderPhaseGallery('phase3')

    expect(screen.queryByText(/Load the image/)).not.toBeInTheDocument()
  })

  it.each(['phase1.png', 'Phase1.JPG', 'set/sub/phase1.png'])('accepts %s as the phase 1 image', async (name) => {
    const screen = await renderPhaseGallery('phase1', [name])

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('warns when the loaded image is not the one for this phase', async () => {
    const screen = await renderPhaseGallery('phase1', ['phase2.png'])

    expect(screen.getByRole('status')).toHaveTextContent('This is not the image for this phase (“phase1”).')
  })

  it('warns when more images are loaded than the phase expects', async () => {
    const screen = await renderPhaseGallery('phase1', ['phase1.png', 'extra.png'])

    expect(screen.getByRole('status')).toHaveTextContent('Expected number of images for this phase: 1.')
  })

  it('does not check the name in phase 3, but still the number of images', async () => {
    const one = await renderPhaseGallery('phase3', ['anything.png'])
    expect(one.queryByRole('status')).not.toBeInTheDocument()
    unmountCurrent()

    const two = await renderPhaseGallery('phase3', ['a.png', 'b.png'])
    expect(two.getByRole('status')).toHaveTextContent('Expected number of images')
  })

  it('shows neither hint nor warning in the creator, which has no phases', async () => {
    const screen = await renderPhaseGallery('creator', ['whatever.png', 'other.png'])

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText(/Load the image/)).not.toBeInTheDocument()
  })
})
