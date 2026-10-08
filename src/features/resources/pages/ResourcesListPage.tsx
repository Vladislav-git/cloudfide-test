import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Card } from '../../../design-system'
import { useDebouncedCallback } from '../../../shared/hooks/useDebouncedCallback'
import { Lead, NARROW, PageTitle, Stack } from '../../../shared/ui/layout'
import { PaginationBar } from '../../../shared/ui/PaginationBar'
import { EmptyState, ErrorState, LoadingState } from '../../../shared/ui/StateMessage'
import { CreateResourceForm } from '../components/CreateResourceForm'
import { ResourceFilters } from '../components/ResourceFilters'
import { ResourceRow, ROW_COLUMNS } from '../components/ResourceRow'
import { useResourceList, useStatusCounts } from '../queries'
import { useResourceListParams } from '../useResourceListParams'

export function ResourcesListPage() {
  const { params, update } = useResourceListParams()
  const list = useResourceList(params)
  const counts = useStatusCounts(params.name)

  // The input updates instantly; the URL (and the query) follow once typing pauses.
  const [search, setSearch] = useState(params.name ?? '')
  const applySearch = useDebouncedCallback((name: string) => update({ name }), 300)

  // The backend clamps out-of-range pages (e.g. after deleting the last row on a page);
  // keep the URL in step with the page actually shown.
  const servedPage = list.isPlaceholderData ? undefined : list.data?.pagination.page
  useEffect(() => {
    if (servedPage !== undefined && servedPage !== params.page) {
      update({ page: servedPage })
    }
  }, [servedPage, params.page, update])

  const hasFilters = Boolean(params.status || params.name)
  const clearFilters = () => {
    setSearch('')
    update({ status: undefined, name: undefined })
  }

  return (
    <Stack $gap="xl">
      <Stack $gap="sm">
        <PageTitle>Resources</PageTitle>
        <Lead>
          Create a resource, fill in its two modules, then provision it to mark it as
          completed.
        </Lead>
      </Stack>

      <CreateResourceForm />

      <Stack $gap="md">
        <ResourceFilters
          status={params.status}
          counts={counts}
          search={search}
          sortOrder={params.sortOrder}
          onStatusChange={(status) => update({ status })}
          onSearchChange={(value) => {
            setSearch(value)
            applySearch(value)
          }}
          onSortChange={(sortOrder) => update({ sortOrder })}
        />

        {list.isPending ? (
          <LoadingState label="Loading resources…" />
        ) : list.isError ? (
          <ErrorState
            title="Couldn't load resources"
            error={list.error}
            onRetry={() => void list.refetch()}
          />
        ) : (
          <>
            <Card variant="elevated">
              {list.data.items.length === 0 ? (
                hasFilters ? (
                  <EmptyState
                    title="No resources match these filters"
                    action={
                      <Button variant="secondary" size="small" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    }
                  >
                    Try a different name or status.
                  </EmptyState>
                ) : (
                  <EmptyState title="No resources yet">
                    Name your first resource above. It starts as a draft.
                  </EmptyState>
                )
              ) : (
                <div aria-busy={list.isPlaceholderData}>
                  <ColumnHeadings aria-hidden="true">
                    <span>Name</span>
                    <span>Modules</span>
                    <span>Status</span>
                    <span>Created</span>
                  </ColumnHeadings>
                  <Rows $stale={list.isPlaceholderData}>
                    {list.data.items.map((resource) => (
                      <ResourceRow key={resource._id} resource={resource} />
                    ))}
                  </Rows>
                </div>
              )}
            </Card>
            <PaginationBar
              {...list.data.pagination}
              itemCount={list.data.items.length}
              onPageChange={(page) => update({ page })}
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}

const ColumnHeadings = styled.div`
  display: grid;
  grid-template-columns: ${ROW_COLUMNS};
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkMuted};

  ${NARROW} {
    display: none;
  }
`

const Rows = styled.ul<{ $stale: boolean }>`
  list-style: none;
  margin: 0;
  padding: 0;
  opacity: ${({ $stale }) => ($stale ? 0.55 : 1)};
  transition: opacity 0.15s ease;
`
