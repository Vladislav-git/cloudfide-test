import { Button } from '../../../design-system'
import { Notice } from '../../../shared/ui/Notice'

interface CompletedEditNoticeProps {
  hasStagedEdits: boolean
  onRevert: () => void
}

/** Explains the completed-resource edit flow above a module form. */
export function CompletedEditNotice({
  hasStagedEdits,
  onRevert,
}: CompletedEditNoticeProps) {
  if (hasStagedEdits) {
    return (
      <Notice
        tone="pending"
        title="Showing your unsaved changes"
        actions={
          <Button variant="secondary" size="small" onClick={onRevert}>
            Revert to saved
          </Button>
        }
      >
        Applied edits stay in this tab until you save them on the overview.
      </Notice>
    )
  }
  return (
    <Notice tone="info" title="This resource is completed">
      Changes you apply here aren't saved right away. Review and save them on the
      overview. Refreshing or closing the tab discards them.
    </Notice>
  )
}
