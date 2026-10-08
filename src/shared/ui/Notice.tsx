import type { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { NARROW } from './layout'

export type NoticeTone = 'info' | 'success' | 'error' | 'pending'

interface NoticeProps {
  tone: NoticeTone
  title?: string
  children?: ReactNode
  actions?: ReactNode
}

/** Inline page-level message. Errors are announced assertively, the rest politely. */
export function Notice({ tone, title, children, actions }: NoticeProps) {
  return (
    <Box $tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <Body>
        {title ? <Title>{title}</Title> : null}
        {children ? <Text>{children}</Text> : null}
      </Body>
      {actions ? <Actions>{actions}</Actions> : null}
    </Box>
  )
}

const toneStyles: Record<NoticeTone, ReturnType<typeof css>> = {
  info: css`
    background: rgba(60, 90, 137, 0.08);
    border-color: rgba(60, 90, 137, 0.28);
  `,
  success: css`
    background: rgba(46, 139, 87, 0.09);
    border-color: rgba(46, 139, 87, 0.32);
  `,
  error: css`
    background: rgba(180, 71, 27, 0.08);
    border-color: rgba(180, 71, 27, 0.35);
  `,
  pending: css`
    background: ${({ theme }) => theme.colors.accentSoft};
    border-color: rgba(227, 139, 44, 0.55);
  `,
}

const Box = styled.div<{ $tone: NoticeTone }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border: 1px solid;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.inkStrong};

  ${({ $tone }) => toneStyles[$tone]}

  ${NARROW} {
    flex-direction: column;
    align-items: stretch;
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const Body = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const Title = styled.strong`
  font-weight: 600;
`

const Text = styled.div`
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.ink};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
`
