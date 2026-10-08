export type ResourceStatus = 'draft' | 'completed'

export interface BasicInfo {
  resourceName: string
  owner: string
  email: string
  description: string
  priority: string
}

export interface ProjectDetails {
  projectName: string
  budget: string
  category: string
  options: string[]
}

export interface Resource {
  _id: string
  resourceId: number
  name: string
  status: ResourceStatus
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
  createdAt: string
  updatedAt: string
}

/** Body of `PUT /api/resources/:id` (completed resources only). */
export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}

export type SortOrder = 'asc' | 'desc'

export interface ResourceListParams {
  page: number
  pageSize: number
  status?: ResourceStatus
  name?: string
  sortOrder: SortOrder
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ResourceListResponse {
  items: Resource[]
  pagination: Pagination
}

export type ModuleKey = 'basicInfo' | 'projectDetails'
