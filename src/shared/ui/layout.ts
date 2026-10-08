import styled from 'styled-components'
import type { Theme } from '../../design-system/theme/theme'

export const NARROW = '@media (max-width: 720px)'

type Spacing = keyof Theme['spacing']

export const PageTitle = styled.h1`
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;

  ${NARROW} {
    font-size: 1.6rem;
  }
`

export const SectionTitle = styled.h2`
  font-size: 1.2rem;
  line-height: 1.3;
  font-weight: 600;
`

export const Lead = styled.p`
  max-width: 62ch;
  font-size: 1.05rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const Stack = styled.div<{ $gap?: Spacing }>`
  display: grid;
  gap: ${({ theme, $gap = 'md' }) => theme.spacing[$gap]};
  align-content: start;
`

export const Row = styled.div<{ $justify?: 'start' | 'end' | 'space-between' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: ${({ $justify = 'start' }) => $justify};
`
