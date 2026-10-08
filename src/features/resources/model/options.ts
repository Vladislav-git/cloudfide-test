import type { ModuleKey, ResourceStatus } from './types'

// Allowed values mirror the backend validation in resource.service.ts.

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const CATEGORY_LABELS: Record<string, string> = {
  internal: 'Internal',
  external: 'External',
  vendor: 'Vendor',
}

export const TEAM_MEMBER_OPTIONS = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
]

export const PRIORITY_VALUES = Object.keys(PRIORITY_LABELS)
export const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS)

export const STATUS_LABELS: Record<ResourceStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
}

export const MODULE_LABELS: Record<ModuleKey, string> = {
  basicInfo: 'Basic info',
  projectDetails: 'Project details',
}

export function toSelectOptions(labels: Record<string, string>, placeholder: string) {
  return [
    { value: '', label: placeholder },
    ...Object.entries(labels).map(([value, label]) => ({ value, label })),
  ]
}
