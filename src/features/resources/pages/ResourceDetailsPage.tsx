import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Badge, Card } from '../../../design-system'
import { formatDateTime, formatInteger } from '../../../shared/format'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { Lead, NARROW, Row, SectionTitle, Stack } from '../../../shared/ui/layout'
import { Notice } from '../../../shared/ui/Notice'
import { ModuleMeter } from '../components/ModuleMeter'
import { StatusBadge } from '../components/StatusBadge'
import { useResourceEdits } from '../edit-buffer/editBufferContext'
import { CATEGORY_LABELS, MODULE_LABELS, PRIORITY_LABELS } from '../model/options'
import {
  canEditProjectDetails,
  canProvision,
  countCompletedModules,
  getLockedResourceName,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../model/rules'
import type { Resource } from '../model/types'
import { resourcePaths } from '../paths'
import { useResourceOutlet } from '../resourceOutlet'

export function ResourceDetailsPage() {
  const { resource, resourceKey } = useResourceOutlet()
  const { editedModules, hasEdits } = useResourceEdits(resource.resourceId)
  const { basicInfo, projectDetails } = resource

  return (
    <Stack $gap="lg">
      <Stack $gap="xs">
        <SectionTitle>Summary</SectionTitle>
        <Lead>Everything saved for this resource, in one place.</Lead>
      </Stack>

      {hasEdits ? (
        <Notice
          tone="pending"
          title="This summary shows saved values"
          actions={
            <ButtonLink to={resourcePaths.overview(resourceKey)} $size="small">
              Review changes
            </ButtonLink>
          }
        >
          Your unsaved changes to{' '}
          {editedModules.map((module) => MODULE_LABELS[module]).join(' and ')} appear here
          once you save them.
        </Notice>
      ) : null}

      <Card variant="elevated">
        <StatusFacts>
          <Fact label="Status">
            <Row>
              <StatusBadge status={resource.status} />
              <span>{describeStatus(resource)}</span>
            </Row>
          </Fact>
          <Fact label="Modules">
            <ModuleMeter resource={resource} />
          </Fact>
          <Fact label="Created">{formatDateTime(resource.createdAt)}</Fact>
          <Fact label="Last updated">{formatDateTime(resource.updatedAt)}</Fact>
        </StatusFacts>
      </Card>

      <Modules>
        <ModuleSummary
          title="Basic info"
          complete={isBasicInfoComplete(basicInfo)}
          editTo={resourcePaths.basicInfo(resourceKey)}
        >
          <Fact label="Resource name">{getLockedResourceName(resource)}</Fact>
          <Fact label="Owner">{valueOrEmpty(basicInfo.owner)}</Fact>
          <Fact label="Contact email">{valueOrEmpty(basicInfo.email)}</Fact>
          <Fact label="Priority">
            {valueOrEmpty(PRIORITY_LABELS[basicInfo.priority] ?? basicInfo.priority)}
          </Fact>
          <Fact label="Description">
            <Prose>{valueOrEmpty(basicInfo.description)}</Prose>
          </Fact>
        </ModuleSummary>

        <ModuleSummary
          title="Project details"
          complete={isProjectDetailsComplete(projectDetails)}
          editTo={
            canEditProjectDetails(resource)
              ? resourcePaths.projectDetails(resourceKey)
              : undefined
          }
        >
          <Fact label="Project name">{valueOrEmpty(projectDetails.projectName)}</Fact>
          <Fact label="Budget">{valueOrEmpty(formatInteger(projectDetails.budget))}</Fact>
          <Fact label="Category">
            {valueOrEmpty(
              CATEGORY_LABELS[projectDetails.category] ?? projectDetails.category,
            )}
          </Fact>
          <Fact label="Team members">
            {projectDetails.options.length > 0 ? (
              <Row>
                {projectDetails.options.map((member) => (
                  <Badge key={member}>{member}</Badge>
                ))}
              </Row>
            ) : (
              <EmptyValue>Not provided</EmptyValue>
            )}
          </Fact>
        </ModuleSummary>
      </Modules>
    </Stack>
  )
}

function describeStatus(resource: Resource): string {
  if (resource.status === 'completed') {
    return 'Both modules are complete and the resource is provisioned.'
  }
  if (canProvision(resource)) {
    return 'Both modules are complete. It can be provisioned from the overview.'
  }
  const remaining = 2 - countCompletedModules(resource)
  return `${remaining} ${remaining === 1 ? 'module' : 'modules'} left before it can be provisioned.`
}

function valueOrEmpty(value: string): ReactNode {
  return value ? value : <EmptyValue>Not provided</EmptyValue>
}

interface ModuleSummaryProps {
  title: string
  complete: boolean
  editTo?: string
  children: ReactNode
}

function ModuleSummary({ title, complete, editTo, children }: ModuleSummaryProps) {
  return (
    <Card variant="outline">
      <Row $justify="space-between">
        <Row>
          <ModuleTitle>{title}</ModuleTitle>
          <Badge variant={complete ? 'success' : 'neutral'}>
            {complete ? 'Complete' : 'Not started'}
          </Badge>
        </Row>
        {editTo ? (
          <ButtonLink to={editTo} $variant="ghost" $size="small">
            Edit
          </ButtonLink>
        ) : null}
      </Row>
      <Facts>{children}</Facts>
    </Card>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <FactItem>
      <FactLabel>{label}</FactLabel>
      <FactValue>{children}</FactValue>
    </FactItem>
  )
}

const Modules = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: start;

  ${NARROW} {
    grid-template-columns: 1fr;
  }
`

const ModuleTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
`

const Facts = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin: 0;
`

const StatusFacts = styled(Facts)`
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr));

  ${NARROW} {
    grid-template-columns: 1fr;
  }
`

const FactItem = styled.div`
  display: grid;
  gap: 2px;
`

const FactLabel = styled.dt`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const FactValue = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkStrong};
  overflow-wrap: anywhere;
`

const Prose = styled.span`
  display: block;
  max-width: 68ch;
  white-space: pre-wrap;
  line-height: 1.5;
`

const EmptyValue = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`
