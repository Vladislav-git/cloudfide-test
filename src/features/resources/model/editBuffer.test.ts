import { describe, expect, it } from 'vitest'
import {
  buildReplacePayload,
  editBufferReducer,
  getEditedModules,
  toBasicInfoFormValues,
  type EditBufferState,
} from './editBuffer'
import {
  COMPLETE_BASIC_INFO,
  COMPLETE_PROJECT_DETAILS,
  makeCompletedResource,
} from './testing'

const resource = makeCompletedResource({ resourceId: 7 })
const editedBasicInfo = {
  ...toBasicInfoFormValues(resource.basicInfo),
  owner: 'Grace Hopper',
}
const editedProjectDetails = { ...COMPLETE_PROJECT_DETAILS, budget: '40000' }

function stageBoth(): EditBufferState {
  const withBasicInfo = editBufferReducer(
    {},
    { type: 'stage', resource, edit: { module: 'basicInfo', values: editedBasicInfo } },
  )
  return editBufferReducer(withBasicInfo, {
    type: 'stage',
    resource,
    edit: { module: 'projectDetails', values: editedProjectDetails },
  })
}

describe('editBufferReducer', () => {
  it('stages module edits per resource without touching other modules', () => {
    const state = stageBoth()
    expect(state[7]).toEqual({
      basicInfo: editedBasicInfo,
      projectDetails: editedProjectDetails,
    })
    expect(getEditedModules(state[7])).toEqual(['basicInfo', 'projectDetails'])
  })

  it('drops a module edit that matches the saved values', () => {
    const state = editBufferReducer(stageBoth(), {
      type: 'stage',
      resource,
      edit: { module: 'basicInfo', values: toBasicInfoFormValues(resource.basicInfo) },
    })
    expect(getEditedModules(state[7])).toEqual(['projectDetails'])
  })

  it('treats a reordered team selection as unchanged', () => {
    const state = editBufferReducer(
      {},
      {
        type: 'stage',
        resource,
        edit: {
          module: 'projectDetails',
          values: { ...COMPLETE_PROJECT_DETAILS, options: ['Designer', 'FE devs'] },
        },
      },
    )
    expect(state).toEqual({})
  })

  it('discards a single module, and removes the resource entry once empty', () => {
    const afterOne = editBufferReducer(stageBoth(), {
      type: 'discard',
      resourceId: 7,
      module: 'projectDetails',
    })
    expect(getEditedModules(afterOne[7])).toEqual(['basicInfo'])

    const afterBoth = editBufferReducer(afterOne, {
      type: 'discard',
      resourceId: 7,
      module: 'basicInfo',
    })
    expect(afterBoth).toEqual({})
  })

  it('discards every module of a resource at once', () => {
    expect(editBufferReducer(stageBoth(), { type: 'discard', resourceId: 7 })).toEqual({})
  })

  it('returns the same state when there is nothing to discard', () => {
    const state = stageBoth()
    expect(
      editBufferReducer(state, { type: 'discard', resourceId: 99, module: 'basicInfo' }),
    ).toBe(state)
  })
})

describe('buildReplacePayload', () => {
  it('lays staged edits over saved data and keeps the locked name', () => {
    const payload = buildReplacePayload(resource, { basicInfo: editedBasicInfo })
    expect(payload).toEqual({
      name: 'Onboarding portal',
      basicInfo: { ...COMPLETE_BASIC_INFO, owner: 'Grace Hopper' },
      projectDetails: COMPLETE_PROJECT_DETAILS,
    })
  })

  it('sends the saved modules unchanged when nothing is staged', () => {
    expect(buildReplacePayload(resource, {})).toEqual({
      name: resource.name,
      basicInfo: resource.basicInfo,
      projectDetails: resource.projectDetails,
    })
  })
})
