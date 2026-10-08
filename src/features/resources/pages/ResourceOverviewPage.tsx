import styled from 'styled-components'
import { Card } from '../../../design-system'
import { getErrorMessage } from '../../../api/client'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { Lead, Row, SectionTitle, Stack } from '../../../shared/ui/layout'
import { Notice } from '../../../shared/ui/Notice'
import { PendingChangesPanel } from '../components/PendingChangesPanel'
import { ProvisioningTrack } from '../components/ProvisioningTrack'
import { useEditBuffer, useResourceEdits } from '../edit-buffer/editBufferContext'
import { buildReplacePayload } from '../model/editBuffer'
import { getProvisionBlocker, type ProvisionBlocker } from '../model/rules'
import { resourcePaths } from '../paths'
import { useProvisionResource, useReplaceResource } from '../queries'
import { useResourceOutlet } from '../resourceOutlet'

const GUIDANCE: Record<ProvisionBlocker | 'ready', string> = {
  'basic-info-incomplete':
    'Start with Basic info. Project details unlocks as soon as Basic info is complete.',
  'project-details-incomplete':
    'Basic info is done. Fill in Project details to unlock provisioning.',
  ready: 'Both modules are complete. Provision the resource to mark it as completed.',
  'already-completed':
    'This resource is provisioned. You can still edit both modules; changes are saved together from this page.',
}

export function ResourceOverviewPage() {
  const { resource, resourceKey } = useResourceOutlet()
  const { discard } = useEditBuffer()
  const { edits, editedModules, hasEdits } = useResourceEdits(resource.resourceId)
  const provision = useProvisionResource(resourceKey)
  const replace = useReplaceResource(resourceKey)

  const isCompleted = resource.status === 'completed'
  const guidance = GUIDANCE[getProvisionBlocker(resource) ?? 'ready']

  const saveChanges = () => {
    replace.mutate(buildReplacePayload(resource, edits), {
      onSuccess: () => discard(resource.resourceId),
    })
  }

  const discardChanges = () => {
    replace.reset()
    discard(resource.resourceId)
  }

  return (
    <Stack $gap="lg">
      {isCompleted && hasEdits ? (
        <PendingChangesPanel
          editedModules={editedModules}
          isSaving={replace.isPending}
          saveError={replace.error}
          onSave={saveChanges}
          onDiscard={discardChanges}
        />
      ) : null}

      {replace.isSuccess && !hasEdits ? (
        <Notice tone="success" title="Changes saved">
          The resource now has your latest edits.
        </Notice>
      ) : null}
      {provision.isSuccess ? (
        <Notice tone="success" title="Resource provisioned">
          Its status is now Completed.
        </Notice>
      ) : null}
      {provision.isError ? (
        <Notice tone="error" title="Couldn't provision this resource">
          {getErrorMessage(provision.error)}
        </Notice>
      ) : null}

      <Card variant="elevated">
        <Stack $gap="xl">
          <Row $justify="space-between">
            <Stack $gap="xs">
              <SectionTitle>Progress</SectionTitle>
              <Lead>{guidance}</Lead>
            </Stack>
            <ButtonLink
              to={resourcePaths.details(resourceKey)}
              $variant="ghost"
              $size="small"
            >
              View summary
            </ButtonLink>
          </Row>
          <TrackArea>
            <ProvisioningTrack
              resource={resource}
              resourceKey={resourceKey}
              editedModules={editedModules}
              isProvisioning={provision.isPending}
              onProvision={() => provision.mutate()}
            />
          </TrackArea>
        </Stack>
      </Card>
    </Stack>
  )
}

const TrackArea = styled.div`
  padding-top: ${({ theme }) => theme.spacing.sm};
`
