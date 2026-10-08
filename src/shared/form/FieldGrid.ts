import styled from 'styled-components'
import { NARROW } from '../ui/layout'

/** Two form columns on wide screens, one on narrow ones. */
export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  /* Without this, a field with helper/error text stretches its neighbour's label and control. */
  align-items: start;

  ${NARROW} {
    grid-template-columns: 1fr;
  }
`
