import { useState } from 'react'
import { Lead, SectionTitle, Stack } from '../../../shared/ui/layout'
import { BasicInfoForm } from '../components/BasicInfoForm'
import { CompletedEditNotice } from '../components/CompletedEditNotice'
import { useEditBuffer, useResourceEdits } from '../edit-buffer/editBufferContext'
import { toBasicInfoFormValues, toBasicInfoPayload } from '../model/editBuffer'
import { getLockedResourceName, isProjectDetailsComplete } from '../model/rules'
import type { BasicInfoFormValues } from '../model/schemas'
import { resourcePaths } from '../paths'
import { useUpdateBasicInfo } from '../queries'
import { useResourceOutlet } from '../resourceOutlet'

export function BasicInfoPage() {
  const { resource, resourceKey } = useResourceOutlet()
  const { stage, discard } = useEditBuffer()
  const { edits } = useResourceEdits(resource.resourceId)
  const updateBasicInfo = useUpdateBasicInfo(resourceKey)
  // Bumped on "Revert to saved" to remount the form with the saved values.
  const [formVersion, setFormVersion] = useState(0)

  const isCompleted = resource.status === 'completed'
  const stagedValues = isCompleted ? edits.basicInfo : undefined
  const overviewPath = resourcePaths.overview(resourceKey)
  // Draft flow continues straight to the next module when it still needs filling in.
  const continuesToProjectDetails =
    !isCompleted && !isProjectDetailsComplete(resource.projectDetails)

  const handleSubmit = (values: BasicInfoFormValues) => {
    if (isCompleted) {
      stage(resource, { module: 'basicInfo', values })
      return
    }
    return updateBasicInfo.mutateAsync(toBasicInfoPayload(resource, values))
  }

  const revert = () => {
    discard(resource.resourceId, 'basicInfo')
    setFormVersion((version) => version + 1)
  }

  return (
    <Stack $gap="lg">
      <Stack $gap="xs">
        <SectionTitle>Basic info</SectionTitle>
        <Lead>Who owns this resource, how to reach them, and how urgent it is.</Lead>
      </Stack>
      {isCompleted ? (
        <CompletedEditNotice hasStagedEdits={Boolean(stagedValues)} onRevert={revert} />
      ) : null}
      <BasicInfoForm
        key={formVersion}
        lockedName={getLockedResourceName(resource)}
        defaultValues={stagedValues ?? toBasicInfoFormValues(resource.basicInfo)}
        submitLabel={
          isCompleted
            ? 'Apply changes'
            : continuesToProjectDetails
              ? 'Save and continue'
              : 'Save basic info'
        }
        cancelTo={overviewPath}
        successTo={
          continuesToProjectDetails
            ? resourcePaths.projectDetails(resourceKey)
            : overviewPath
        }
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
