import styled from 'styled-components'
import { Button } from '../../design-system'

interface PaginationBarProps {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  itemCount: number
  onPageChange: (page: number) => void
}

export function PaginationBar({
  page,
  pageSize,
  totalItems,
  totalPages,
  itemCount,
  onPageChange,
}: PaginationBarProps) {
  if (totalItems === 0) {
    return null
  }
  const from = (page - 1) * pageSize + 1
  const to = from + itemCount - 1

  return (
    <Bar aria-label="Pagination">
      <Summary>
        Showing {from}–{to} of {totalItems}
      </Summary>
      {totalPages > 1 ? (
        <Controls>
          <Button
            variant="secondary"
            size="small"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <PageLabel>
            Page {page} of {totalPages}
          </PageLabel>
          <Button
            variant="secondary"
            size="small"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </Controls>
      ) : null}
    </Bar>
  )
}

const Bar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const Summary = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-variant-numeric: tabular-nums;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const PageLabel = styled.span`
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
`
