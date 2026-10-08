import type { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../../design-system'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { NARROW } from '../../../shared/ui/layout'
import { canProvision, getModuleState, type ModuleState } from '../model/rules'
import type { ModuleKey, Resource } from '../model/types'
import { resourcePaths } from '../paths'

type StationState = 'complete' | 'current' | 'locked' | 'provisioned'

interface Station {
  key: string
  title: string
  description: string
  state: StationState
  statusText: string
  /** Module has staged edits that aren't saved yet. */
  hasEdits?: boolean
  action: ReactNode
}

interface ProvisioningTrackProps {
  resource: Resource
  resourceKey: string
  editedModules: ModuleKey[]
  isProvisioning: boolean
  onProvision: () => void
}

/**
 * The resource lifecycle as three dependent steps: Basic info unlocks Project details,
 * and both unlock provisioning. Exactly one step is "current" while the resource is a draft.
 */
export function ProvisioningTrack({
  resource,
  resourceKey,
  editedModules,
  isProvisioning,
  onProvision,
}: ProvisioningTrackProps) {
  const isCompleted = resource.status === 'completed'

  const moduleStation = (
    module: ModuleKey,
    title: string,
    description: string,
    path: string,
  ): Station => {
    const moduleState = getModuleState(resource, module)
    const lowerTitle = title.toLowerCase()
    const hasEdits = editedModules.includes(module)
    return {
      key: module,
      title,
      description,
      state: toStationState(moduleState),
      statusText: hasEdits
        ? 'Complete, with unsaved changes'
        : MODULE_STATUS_TEXT[moduleState],
      hasEdits,
      action:
        moduleState === 'locked' ? (
          <Button variant="secondary" size="small" state="locked">
            Locked
          </Button>
        ) : (
          <ButtonLink
            to={path}
            $size="small"
            $variant={moduleState === 'todo' ? 'primary' : 'secondary'}
          >
            {moduleState === 'todo' ? `Fill in ${lowerTitle}` : `Edit ${lowerTitle}`}
          </ButtonLink>
        ),
    }
  }

  const ready = canProvision(resource)
  const stations: Station[] = [
    moduleStation(
      'basicInfo',
      'Basic info',
      'Owner, contact email, description, and priority.',
      resourcePaths.basicInfo(resourceKey),
    ),
    moduleStation(
      'projectDetails',
      'Project details',
      'Project name, budget, category, and the team it needs.',
      resourcePaths.projectDetails(resourceKey),
    ),
    {
      key: 'provision',
      title: 'Provision',
      description: "Moves the resource from draft to completed. This can't be reversed.",
      state: isCompleted ? 'provisioned' : ready ? 'current' : 'locked',
      statusText: isCompleted
        ? 'Provisioned'
        : ready
          ? 'Ready to provision'
          : 'Needs both modules complete',
      action: isCompleted ? null : (
        <Button
          size="small"
          state={ready ? (isProvisioning ? 'disabled' : 'normal') : 'locked'}
          onClick={onProvision}
        >
          {isProvisioning ? 'Provisioning…' : 'Provision resource'}
        </Button>
      ),
    },
  ]

  return (
    <Track aria-label="Steps to complete this resource">
      {stations.map((station, index) => {
        const isLast = index === stations.length - 1
        const filled = station.state === 'complete' || station.state === 'provisioned'
        return (
          <Step
            key={station.key}
            aria-current={station.state === 'current' ? 'step' : undefined}
          >
            <Rail>
              <Marker $state={station.state} aria-hidden="true">
                {filled ? '✓' : index + 1}
              </Marker>
              {isLast ? null : <Connector $filled={filled} aria-hidden="true" />}
            </Rail>
            <Content>
              <StepTitle>{station.title}</StepTitle>
              <StepStatus $state={station.hasEdits ? 'current' : station.state}>
                {station.statusText}
              </StepStatus>
              <StepDescription>{station.description}</StepDescription>
              {station.action ? <StepAction>{station.action}</StepAction> : null}
            </Content>
          </Step>
        )
      })}
    </Track>
  )
}

const MODULE_STATUS_TEXT: Record<ModuleState, string> = {
  complete: 'Complete',
  todo: 'Not started',
  locked: 'Unlocks after Basic info',
}

function toStationState(moduleState: ModuleState): StationState {
  if (moduleState === 'complete') return 'complete'
  if (moduleState === 'locked') return 'locked'
  return 'current'
}

const MARKER_SIZE = 36

const Track = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  ${NARROW} {
    grid-template-columns: 1fr;
  }
`

const Step = styled.li`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${NARROW} {
    grid-template-rows: none;
    grid-template-columns: ${MARKER_SIZE}px 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const Rail = styled.div`
  display: flex;
  align-items: center;

  ${NARROW} {
    flex-direction: column;
  }
`

const markerStyles: Record<StationState, ReturnType<typeof css>> = {
  complete: css`
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
  `,
  provisioned: css`
    background: ${({ theme }) => theme.colors.success};
    border-color: ${({ theme }) => theme.colors.success};
    color: #fff;
  `,
  current: css`
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.inkStrong};
    box-shadow: 0 0 0 5px ${({ theme }) => theme.colors.accentSoft};
  `,
  // Same diagonal hatch the design system uses for its locked controls.
  locked: css`
    background-color: ${({ theme }) => theme.colors.surfaceAlt};
    background-image: repeating-linear-gradient(
      -45deg,
      rgba(18, 33, 43, 0.07) 0 4px,
      transparent 4px 8px
    );
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.inkMuted};
  `,
}

const Marker = styled.span<{ $state: StationState }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MARKER_SIZE}px;
  height: ${MARKER_SIZE}px;
  border-radius: 50%;
  border: 2px solid;
  font-family: ${({ theme }) => theme.typography.heading};
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  ${({ $state }) => markerStyles[$state]}
`

const Connector = styled.span<{ $filled: boolean }>`
  flex: 1;
  height: 2px;
  margin: 0 ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $filled }) =>
    $filled
      ? theme.colors.primary
      : `repeating-linear-gradient(90deg, ${theme.colors.border} 0 6px, transparent 6px 10px)`};

  ${NARROW} {
    flex: 1;
    width: 2px;
    height: auto;
    min-height: 24px;
    margin: ${({ theme }) => theme.spacing.sm} 0;
    background: ${({ theme, $filled }) =>
      $filled
        ? theme.colors.primary
        : `repeating-linear-gradient(180deg, ${theme.colors.border} 0 6px, transparent 6px 10px)`};
  }
`

const Content = styled.div`
  display: grid;
  align-content: start;
  gap: 4px;
  padding-right: ${({ theme }) => theme.spacing.lg};

  ${NARROW} {
    padding: 4px 0 ${({ theme }) => theme.spacing.lg};
  }
`

const StepTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
`

const statusColor: Record<StationState, ReturnType<typeof css>> = {
  complete: css`
    color: ${({ theme }) => theme.colors.primaryStrong};
  `,
  provisioned: css`
    color: ${({ theme }) => theme.colors.success};
  `,
  current: css`
    color: #8a4b0b;
  `,
  locked: css`
    color: ${({ theme }) => theme.colors.inkMuted};
  `,
}

const StepStatus = styled.p<{ $state: StationState }>`
  font-size: 0.9rem;
  font-weight: 600;

  ${({ $state }) => statusColor[$state]}
`

const StepDescription = styled.p`
  max-width: 34ch;
  font-size: 0.95rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const StepAction = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`
