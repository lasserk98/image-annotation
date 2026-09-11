import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import Header from './Header'
import ImageGallery from './ImageGallery'
import ClassPicker from './ClassPicker'
import InstanceList from './InstanceList'
import AnnotationCanvas from './AnnotationCanvas'

export default function Workspace() {
  const { state } = useApp()
  const hasAnnotations = Object.values(state.shapesByImage).some((s) => s.length > 0)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!hasAnnotations) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasAnnotations])

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
      />

      {/* One fixed-height row of three columns. Each column manages its own
          overflow, so a wheel event only ever scrolls what's under the
          pointer and nothing can push the layout past the viewport. */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {leftOpen && (
          <aside
            className="side-panel"
            style={{ width: 268, minWidth: 180, borderRight: '1px solid var(--border)' }}
            aria-label="Classes and images"
          >
            {/* Classes take only the room they need, up to a little over half
                the panel, and scroll internally beyond that — long class lists
                must never squeeze the image list out of view. */}
            <div className="panel-section" style={{ flex: '0 1 auto', maxHeight: '58%' }}>
              <ClassPicker />
            </div>
            {/* Images absorb the leftover height. */}
            <div
              className="panel-section"
              style={{ flex: '1 1 0', borderTop: '1px solid var(--border)' }}
            >
              <ImageGallery />
            </div>
          </aside>
        )}

        <AnnotationCanvas />

        {rightOpen && (
          <aside
            className="side-panel"
            style={{ width: 284, minWidth: 190, borderLeft: '1px solid var(--border)' }}
            aria-label="Segmented instances"
          >
            <div className="panel-section" style={{ flex: '1 1 0' }}>
              <InstanceList />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
