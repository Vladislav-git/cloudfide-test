import { createContext, useContext } from 'react'
import {
  getEditedModules,
  type EditBufferState,
  type ModuleEdit,
  type ModuleEdits,
} from '../model/editBuffer'
import type { ModuleKey, Resource } from '../model/types'

export interface EditBufferContextValue {
  editsByResource: EditBufferState
  stage: (resource: Resource, edit: ModuleEdit) => void
  discard: (resourceId: number, module?: ModuleKey) => void
}

export const EditBufferContext = createContext<EditBufferContextValue | null>(null)

export function useEditBuffer(): EditBufferContextValue {
  const context = useContext(EditBufferContext)
  if (!context) {
    throw new Error('useEditBuffer must be used inside <EditBufferProvider>')
  }
  return context
}

const NO_EDITS: ModuleEdits = {}

/** Staged (unsaved) edits for one completed resource. */
export function useResourceEdits(resourceId: number) {
  const { editsByResource } = useEditBuffer()
  const edits = editsByResource[resourceId] ?? NO_EDITS
  const editedModules = getEditedModules(edits)
  return { edits, editedModules, hasEdits: editedModules.length > 0 }
}
