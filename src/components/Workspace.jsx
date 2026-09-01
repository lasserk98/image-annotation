import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Header from './Header'
import ImageGallery from './ImageGallery'
import ClassPicker from './ClassPicker'
import ShapeList from './ShapeList'
import AnnotationCanvas from './AnnotationCanvas'

export default function Workspace() {
  const { state } = useApp()
  const hasAnnotations = Object.values(state.shapesByImage).some((s) => s.length > 0)

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
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <div className="flex-1 flex min-h-0 relative">
        <aside
          className="w-72 flex-shrink-0 flex flex-col min-h-0"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex-shrink-0" style={{ height: 260 }}>
            <ImageGallery />
          </div>
          <ClassPicker />
          <ShapeList />
        </aside>
        <AnnotationCanvas />
      </div>
    </div>
  )
}
