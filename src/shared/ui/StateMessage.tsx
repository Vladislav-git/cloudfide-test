import type { ReactNode } from 'react'
import styled from 'styled-components'
import { Button } from '../../design-system'
import { getErrorMessage } from '../../api/client'
import { Notice } from './Notice'

export function LoadingState({ label }: { label: string }) {
  return (
    <Centered role="status" aria-live="polite">
      <Spinner aria-hidden="true" />
      {label}
    </Centered>
  )
}

interface ErrorStateProps {
  title: string
  error: unknown
  onRetry?: () => void
}

export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  return (
    <Notice
      tone="error"
      title={title}
      actions={
        onRetry ? (
          <Button variant="secondary" size="small" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    >
      {getErrorMessage(error)}
    </Notice>
  )
}

interface EmptyStateProps {
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyTitle>{title}</EmptyTitle>
      {children ? <p>{children}</p> : null}
      {action}
    </Empty>
  )
}

const Centered = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2.4s;
  }
`

const Empty = styled.div`
  display: grid;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  color: ${({ theme }) => theme.colors.inkMuted};
`

const EmptyTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
`
