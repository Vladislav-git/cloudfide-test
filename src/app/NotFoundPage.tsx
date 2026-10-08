import { ButtonLink } from '../shared/ui/ButtonLink'
import { Lead, PageTitle, Stack } from '../shared/ui/layout'

export function NotFoundPage() {
  return (
    <Stack $gap="lg">
      <PageTitle>Page not found</PageTitle>
      <Lead>
        There's nothing at this address. Check the link or start from the resources list.
      </Lead>
      <div>
        <ButtonLink to="/resources">Go to resources</ButtonLink>
      </div>
    </Stack>
  )
}
