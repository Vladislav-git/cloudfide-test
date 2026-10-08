import styled from 'styled-components'
import { Button } from '../../design-system'

/** Design-system Button recoloured for irreversible actions (the design system has no danger variant). */
export const DangerButton = styled(Button)`
  background: ${({ theme }) => theme.colors.warning};
  border-color: ${({ theme }) => theme.colors.warning};
  color: #fff;

  &:hover:not(:disabled) {
    background: #96390f;
    border-color: #96390f;
    color: #fff;
  }
`
