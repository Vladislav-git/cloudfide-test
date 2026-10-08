import { useState } from 'react'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { Lead, SectionTitle, Stack } from '../../../shared/ui/layout'
import { Notice } from '../../../shared/ui/Notice'
import { CompletedEditNotice } from '../components/CompletedEditNotice'
import { ProjectDetailsForm } from '../components/ProjectDetailsForm'
import { useEditBuffer, useResourceEdits } from '../edit-buffer/editBufferContext'
import { toProjectDetailsFormValues } from '../model/editBuffer'
import { canEditProjectDetails } from '../model/rules'
import type { ProjectDetailsFormValues } from '../model/schemas'
import { resourcePaths } from '../paths'
import { useUpdateProjectDetails } from '../queries'
import { useResourceOutlet } from '../resourceOutlet'

export function ProjectDetailsPage() {
  const { resource, resourceKey } = useResourceOutlet()
  const { stage, discard } = useEditBuffer()
  const { edits } = useResourceEdits(resource.resourceId)
  const updateProjectDetails = useUpdateProjectDetails(resourceKey)
  // Bumped on "Revert to saved" to remount the form with the saved values.
  const [formVersion, setFormVersion] = useState(0)

  const isCompleted = resource.status === 'completed'
  const stagedValues = isCompleted ? edits.projectDetails : undefined
  const overviewPath = resourcePaths.overview(resourceKey)

  const heading = (
    <Stack $gap="xs">
      <SectionTitle>Project details</SectionTitle>
      <Lead>What the project is, what it costs, and which roles it needs.</Lead>
    </Stack>
  )

  // Guards direct URL access too, not just the disabled tab.
  if (!canEditProjectDetails(resource)) {
    return (
      <Stack $gap="lg">
        {heading}
        <Notice
          tone="info"
          title="Complete Basic info first"
          actions={
            <ButtonLink to={resourcePaths.basicInfo(resourceKey)} $size="small">
              Go to Basic info
            </ButtonLink>
          }
        >
          Project details unlocks once every Basic info field is filled in and saved.
        </Notice>
      </Stack>
    )
  }

  const handleSubmit = (values: ProjectDetailsFormValues) => {
    if (isCompleted) {
      stage(resource, { module: 'projectDetails', values })
      return
    }
    return updateProjectDetails.mutateAsync(values)
  }

  const revert = () => {
    discard(resource.resourceId, 'projectDetails')
    setFormVersion((version) => version + 1)
  }

  return (
    <Stack $gap="lg">
      {heading}
      {isCompleted ? (
        <CompletedEditNotice hasStagedEdits={Boolean(stagedValues)} onRevert={revert} />
      ) : null}
      <ProjectDetailsForm
        key={formVersion}
        defaultValues={
          stagedValues ?? toProjectDetailsFormValues(resource.projectDetails)
        }
        submitLabel={isCompleted ? 'Apply changes' : 'Save project details'}
        cancelTo={overviewPath}
        successTo={overviewPath}
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
