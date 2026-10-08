import {
  Controller,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form'
import styled from 'styled-components'
import {
  CheckboxGroup,
  Input,
  Select,
  type CheckboxGroupProps,
  type InputProps,
  type SelectProps,
} from '../../design-system'

// Thin adapters between react-hook-form and the design-system controls.
// The design-system components don't forward refs, so they are wired through Controller.

type ControlledProps = 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error'

interface TextFieldProps<T extends FieldValues> extends Omit<
  InputProps,
  ControlledProps
> {
  control: Control<T>
  name: FieldPathByValue<T, string>
}

export function TextField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...inputProps}
          name={field.name}
          value={field.value as string}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

interface SelectFieldProps<T extends FieldValues> extends Omit<
  SelectProps,
  ControlledProps
> {
  control: Control<T>
  name: FieldPathByValue<T, string>
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  ...selectProps
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          {...selectProps}
          name={field.name}
          value={field.value as string}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

interface CheckboxGroupFieldProps<T extends FieldValues> extends Omit<
  CheckboxGroupProps,
  'value' | 'onChange' | 'error'
> {
  control: Control<T>
  name: FieldPathByValue<T, string[]>
}

export function CheckboxGroupField<T extends FieldValues>({
  control,
  name,
  ...groupProps
}: CheckboxGroupFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ClickableBoxes>
          <CheckboxGroup
            {...groupProps}
            value={field.value as string[]}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        </ClickableBoxes>
      )}
    />
  )
}

/**
 * Workaround for the design-system Checkbox (which can't be modified): its visual box is a
 * `<span>` outside the `<label>`, painted over the invisible 13px native input, so clicking
 * the box did nothing. Stretch the invisible input over the 18px box and lift it on top.
 */
const ClickableBoxes = styled.div`
  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin: 0;
    z-index: 1;
    cursor: pointer;
  }

  input[type='checkbox']:disabled {
    cursor: not-allowed;
  }

  label {
    cursor: pointer;
  }
`
