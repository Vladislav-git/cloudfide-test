import { useEffect } from 'react'

/** Asks the browser to confirm before a refresh or tab close while `when` is true. */
export function usePageLeaveWarning(when: boolean) {
  useEffect(() => {
    if (!when) {
      return
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [when])
}
