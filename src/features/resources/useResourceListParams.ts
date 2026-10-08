import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ResourceListParams, ResourceStatus, SortOrder } from './model/types'

export const PAGE_SIZE = 10

export interface ListFilters {
  page?: number
  status?: ResourceStatus
  name?: string
  sortOrder?: SortOrder
}

/**
 * List filters live in the URL (`?page=2&status=draft&name=foo&sort=asc`) so they survive
 * a refresh, can be shared, and come back when returning to the list.
 */
export function useResourceListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: ResourceListParams = {
    page: parsePage(searchParams.get('page')),
    pageSize: PAGE_SIZE,
    status: parseStatus(searchParams.get('status')),
    name: searchParams.get('name')?.trim() || undefined,
    sortOrder: searchParams.get('sort') === 'asc' ? 'asc' : 'desc',
  }

  /** Applies filter changes; anything other than a page change resets to page 1. */
  const update = useCallback(
    (changes: ListFilters) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const set = (key: string, value: string | undefined) =>
            value ? next.set(key, value) : next.delete(key)

          if ('status' in changes) set('status', changes.status)
          if ('name' in changes) set('name', changes.name?.trim())
          if ('sortOrder' in changes) {
            set('sort', changes.sortOrder === 'asc' ? 'asc' : undefined)
          }
          if ('page' in changes) {
            set(
              'page',
              changes.page && changes.page > 1 ? String(changes.page) : undefined,
            )
          } else {
            next.delete('page')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { params, update }
}

function parsePage(raw: string | null): number {
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parseStatus(raw: string | null): ResourceStatus | undefined {
  return raw === 'draft' || raw === 'completed' ? raw : undefined
}
