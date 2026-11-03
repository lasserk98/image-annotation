import { useCallback, useEffect, useState } from 'react'

// Annotations live only in memory, so closing or reloading the page loses
// them. This makes the browser ask before the page goes if any image holds
// shapes that were drawn or changed since the last export. It is the only
// leave prompt in the app.
//
// Returns `markExported`, to be called when the file has been written. It
// remembers each image's shape list as exported, and shape lists are replaced
// rather than edited, so a list that is the same object has not changed.
export function useUnexportedWarning(shapesByImage) {
  const [exported, setExported] = useState({})

  const hasUnexported = Object.entries(shapesByImage).some(
    ([id, shapes]) => shapes.length > 0 && exported[id] !== shapes,
  )

  useEffect(() => {
    if (!hasUnexported) return
    function warn(e) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnexported])

  return useCallback(() => setExported(shapesByImage), [shapesByImage])
}
