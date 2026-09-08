import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { filesToImages } from '../utils/loadImages'

export default function ImageGallery() {
  const { state, addImages, removeImage, selectImage, t } = useApp()
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
    <>
      <div className="panel-header">
        <span className="panel-title">{t('imageGallery.heading')}</span>
        <span className="count-badge">{images.length}</span>
        <span className="flex-1" />
        <button onClick={() => inputRef.current?.click()} className="link-btn">
          {t('imageGallery.add')}
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
        className="panel-body"
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
        style={isDragging ? { background: 'var(--accent-soft)' } : undefined}
      >
        {images.length === 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition"
            style={{
              minHeight: 104,
              padding: 12,
              border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border-strong)'}`,
              color: 'var(--text-muted)',
              background: 'transparent',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">
              ⤓
            </span>
            <span style={{ fontWeight: 600 }}>
              {loading ? t('imageGallery.loading') : t('imageGallery.dropHere')}
            </span>
            <span style={{ color: 'var(--text-faint)' }}>{t('imageGallery.orBrowse')}</span>
          </button>
        ) : (
          <div className="space-y-0.5">
            {images.map((img) => {
              const count = shapesByImage[img.id]?.length ?? 0
              const active = img.id === currentImageId
              return (
                <div
                  key={img.id}
                  onClick={() => selectImage(img.id)}
                  className="group list-row"
                  data-active={active}
                  style={{ cursor: 'pointer', padding: 5 }}
                  aria-current={active ? 'true' : undefined}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="rounded-md object-cover flex-shrink-0"
                    style={{ width: 38, height: 38, border: '1px solid var(--border)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12px] truncate"
                      style={{ color: 'var(--text)', fontWeight: active ? 600 : 400 }}
                      title={img.name}
                    >
                      {img.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {count === 1
                        ? t('imageGallery.shapeCount', { n: count })
                        : t('imageGallery.shapeCountPlural', { n: count })}
                    </p>
                  </div>
                  {count > 0 && (
                    <span
                      className="swatch"
                      style={{ background: 'var(--success)', width: 6, height: 6 }}
                      title={t('imageGallery.annotated')}
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(img.id)
                    }}
                    className="row-action"
                    title={t('imageGallery.removeTitle')}
                    aria-label={t('imageGallery.removeTitle')}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
