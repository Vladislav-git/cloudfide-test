import { Link, NavLink, useMatch } from 'react-router-dom'
import styled from 'styled-components'
import { formatDate } from '../../../shared/format'
import { NARROW, PageTitle } from '../../../shared/ui/layout'
import { useResourceEdits } from '../edit-buffer/editBufferContext'
import { canEditProjectDetails } from '../model/rules'
import type { Resource } from '../model/types'
import { resourcePaths } from '../paths'
import { StatusBadge } from './StatusBadge'

interface ResourceHeaderProps {
  resource: Resource
  resourceKey: string
}

export function ResourceHeader({ resource, resourceKey }: ResourceHeaderProps) {
  const { hasEdits } = useResourceEdits(resource.resourceId)
  const onOverview = useMatch(resourcePaths.overview(resourceKey)) !== null
  const projectDetailsLocked = !canEditProjectDetails(resource)

  return (
    <Header>
      <BackLink to={resourcePaths.list}>← All resources</BackLink>
      <TitleRow>
        <PageTitle>{resource.name}</PageTitle>
        <StatusBadge status={resource.status} />
        {hasEdits && !onOverview ? (
          <PendingPill to={resourcePaths.overview(resourceKey)}>
            Unsaved changes, review on overview
          </PendingPill>
        ) : null}
      </TitleRow>
      <Meta>
        Resource {resource.resourceId}, created {formatDate(resource.createdAt)}
      </Meta>
      <Tabs aria-label="Resource sections">
        <Tab to={resourcePaths.overview(resourceKey)} end>
          Overview
        </Tab>
        <Tab to={resourcePaths.basicInfo(resourceKey)}>Basic info</Tab>
        {projectDetailsLocked ? (
          <LockedTab aria-disabled="true" title="Complete Basic info first">
            <span aria-hidden="true">🔒</span> Project details
          </LockedTab>
        ) : (
          <Tab to={resourcePaths.projectDetails(resourceKey)}>Project details</Tab>
        )}
        <Tab to={resourcePaths.details(resourceKey)}>Summary</Tab>
      </Tabs>
    </Header>
  )
}

const Header = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BackLink = styled(Link)`
  justify-self: start;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryStrong};

  &:hover {
    text-decoration: underline;
  }
`

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
`

const PendingPill = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.accentSoft};
  color: #8a4b0b;
  font-size: 0.8rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`

const Meta = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Tabs = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;

  ${NARROW} {
    gap: 14px;
  }
`

const tabStyles = `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;

  ${NARROW} {
    font-size: 0.875rem;
  }
`

const Tab = styled(NavLink)`
  ${tabStyles}
  color: ${({ theme }) => theme.colors.inkMuted};

  &:hover {
    color: ${({ theme }) => theme.colors.inkStrong};
  }

  &.active {
    color: ${({ theme }) => theme.colors.inkStrong};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
`

const LockedTab = styled.span`
  ${tabStyles}
  color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.6;
  cursor: not-allowed;
`
