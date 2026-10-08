export const resourcePaths = {
  list: '/resources',
  overview: (id: string | number) => `/resources/${id}`,
  details: (id: string | number) => `/resources/${id}/details`,
  basicInfo: (id: string | number) => `/resources/${id}/basic-info`,
  projectDetails: (id: string | number) => `/resources/${id}/project-details`,
}
