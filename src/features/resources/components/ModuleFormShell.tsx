import { useEffect, type FormEventHandler, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card } from '../../../design-system'
import { LeaveGuard } from '../../../shared/form/LeaveGuard'
import { ButtonLink } from '../../../shared/ui/ButtonLink'
import { NARROW } from '../../../shared/ui/layout'
import { Notice } from '../../../shared/ui/Notice'

interface ModuleFormShellProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  isDirty: boolean
  isSubmitting: boolean
  isSubmitSuccessful: boolean
  serverError?: string
  submitLabel: string
  cancelTo: string
  /** Where to go once the submit handler resolves without errors. */
  successTo: string
  children: ReactNode
}

/** Shared chrome for module forms: card, server error, actions, leave guard, post-submit navigation. */
export function ModuleFormShell({
  onSubmit,
  isDirty,
  isSubmitting,
  isSubmitSuccessful,
  serverError,
  submitLabel,
  cancelTo,
  successTo,
  children,
}: ModuleFormShellProps) {
  const navigate = useNavigate()

  // Navigating from an effect (not inside the submit handler) lets the leave guard
  // see `isSubmitSuccessful` first, so a successful submit isn't treated as abandoning edits.
  useEffect(() => {
    if (isSubmitSuccessful) {
      navigate(successTo)
    }
  }, [isSubmitSuccessful, navigate, successTo])

  return (
    <form noValidate onSubmit={onSubmit}>
      <Card variant="elevated">
        {serverError ? (
          <Notice tone="error" title="Couldn't save">
            {serverError}
          </Notice>
        ) : null}
        <Fields>{children}</Fields>
        <Actions>
          <ButtonLink to={cancelTo} $variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </Actions>
      </Card>
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}

const Fields = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  ${NARROW} {
    flex-direction: column-reverse;

    & > * {
      width: 100%;
    }
  }
`
