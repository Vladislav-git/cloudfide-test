import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { ButtonSize, ButtonVariant } from '../../design-system'
import {
  buttonSizeStyles,
  buttonVariantStyles,
} from '../../design-system/components/Button/Button.variants'

interface ButtonLinkStyleProps {
  $variant?: ButtonVariant
  $size?: ButtonSize
}

/**
 * Router link that looks like the design-system Button. Navigation stays an `<a>`
 * (middle-click, open in new tab) while sharing the Button's variant/size styles.
 */
export const ButtonLink = styled(Link)<ButtonLinkStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid transparent;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;

  ${({ $variant = 'primary' }) => buttonVariantStyles[$variant]}
  ${({ $size = 'medium' }) => buttonSizeStyles[$size]}
`
