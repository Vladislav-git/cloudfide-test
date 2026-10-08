import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../../api/client'
import { CheckboxGroupField, SelectField, TextField } from '../../../shared/form/fields'
import { CATEGORY_LABELS, TEAM_MEMBER_OPTIONS, toSelectOptions } from '../model/options'
import { projectDetailsSchema, type ProjectDetailsFormValues } from '../model/schemas'
import { FieldGrid } from '../../../shared/form/FieldGrid'
import { ModuleFormShell } from './ModuleFormShell'

const CATEGORY_OPTIONS = toSelectOptions(CATEGORY_LABELS, 'Choose a category')

interface ProjectDetailsFormProps {
  defaultValues: ProjectDetailsFormValues
  submitLabel: string
  cancelTo: string
  successTo: string
  /** Persist (draft) or stage (completed) the values; throw to show a server error. */
  onSubmit: (values: ProjectDetailsFormValues) => Promise<unknown> | void
}

export function ProjectDetailsForm({
  defaultValues,
  submitLabel,
  cancelTo,
  successTo,
  onSubmit,
}: ProjectDetailsFormProps) {
  const { control, handleSubmit, setError, formState } =
    useForm<ProjectDetailsFormValues>({
      resolver: zodResolver(projectDetailsSchema),
      defaultValues,
    })

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
      <TextField control={control} name="projectName" label="Project name" />
      <FieldGrid>
        <TextField
          control={control}
          name="budget"
          label="Budget"
          inputMode="numeric"
          helperText="Whole number, without currency symbols or separators."
        />
        <SelectField
          control={control}
          name="category"
          label="Category"
          options={CATEGORY_OPTIONS}
        />
      </FieldGrid>
      <CheckboxGroupField
        control={control}
        name="options"
        label="Team members needed"
        tooltip="Select every role this project needs."
        options={TEAM_MEMBER_OPTIONS}
      />
    </ModuleFormShell>
  )
}
