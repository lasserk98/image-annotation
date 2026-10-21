import { useEffect } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useApp } from '../context/AppContext'
import Header from './Header'
import { downloadJSON } from '../utils/export'

vi.mock('../utils/export', async (importOriginal) => ({
  ...(await importOriginal()),
  downloadJSON: vi.fn(),
}))

const IMAGE = { id: 'i1', name: 'scan.png', url: 'blob:x', width: 10, height: 10 }
const SHAPE = {
  id: 's1',
  classId: 'c1',
  points: [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 5 },
  ],
}

// Loads one image (optionally annotated) into the provider, then renders the
// header — the default build is the creator variant.
function Harness({ annotated }) {
  const { addImages, setShapes } = useApp()
  useEffect(() => {
    addImages([IMAGE])
    if (annotated) setShapes(IMAGE.id, [SHAPE])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Header leftOpen rightOpen onToggleLeft={() => {}} onToggleRight={() => {}} />
}

function renderHeader({ annotated }) {
  render(
    <AppProvider>
      <Harness annotated={annotated} />
    </AppProvider>,
  )
}

describe('Header export in the creator variant', () => {
  beforeEach(() => {
    localStorage.clear()
    downloadJSON.mockClear()
  })

  afterEach(() => localStorage.clear())

  it('asks for a file name and downloads annotations without a participant ID', () => {
    renderHeader({ annotated: true })

    fireEvent.click(screen.getByRole('button', { name: '⬇ Export' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my-session' } })
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(downloadJSON).toHaveBeenCalledTimes(1)
    const [filename, payload] = downloadJSON.mock.calls[0]
    expect(filename).toBe('my-session.json')
    expect(payload.participantId).toBeNull()
    expect(payload).not.toHaveProperty('survey')
    expect(payload.images[0].shapes).toHaveLength(1)
  })

  it('still warns about unannotated images before asking for a name', () => {
    renderHeader({ annotated: false })

    fireEvent.click(screen.getByRole('button', { name: '⬇ Export' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export anyway' }))

    expect(screen.getByRole('textbox')).toHaveValue('annotations.json')
    expect(downloadJSON).not.toHaveBeenCalled()
  })

  it('downloads nothing when the file name dialog is cancelled', () => {
    renderHeader({ annotated: true })

    fireEvent.click(screen.getByRole('button', { name: '⬇ Export' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(downloadJSON).not.toHaveBeenCalled()
  })

  it('has no participant, lock or log-out controls', () => {
    renderHeader({ annotated: true })

    expect(screen.queryByText('Participant ID')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('opens the instructions from the header button', () => {
    renderHeader({ annotated: true })

    fireEvent.click(screen.getByRole('button', { name: 'Usage & shortcuts' }))

    expect(screen.getByText('How to annotate')).toBeInTheDocument()
  })

  it('switches the interface language', () => {
    renderHeader({ annotated: true })

    fireEvent.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('button', { name: '⬇ Exportieren' })).toBeInTheDocument()
  })

  it('cycles the theme from the header button', () => {
    renderHeader({ annotated: true })

    fireEvent.click(screen.getByRole('button', { name: /^Theme:/ }))

    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
