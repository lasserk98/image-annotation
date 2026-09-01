import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { filesToImages } from '../utils/loadImages'

export default function ImageGallery() {
  const { state, addImages, removeImage, selectImage } = useApp()
  const { images, currentImageId, shapesByImage } = state
  const inputRef = useRef(null)
  const [isDragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFiles(fileList) {
    setLoading(true)
    try {
      const imgs = await filesToImages(fileList)
      if (imgs.length > 0) addImages(imgs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Images ({images.length})
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium px-2 py-1 rounded-md transition hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          + Add
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto scroll-thin px-2 pb-2"
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
      >
        {images.length === 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs transition"
            style={{
              border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              color: 'var(--text-muted)',
              background: isDragging ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            <span>{loading ? 'Loading…' : 'Drop images here'}</span>
            <span style={{ opacity: 0.7 }}>or click to browse</span>
          </button>
        ) : (
          <div className="space-y-1.5">
            {images.map((img) => {
              const count = shapesByImage[img.id]?.length ?? 0
              const active = img.id === currentImageId
              return (
                <div
                  key={img.id}
                  onClick={() => selectImage(img.id)}
                  className="group flex items-center gap-2 rounded-lg p-1.5 cursor-pointer transition"
                  style={{
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                    style={{ border: '1px solid var(--border)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                      {img.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {count} shape{count === 1 ? '' : 's'}
                    </p>
                  </div>
                  {count > 0 && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--success)' }}
                      title="Annotated"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(img.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs px-1 transition flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
