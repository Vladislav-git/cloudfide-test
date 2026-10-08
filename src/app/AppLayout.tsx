import { Link, Outlet, useRouteError } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonLink } from '../shared/ui/ButtonLink'
import { Notice } from '../shared/ui/Notice'
import { NARROW } from '../shared/ui/layout'

export function AppLayout() {
  return (
    <Shell>
      <TopBar>
        <TopBarInner>
          <Wordmark to="/resources">
            <Mark aria-hidden="true" />
            Resource manager
          </Wordmark>
        </TopBarInner>
      </TopBar>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

/** Last-resort boundary for render errors inside any route. */
export function RouteErrorPage() {
  const error = useRouteError()
  console.error(error)
  return (
    <Shell>
      <Main>
        <Notice
          tone="error"
          title="This page failed to load"
          actions={
            <ButtonLink to="/resources" $variant="secondary" $size="small" reloadDocument>
              Go to resources
            </ButtonLink>
          }
        >
          Reload the page or go back to the resources list.
        </Notice>
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  min-height: 100vh;

  a:focus-visible,
  button:focus-visible,
  [tabindex]:focus-visible {
    outline: 3px solid rgba(31, 122, 140, 0.45);
    outline-offset: 2px;
  }
`

const TopBar = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.6);
`

const TopBarInner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};

  ${NARROW} {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  }
`

const Wordmark = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: ${({ theme }) => theme.typography.heading};
  font-weight: 600;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

/** Two stacked bars echo the app's two-module structure. */
const Mark = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background:
    linear-gradient(
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.primary}
      )
      top / 100% 7px no-repeat,
    linear-gradient(
        ${({ theme }) => theme.colors.accent},
        ${({ theme }) => theme.colors.accent}
      )
      bottom / 100% 7px no-repeat;
`

const Main = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: ${({ theme }) =>
    `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xxl}`};

  ${NARROW} {
    padding: ${({ theme }) =>
      `${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.xxl}`};
  }
`
