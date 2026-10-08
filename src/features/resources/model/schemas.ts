import { z } from 'zod'
import { CATEGORY_VALUES, PRIORITY_VALUES, TEAM_MEMBER_OPTIONS } from './options'

// Patterns and limits are copied from backend/src/modules/resources/resource.service.ts
// so invalid input is caught before a request is made.
const NAME_PATTERN = /^[A-Za-z0-9 -]+$/
const OWNER_PATTERN = /^[A-Za-z ]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INTEGER_PATTERN = /^\d+$/

const NAME_PATTERN_MESSAGE = 'Use only letters, numbers, spaces, and hyphens.'

export const resourceNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter a resource name.')
  .max(255, 'Use 255 characters or fewer.')
  .regex(NAME_PATTERN, NAME_PATTERN_MESSAGE)

export const createResourceSchema = z.object({
  resourceName: resourceNameSchema,
})

export type CreateResourceValues = z.infer<typeof createResourceSchema>

/** Basic Info fields the user can edit; `resourceName` is locked and added on submit. */
export const basicInfoFormSchema = z.object({
  owner: z
    .string()
    .trim()
    .min(1, "Enter the owner's name.")
    .max(255, 'Use 255 characters or fewer.')
    .regex(OWNER_PATTERN, 'Use only letters and spaces.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address.')
    .regex(EMAIL_PATTERN, 'Enter an email address like name@example.com.'),
  description: z
    .string()
    .trim()
    .min(1, 'Enter a description.')
    .max(1000, 'Use 1000 characters or fewer.'),
  priority: z
    .string()
    .refine((value) => PRIORITY_VALUES.includes(value), 'Choose a priority.'),
})

export type BasicInfoFormValues = z.infer<typeof basicInfoFormSchema>

export const projectDetailsSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Enter a project name.')
    .max(255, 'Use 255 characters or fewer.')
    .regex(NAME_PATTERN, NAME_PATTERN_MESSAGE),
  budget: z
    .string()
    .trim()
    .min(1, 'Enter a budget.')
    .regex(INTEGER_PATTERN, 'Use whole numbers only, without symbols or separators.'),
  category: z
    .string()
    .refine((value) => CATEGORY_VALUES.includes(value), 'Choose a category.'),
  options: z
    .array(z.string())
    .min(1, 'Select at least one team member.')
    .refine(
      (values) => values.every((value) => TEAM_MEMBER_OPTIONS.includes(value)),
      'Select team members from the list.',
    ),
})

export type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>
