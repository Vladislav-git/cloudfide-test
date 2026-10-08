import { useState } from 'react'
import { Button } from '../../../design-system'
import { getErrorMessage } from '../../../api/client'
import { DangerButton } from '../../../shared/ui/DangerButton'
import { Stack } from '../../../shared/ui/layout'
import { Notice } from '../../../shared/ui/Notice'
import { MODULE_LABELS } from '../model/options'
import type { ModuleKey } from '../model/types'

interface PendingChangesPanelProps {
  editedModules: ModuleKey[]
  isSaving: boolean
  saveError: unknown
  onSave: () => void
  onDiscard: () => void
}

/** Review point for a completed resource's staged edits: one PUT saves them all. */
export function PendingChangesPanel({
  editedModules,
  isSaving,
  saveError,
  onSave,
  onDiscard,
}: PendingChangesPanelProps) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const moduleList = editedModules.map((module) => MODULE_LABELS[module]).join(' and ')

  return (
    <Stack $gap="sm">
      <Notice
        tone="pending"
        title={`Unsaved changes to ${moduleList}`}
        actions={
          confirmingDiscard ? (
            <>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setConfirmingDiscard(false)}
              >
                Keep changes
              </Button>
              <DangerButton size="small" onClick={onDiscard}>
                Discard changes
              </DangerButton>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="small"
                disabled={isSaving}
                onClick={() => setConfirmingDiscard(true)}
              >
                Discard
              </Button>
              <Button size="small" disabled={isSaving} onClick={onSave}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )
        }
      >
        {confirmingDiscard
          ? 'Discard all unsaved changes? The resource keeps its last saved values.'
          : 'These edits live only in this tab until you save them. Refreshing or closing the tab discards them.'}
      </Notice>
      {saveError ? (
        <Notice tone="error" title="Couldn't save changes">
          {getErrorMessage(saveError)} Your edits are still here.
        </Notice>
      ) : null}
    </Stack>
  )
}
