import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card } from '../../../design-system'
import { ApiError, getErrorMessage } from '../../../api/client'
import { TextField } from '../../../shared/form/fields'
import { NARROW } from '../../../shared/ui/layout'
import { createResourceSchema, type CreateResourceValues } from '../model/schemas'
import { resourcePaths } from '../paths'
import { useCreateResource } from '../queries'

const NAME_FIELD_ID = 'new-resource-name'

export function CreateResourceForm() {
  const navigate = useNavigate()
  const createResource = useCreateResource()
  const { control, handleSubmit, setError, formState } = useForm<CreateResourceValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: { resourceName: '' },
  })

  const submit = handleSubmit(async ({ resourceName }) => {
    try {
      const resource = await createResource.mutateAsync(resourceName)
      navigate(resourcePaths.overview(resource.resourceId))
    } catch (error) {
      setError('resourceName', { message: describeCreateError(error) })
    }
  })

  return (
    <Card variant="elevated">
      <form noValidate onSubmit={submit}>
        <Layout>
          <Heading>
            <Label htmlFor={NAME_FIELD_ID}>New resource</Label>
          </Heading>
          <TextField
            control={control}
            name="resourceName"
            id={NAME_FIELD_ID}
            placeholder="e.g. Customer onboarding portal"
            autoComplete="off"
            helperText="Letters, numbers, spaces, and hyphens. The name can't be changed later."
          />
          <Button type="submit" size="large" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Creating…' : 'Create resource'}
          </Button>
        </Layout>
      </form>
    </Card>
  )
}

function describeCreateError(error: unknown): string {
  if (error instanceof ApiError && /unique/i.test(error.message)) {
    return 'A resource with this name already exists. Choose a different name.'
  }
  return getErrorMessage(error)
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'heading heading'
    'field action';
  gap: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  align-items: start;

  & > :nth-child(2) {
    grid-area: field;
  }

  & > button {
    grid-area: action;
  }

  ${NARROW} {
    grid-template-columns: 1fr;
    grid-template-areas: 'heading' 'field' 'action';
  }
`

const Heading = styled.div`
  grid-area: heading;
`

const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`
