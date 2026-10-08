import styled from 'styled-components'
import { isBasicInfoComplete, isProjectDetailsComplete } from '../model/rules'
import type { Resource } from '../model/types'

/** Two-segment progress for Basic info and Project details. */
export function ModuleMeter({ resource }: { resource: Resource }) {
  const segments = [
    isBasicInfoComplete(resource.basicInfo),
    isProjectDetailsComplete(resource.projectDetails),
  ]
  const completed = segments.filter(Boolean).length

  return (
    <Meter>
      <Segments aria-hidden="true">
        {segments.map((done, index) => (
          <Segment key={index} $done={done} />
        ))}
      </Segments>
      <span>{completed} of 2 modules</span>
    </Meter>
  )
}

const Meter = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  white-space: nowrap;
`

const Segments = styled.span`
  display: inline-flex;
  gap: 3px;
`

const Segment = styled.span<{ $done: boolean }>`
  width: 18px;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme, $done }) =>
    $done ? theme.colors.primary : theme.colors.border};
`
