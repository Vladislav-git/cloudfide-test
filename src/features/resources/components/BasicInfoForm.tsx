import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Input } from '../../../design-system'
import { getErrorMessage } from '../../../api/client'
import { SelectField, TextField } from '../../../shared/form/fields'
import { PRIORITY_LABELS, toSelectOptions } from '../model/options'
import { basicInfoFormSchema, type BasicInfoFormValues } from '../model/schemas'
import { FieldGrid } from '../../../shared/form/FieldGrid'
import { ModuleFormShell } from './ModuleFormShell'

const PRIORITY_OPTIONS = toSelectOptions(PRIORITY_LABELS, 'Choose a priority')
const DESCRIPTION_LIMIT = 1000

interface BasicInfoFormProps {
  lockedName: string
  defaultValues: BasicInfoFormValues
  submitLabel: string
  cancelTo: string
  successTo: string
  /** Persist (draft) or stage (completed) the values; throw to show a server error. */
  onSubmit: (values: BasicInfoFormValues) => Promise<unknown> | void
}

export function BasicInfoForm({
  lockedName,
  defaultValues,
  submitLabel,
  cancelTo,
  successTo,
  onSubmit,
}: BasicInfoFormProps) {
  const { control, handleSubmit, setError, formState } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoFormSchema),
    defaultValues,
  })
  const description = useWatch({ control, name: 'description' })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) })
    }
  })

  return (
    <ModuleFormShell
      onSubmit={submit}
      isDirty={formState.isDirty}
      isSubmitting={formState.isSubmitting}
      isSubmitSuccessful={formState.isSubmitSuccessful}
      serverError={formState.errors.root?.server?.message}
      submitLabel={submitLabel}
      cancelTo={cancelTo}
      successTo={successTo}
    >
      <Input
        label="Resource name"
        value={lockedName}
        state="locked"
        tooltip="The name is set when the resource is created and can't be changed."
      />
      <FieldGrid>
        <TextField control={control} name="owner" label="Owner" autoComplete="name" />
        <TextField
          control={control}
          name="email"
          label="Contact email"
          type="email"
          autoComplete="email"
        />
      </FieldGrid>
      <SelectField
        control={control}
        name="priority"
        label="Priority"
        options={PRIORITY_OPTIONS}
      />
      <TextField
        control={control}
        name="description"
        label="Description"
        multiline
        rows={5}
        helperText={`${description.length} of ${DESCRIPTION_LIMIT} characters`}
      />
    </ModuleFormShell>
  )
}
