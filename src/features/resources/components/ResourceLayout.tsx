import { Outlet, useParams } from 'react-router-dom'
import { isMissingResourceError } from '../../../api/client'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { Lead, PageTitle, Stack } from '../../../shared/ui/layout'
import { ErrorState, LoadingState } from '../../../shared/ui/StateMessage'
import { useResource } from '../queries'
import type { ResourceOutletContext } from '../resourceOutlet'
import { ResourceHeader } from './ResourceHeader'

/** Loads the resource once for all `/resources/:resourceId/*` pages and handles missing ids. */
export function ResourceLayout() {
  const { resourceId = '' } = useParams()
  const query = useResource(resourceId)

  if (query.isPending) {
    return <LoadingState label="Loading resource…" />
  }

  if (query.isError) {
    if (isMissingResourceError(query.error)) {
      return (
        <Stack $gap="lg">
          <PageTitle>Resource not found</PageTitle>
          <Lead>
            There's no resource with the id “{resourceId}”. It may have been deleted.
          </Lead>
          <div>
            <ButtonLink to="/resources">Back to resources</ButtonLink>
          </div>
        </Stack>
      )
    }
    return (
      <ErrorState
        title="Couldn't load this resource"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const context: ResourceOutletContext = { resource: query.data, resourceKey: resourceId }

  return (
    <Stack $gap="xl">
      <ResourceHeader resource={query.data} resourceKey={resourceId} />
      {/* Keyed so module forms re-initialise when switching between resources. */}
      <Outlet key={query.data.resourceId} context={context} />
    </Stack>
  )
}
