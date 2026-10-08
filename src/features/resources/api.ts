import { request } from '../../api/client'
import type {
  BasicInfo,
  ProjectDetails,
  Resource,
  ResourceListParams,
  ResourceListResponse,
  ResourcePayload,
} from './model/types'

const BASE = '/api/resources'

const resourcePath = (id: string | number) => `${BASE}/${encodeURIComponent(id)}`

/** The backend feeds `name` into a Mongo $regex, so match it literally. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function listResources(params: ResourceListParams, signal?: AbortSignal) {
  return request<ResourceListResponse>(BASE, {
    signal,
    query: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      name: params.name ? escapeRegex(params.name.trim()) : undefined,
      sortOrder: params.sortOrder,
    },
  })
}

export function getResource(id: string, signal?: AbortSignal) {
  return request<Resource>(resourcePath(id), { signal })
}

export function createResource(resourceName: string) {
  return request<Resource>(BASE, { method: 'POST', body: { resourceName } })
}

export function updateBasicInfo(id: string, basicInfo: BasicInfo) {
  return request<Resource>(`${resourcePath(id)}/basic-info`, {
    method: 'PATCH',
    body: basicInfo,
  })
}

export function updateProjectDetails(id: string, projectDetails: ProjectDetails) {
  return request<Resource>(`${resourcePath(id)}/project-details`, {
    method: 'PATCH',
    body: projectDetails,
  })
}

export function provisionResource(id: string) {
  return request<Resource>(`${resourcePath(id)}/provisioning`, { method: 'PATCH' })
}

export function replaceResource(id: string, payload: ResourcePayload) {
  return request<Resource>(resourcePath(id), { method: 'PUT', body: payload })
}

export function deleteResource(id: string | number) {
  return request<Resource>(resourcePath(id), { method: 'DELETE' })
}
