import { useCallback, useEffect, useRef } from 'react'

/** Returns a stable function that runs `callback` after `delay` ms without further calls. */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const timeouts = timeoutRef
    return () => window.clearTimeout(timeouts.current)
  }, [])

  return useCallback(
    (...args: Args) => {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => callbackRef.current(...args), delay)
    },
    [delay],
  )
}
