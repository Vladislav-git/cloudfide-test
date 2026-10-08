import { useOutletContext } from 'react-router-dom'
import type { Resource } from './model/types'

export interface ResourceOutletContext {
  resource: Resource
  /** The `:resourceId` route param; also the detail query key and API id. */
  resourceKey: string
}

/** Loaded resource provided by `ResourceLayout` to its child routes. */
export function useResourceOutlet() {
  return useOutletContext<ResourceOutletContext>()
}
