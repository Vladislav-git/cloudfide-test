import { Badge } from '../../../design-system'
import { STATUS_LABELS } from '../model/options'
import type { ResourceStatus } from '../model/types'

export function StatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <Badge variant={status === 'completed' ? 'success' : 'info'}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
