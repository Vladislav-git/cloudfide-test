import type { Resource } from './types'

/** Test fixture: a freshly created draft, matching what POST /api/resources returns. */
export function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    _id: '665f1c2e8b3a4d0012345678',
    resourceId: 1,
    name: 'Onboarding portal',
    status: 'draft',
    basicInfo: {
      resourceName: 'Onboarding portal',
      owner: '',
      email: '',
      description: '',
      priority: '',
    },
    projectDetails: { projectName: '', budget: '', category: '', options: [] },
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  }
}

export const COMPLETE_BASIC_INFO = {
  resourceName: 'Onboarding portal',
  owner: 'Ada Lovelace',
  email: 'ada@example.com',
  description: 'Self-service portal for new customers.',
  priority: 'high',
}

export const COMPLETE_PROJECT_DETAILS = {
  projectName: 'Portal v1',
  budget: '25000',
  category: 'internal',
  options: ['FE devs', 'Designer'],
}

export function makeCompletedResource(overrides: Partial<Resource> = {}): Resource {
  return makeResource({
    status: 'completed',
    basicInfo: { ...COMPLETE_BASIC_INFO },
    projectDetails: {
      ...COMPLETE_PROJECT_DETAILS,
      options: [...COMPLETE_PROJECT_DETAILS.options],
    },
    ...overrides,
  })
}
