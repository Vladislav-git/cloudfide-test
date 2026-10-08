import { useCallback, useMemo, useReducer, type ReactNode } from 'react'
import { usePageLeaveWarning } from '../../../shared/hooks/usePageLeaveWarning'
import { editBufferReducer, type ModuleEdit } from '../model/editBuffer'
import type { ModuleKey, Resource } from '../model/types'
import { EditBufferContext } from './editBufferContext'

/**
 * Holds staged edits for completed resources in React state only — never in
 * localStorage/sessionStorage — so they are intentionally lost on refresh or close.
 */
export function EditBufferProvider({ children }: { children: ReactNode }) {
  const [editsByResource, dispatch] = useReducer(editBufferReducer, {})

  usePageLeaveWarning(Object.keys(editsByResource).length > 0)

  const stage = useCallback(
    (resource: Resource, edit: ModuleEdit) => dispatch({ type: 'stage', resource, edit }),
    [],
  )
  const discard = useCallback(
    (resourceId: number, module?: ModuleKey) =>
      dispatch({ type: 'discard', resourceId, module }),
    [],
  )

  const value = useMemo(
    () => ({ editsByResource, stage, discard }),
    [editsByResource, stage, discard],
  )

  return <EditBufferContext value={value}>{children}</EditBufferContext>
}
