import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Button } from '../../../design-system'
import { getErrorMessage } from '../../../api/client'
import { formatDate } from '../../../shared/format'
import { DangerButton } from '../../../shared/ui/DangerButton'
import { NARROW } from '../../../shared/ui/layout'
import { useEditBuffer } from '../edit-buffer/editBufferContext'
import type { Resource } from '../model/types'
import { resourcePaths } from '../paths'
import { useDeleteResource } from '../queries'
import { ModuleMeter } from './ModuleMeter'
import { StatusBadge } from './StatusBadge'

/** Shared column template so the header row lines up with resource rows. */
export const ROW_COLUMNS =
  'minmax(0, 2.2fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr) 88px'

export function ResourceRow({ resource }: { resource: Resource }) {
  const [confirming, setConfirming] = useState(false)
  const { discard } = useEditBuffer()
  const deleteResource = useDeleteResource()

  const confirmDelete = () => {
    deleteResource.mutate(resource.resourceId, {
      // Unsaved edits for a deleted resource have nowhere to go.
      onSuccess: () => discard(resource.resourceId),
    })
  }

  if (confirming) {
    return (
      <Item>
        <Confirm role="group" aria-label={`Delete ${resource.name}`}>
          <ConfirmText>
            <strong>Delete “{resource.name}”?</strong> This removes the resource and both
            modules permanently.
            {deleteResource.isError ? (
              <ErrorText role="alert">{getErrorMessage(deleteResource.error)}</ErrorText>
            ) : null}
          </ConfirmText>
          <ConfirmActions>
            <Button
              variant="secondary"
              size="small"
              autoFocus
              disabled={deleteResource.isPending}
              onClick={() => {
                deleteResource.reset()
                setConfirming(false)
              }}
            >
              Cancel
            </Button>
            <DangerButton
              size="small"
              disabled={deleteResource.isPending}
              onClick={confirmDelete}
            >
              {deleteResource.isPending ? 'Deleting…' : 'Delete resource'}
            </DangerButton>
          </ConfirmActions>
        </Confirm>
      </Item>
    )
  }

  return (
    <Item>
      <Cells>
        <NameCell>
          <NameLink to={resourcePaths.overview(resource.resourceId)}>
            {resource.name}
          </NameLink>
          <Secondary>Resource {resource.resourceId}</Secondary>
        </NameCell>
        <ModuleMeter resource={resource} />
        <div>
          <StatusBadge status={resource.status} />
        </div>
        <Secondary>{formatDate(resource.createdAt)}</Secondary>
        <Actions>
          <Button
            variant="ghost"
            size="small"
            aria-label={`Delete ${resource.name}`}
            onClick={() => setConfirming(true)}
          >
            Delete
          </Button>
        </Actions>
      </Cells>
    </Item>
  )
}

const Item = styled.li`
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    border-top: none;
  }
`

const Cells = styled.div`
  display: grid;
  grid-template-columns: ${ROW_COLUMNS};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;

  ${NARROW} {
    grid-template-columns: 1fr auto;
    gap: ${({ theme }) => theme.spacing.sm};

    & > :nth-child(1) {
      grid-column: 1 / -1;
    }
  }
`

const NameCell = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const NameLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
  overflow-wrap: anywhere;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryStrong};
    text-decoration: underline;
  }
`

const Secondary = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Confirm = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(180, 71, 27, 0.06);
`

const ConfirmText = styled.p`
  display: grid;
  gap: 4px;
  max-width: 60ch;
  line-height: 1.45;
`

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.warning};
  font-weight: 600;
`

const ConfirmActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`
