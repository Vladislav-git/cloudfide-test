import styled from 'styled-components'
import { Button, Input, Select } from '../../../design-system'
import { NARROW } from '../../../shared/ui/layout'
import type { ResourceStatus, SortOrder } from '../model/types'

type StatusFilter = ResourceStatus | 'all'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

interface ResourceFiltersProps {
  status: ResourceStatus | undefined
  counts: Record<StatusFilter, number | undefined>
  search: string
  sortOrder: SortOrder
  onStatusChange: (status: ResourceStatus | undefined) => void
  onSearchChange: (search: string) => void
  onSortChange: (sortOrder: SortOrder) => void
}

export function ResourceFilters({
  status,
  counts,
  search,
  sortOrder,
  onStatusChange,
  onSearchChange,
  onSortChange,
}: ResourceFiltersProps) {
  const activeStatus: StatusFilter = status ?? 'all'

  return (
    <Bar>
      <StatusGroup role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map(({ value, label }) => {
          const active = value === activeStatus
          return (
            <Button
              key={value}
              size="small"
              variant={active ? 'primary' : 'ghost'}
              aria-pressed={active}
              onClick={() => onStatusChange(value === 'all' ? undefined : value)}
            >
              {label}
              <Count $active={active}>{counts[value] ?? '–'}</Count>
            </Button>
          )
        })}
      </StatusGroup>
      <Controls>
        <Input
          type="search"
          aria-label="Search resources by name"
          placeholder="Search by name"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Select
          aria-label="Sort order"
          options={SORT_OPTIONS}
          value={sortOrder}
          onChange={(event) =>
            onSortChange(event.target.value === 'asc' ? 'asc' : 'desc')
          }
        />
      </Controls>
    </Bar>
  )
}

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const StatusGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Count = styled.span<{ $active: boolean }>`
  min-width: 1.6em;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active }) =>
    $active ? 'rgba(255, 255, 255, 0.22)' : 'rgba(18, 33, 43, 0.07)'};
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
`

const Controls = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 280px) 160px;
  gap: ${({ theme }) => theme.spacing.sm};

  ${NARROW} {
    width: 100%;
    grid-template-columns: 1fr;
  }
`
