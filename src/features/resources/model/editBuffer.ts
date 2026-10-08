import { getLockedResourceName } from './rules'
import type { BasicInfoFormValues, ProjectDetailsFormValues } from './schemas'
import type {
  BasicInfo,
  ModuleKey,
  ProjectDetails,
  Resource,
  ResourcePayload,
} from './types'

/**
 * Edits to a completed resource that have not been sent to the API yet.
 * Lives only in memory: a refresh or closed tab drops it, by design.
 */
export interface ModuleEdits {
  basicInfo?: BasicInfoFormValues
  projectDetails?: ProjectDetailsFormValues
}

export type ModuleEdit =
  | { module: 'basicInfo'; values: BasicInfoFormValues }
  | { module: 'projectDetails'; values: ProjectDetailsFormValues }

/** Edits keyed by numeric `resourceId`. */
export type EditBufferState = Record<number, ModuleEdits>

export type EditBufferAction =
  | { type: 'stage'; resource: Resource; edit: ModuleEdit }
  | { type: 'discard'; resourceId: number; module?: ModuleKey }

export function editBufferReducer(
  state: EditBufferState,
  action: EditBufferAction,
): EditBufferState {
  switch (action.type) {
    case 'stage': {
      const { resource, edit } = action
      // Staging values identical to what's saved is the same as having no edit.
      if (isUnchanged(resource, edit)) {
        return removeModule(state, resource.resourceId, edit.module)
      }
      return {
        ...state,
        [resource.resourceId]: {
          ...state[resource.resourceId],
          [edit.module]: edit.values,
        },
      }
    }
    case 'discard':
      return action.module
        ? removeModule(state, action.resourceId, action.module)
        : omitKey(state, action.resourceId)
  }
}

function removeModule(
  state: EditBufferState,
  resourceId: number,
  module: ModuleKey,
): EditBufferState {
  const current = state[resourceId]
  if (!current?.[module]) {
    return state
  }
  const next = omitKey(current, module)
  return Object.keys(next).length > 0
    ? { ...state, [resourceId]: next }
    : omitKey(state, resourceId)
}

function omitKey<T extends object, K extends keyof T>(source: T, key: K): Omit<T, K> {
  const copy = { ...source }
  delete copy[key]
  return copy
}

function isUnchanged(resource: Resource, edit: ModuleEdit): boolean {
  if (edit.module === 'basicInfo') {
    const saved = toBasicInfoFormValues(resource.basicInfo)
    return (Object.keys(saved) as (keyof BasicInfoFormValues)[]).every(
      (key) => saved[key] === edit.values[key],
    )
  }
  const saved = resource.projectDetails
  return (
    saved.projectName === edit.values.projectName &&
    saved.budget === edit.values.budget &&
    saved.category === edit.values.category &&
    sameMembers(saved.options, edit.values.options)
  )
}

function sameMembers(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value) => b.includes(value))
}

export function getEditedModules(edits: ModuleEdits | undefined): ModuleKey[] {
  if (!edits) {
    return []
  }
  return (['basicInfo', 'projectDetails'] as const).filter((module) => edits[module])
}

export function toBasicInfoFormValues(basicInfo: BasicInfo): BasicInfoFormValues {
  return {
    owner: basicInfo.owner,
    email: basicInfo.email,
    description: basicInfo.description,
    priority: basicInfo.priority,
  }
}

export function toProjectDetailsFormValues(
  projectDetails: ProjectDetails,
): ProjectDetailsFormValues {
  return {
    projectName: projectDetails.projectName,
    budget: projectDetails.budget,
    category: projectDetails.category,
    options: [...projectDetails.options],
  }
}

export function toBasicInfoPayload(
  resource: Resource,
  values: BasicInfoFormValues,
): BasicInfo {
  return { ...values, resourceName: getLockedResourceName(resource) }
}

/** Full PUT body: saved data with any staged module edits laid over it. */
export function buildReplacePayload(
  resource: Resource,
  edits: ModuleEdits,
): ResourcePayload {
  return {
    name: getLockedResourceName(resource),
    basicInfo: toBasicInfoPayload(
      resource,
      edits.basicInfo ?? toBasicInfoFormValues(resource.basicInfo),
    ),
    projectDetails:
      edits.projectDetails ?? toProjectDetailsFormValues(resource.projectDetails),
  }
}
