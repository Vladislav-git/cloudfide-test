import type { BasicInfo, ModuleKey, ProjectDetails, Resource } from './types'

// Completeness checks mirror the backend's isBasicInfoComplete / isProjectDetailsComplete,
// so the UI never offers an action the API would reject.

export function isBasicInfoComplete(basicInfo: BasicInfo): boolean {
  return Boolean(
    basicInfo.resourceName &&
    basicInfo.owner &&
    basicInfo.email &&
    basicInfo.description &&
    basicInfo.priority,
  )
}

export function isProjectDetailsComplete(projectDetails: ProjectDetails): boolean {
  return Boolean(
    projectDetails.projectName &&
    projectDetails.budget &&
    projectDetails.category &&
    projectDetails.options.length > 0,
  )
}

export function isModuleComplete(resource: Resource, module: ModuleKey): boolean {
  return module === 'basicInfo'
    ? isBasicInfoComplete(resource.basicInfo)
    : isProjectDetailsComplete(resource.projectDetails)
}

export function countCompletedModules(resource: Resource): number {
  return [
    isBasicInfoComplete(resource.basicInfo),
    isProjectDetailsComplete(resource.projectDetails),
  ].filter(Boolean).length
}

/** Project Details opens only once Basic Info is complete (completed resources always qualify). */
export function canEditProjectDetails(resource: Resource): boolean {
  return resource.status === 'completed' || isBasicInfoComplete(resource.basicInfo)
}

export type ModuleState = 'complete' | 'todo' | 'locked'

export function getModuleState(resource: Resource, module: ModuleKey): ModuleState {
  if (isModuleComplete(resource, module)) {
    return 'complete'
  }
  if (module === 'projectDetails' && !canEditProjectDetails(resource)) {
    return 'locked'
  }
  return 'todo'
}

export type ProvisionBlocker =
  | 'already-completed'
  | 'basic-info-incomplete'
  | 'project-details-incomplete'

/** Returns why provisioning is not allowed, or null when it is. */
export function getProvisionBlocker(resource: Resource): ProvisionBlocker | null {
  if (resource.status === 'completed') {
    return 'already-completed'
  }
  if (!isBasicInfoComplete(resource.basicInfo)) {
    return 'basic-info-incomplete'
  }
  if (!isProjectDetailsComplete(resource.projectDetails)) {
    return 'project-details-incomplete'
  }
  return null
}

export function canProvision(resource: Resource): boolean {
  return getProvisionBlocker(resource) === null
}

/**
 * The name is immutable after creation; the backend compares submitted names against
 * `basicInfo.resourceName`, falling back to `name`.
 */
export function getLockedResourceName(resource: Resource): string {
  return resource.basicInfo.resourceName.trim() || resource.name.trim()
}
