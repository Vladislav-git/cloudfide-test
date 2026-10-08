import { describe, expect, it } from 'vitest'
import {
  canEditProjectDetails,
  canProvision,
  countCompletedModules,
  getLockedResourceName,
  getModuleState,
  getProvisionBlocker,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from './rules'
import {
  COMPLETE_BASIC_INFO,
  COMPLETE_PROJECT_DETAILS,
  makeCompletedResource,
  makeResource,
} from './testing'

describe('module completeness', () => {
  it('treats a freshly created resource as having no complete modules', () => {
    const resource = makeResource()
    expect(isBasicInfoComplete(resource.basicInfo)).toBe(false)
    expect(isProjectDetailsComplete(resource.projectDetails)).toBe(false)
    expect(countCompletedModules(resource)).toBe(0)
  })

  it('requires every Basic Info field', () => {
    expect(isBasicInfoComplete(COMPLETE_BASIC_INFO)).toBe(true)
    expect(isBasicInfoComplete({ ...COMPLETE_BASIC_INFO, priority: '' })).toBe(false)
  })

  it('requires at least one team member for Project Details', () => {
    expect(isProjectDetailsComplete(COMPLETE_PROJECT_DETAILS)).toBe(true)
    expect(isProjectDetailsComplete({ ...COMPLETE_PROJECT_DETAILS, options: [] })).toBe(
      false,
    )
  })
})

describe('project details gating', () => {
  it('locks Project Details on a draft until Basic Info is complete', () => {
    const draft = makeResource()
    expect(canEditProjectDetails(draft)).toBe(false)
    expect(getModuleState(draft, 'projectDetails')).toBe('locked')
    expect(getModuleState(draft, 'basicInfo')).toBe('todo')
  })

  it('unlocks Project Details once Basic Info is complete', () => {
    const draft = makeResource({ basicInfo: COMPLETE_BASIC_INFO })
    expect(canEditProjectDetails(draft)).toBe(true)
    expect(getModuleState(draft, 'projectDetails')).toBe('todo')
    expect(getModuleState(draft, 'basicInfo')).toBe('complete')
  })

  it('always allows editing Project Details on a completed resource', () => {
    expect(canEditProjectDetails(makeCompletedResource())).toBe(true)
  })
})

describe('provisioning rules', () => {
  it('blocks a draft with incomplete Basic Info', () => {
    expect(getProvisionBlocker(makeResource())).toBe('basic-info-incomplete')
  })

  it('blocks a draft with incomplete Project Details', () => {
    const draft = makeResource({ basicInfo: COMPLETE_BASIC_INFO })
    expect(getProvisionBlocker(draft)).toBe('project-details-incomplete')
    expect(canProvision(draft)).toBe(false)
  })

  it('allows a draft with both modules complete', () => {
    const draft = makeResource({
      basicInfo: COMPLETE_BASIC_INFO,
      projectDetails: COMPLETE_PROJECT_DETAILS,
    })
    expect(getProvisionBlocker(draft)).toBeNull()
    expect(canProvision(draft)).toBe(true)
  })

  it('never re-provisions a completed resource', () => {
    const completed = makeCompletedResource()
    expect(getProvisionBlocker(completed)).toBe('already-completed')
    expect(canProvision(completed)).toBe(false)
  })
})

describe('getLockedResourceName', () => {
  it('prefers basicInfo.resourceName and falls back to name, like the backend', () => {
    expect(getLockedResourceName(makeResource())).toBe('Onboarding portal')
    const legacy = makeResource({
      name: 'Legacy name',
      basicInfo: { ...makeResource().basicInfo, resourceName: '' },
    })
    expect(getLockedResourceName(legacy)).toBe('Legacy name')
  })
})
