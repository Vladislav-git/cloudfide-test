import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
} from './api'
import type {
  BasicInfo,
  ProjectDetails,
  Resource,
  ResourceListParams,
  ResourcePayload,
  ResourceStatus,
} from './model/types'

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  /** Keyed by the id as it appears in the URL (numeric resourceId or ObjectId). */
  detail: (id: string) => [...resourceKeys.details(), id] as const,
}

export function useResourceList(params: ResourceListParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: ({ signal }) => listResources(params, signal),
    placeholderData: keepPreviousData,
  })
}

const COUNTED_STATUSES = [undefined, 'draft', 'completed'] as const

/** Totals per status for the current name search, from the backend's pagination counts. */
export function useStatusCounts(name: string | undefined) {
  return useQueries({
    queries: COUNTED_STATUSES.map((status) => {
      const params: ResourceListParams = {
        page: 1,
        pageSize: 1,
        status,
        name,
        sortOrder: 'desc',
      }
      return {
        queryKey: resourceKeys.list(params),
        queryFn: ({ signal }: { signal: AbortSignal }) => listResources(params, signal),
        placeholderData: keepPreviousData,
      }
    }),
    combine: (results): Record<ResourceStatus | 'all', number | undefined> => ({
      all: results[0].data?.pagination.totalItems,
      draft: results[1].data?.pagination.totalItems,
      completed: results[2].data?.pagination.totalItems,
    }),
  })
}

export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: ({ signal }) => getResource(id, signal),
  })
}

/** Writes a fresh server copy into the detail cache and marks every list stale. */
function useSyncResource() {
  const queryClient = useQueryClient()
  return (id: string, resource: Resource) => {
    queryClient.setQueryData(resourceKeys.detail(id), resource)
    void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
  }
}

export function useCreateResource() {
  const syncResource = useSyncResource()
  return useMutation({
    mutationFn: (resourceName: string) => createResource(resourceName),
    onSuccess: (resource) => syncResource(String(resource.resourceId), resource),
  })
}

export function useUpdateBasicInfo(id: string) {
  const syncResource = useSyncResource()
  return useMutation({
    mutationFn: (basicInfo: BasicInfo) => updateBasicInfo(id, basicInfo),
    onSuccess: (resource) => syncResource(id, resource),
  })
}

export function useUpdateProjectDetails(id: string) {
  const syncResource = useSyncResource()
  return useMutation({
    mutationFn: (projectDetails: ProjectDetails) =>
      updateProjectDetails(id, projectDetails),
    onSuccess: (resource) => syncResource(id, resource),
  })
}

export function useProvisionResource(id: string) {
  const syncResource = useSyncResource()
  return useMutation({
    mutationFn: () => provisionResource(id),
    onSuccess: (resource) => syncResource(id, resource),
  })
}

export function useReplaceResource(id: string) {
  const syncResource = useSyncResource()
  return useMutation({
    mutationFn: (payload: ResourcePayload) => replaceResource(id, payload),
    onSuccess: (resource) => syncResource(id, resource),
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number) => deleteResource(resourceId),
    onSuccess: (resource) => {
      queryClient.removeQueries({
        queryKey: resourceKeys.detail(String(resource.resourceId)),
      })
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}
