import { useBlocker } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Drawer } from '../../design-system'
import { usePageLeaveWarning } from '../hooks/usePageLeaveWarning'

interface LeaveGuardProps {
  /** Block navigation while true (e.g. the form has unsubmitted edits). */
  when: boolean
}

/** Confirms before in-app navigation or a page unload would throw away unsubmitted form edits. */
export function LeaveGuard({ when }: LeaveGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  )
  usePageLeaveWarning(when)

  const stay = () => {
    if (blocker.state === 'blocked') blocker.reset()
  }
  const leave = () => {
    if (blocker.state === 'blocked') blocker.proceed()
  }

  return (
    <Drawer
      title="Leave without applying?"
      isOpen={blocker.state === 'blocked'}
      onClose={stay}
    >
      <p>
        You have edits on this page that haven't been applied. Leaving now discards them.
      </p>
      <Actions>
        <Button variant="secondary" onClick={stay}>
          Keep editing
        </Button>
        <Button onClick={leave}>Discard edits</Button>
      </Actions>
    </Drawer>
  )
}

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`
