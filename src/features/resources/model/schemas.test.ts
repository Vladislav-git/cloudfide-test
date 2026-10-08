import { describe, expect, it } from 'vitest'
import { basicInfoFormSchema, projectDetailsSchema, resourceNameSchema } from './schemas'

const VALID_BASIC_INFO = {
  owner: 'Ada Lovelace',
  email: 'ada@example.com',
  description: 'Self-service portal for new customers.',
  priority: 'medium',
}

const VALID_PROJECT_DETAILS = {
  projectName: 'Portal v1',
  budget: '25000',
  category: 'vendor',
  options: ['BE devs'],
}

function firstError(result: {
  success: boolean
  error?: { issues: { message: string }[] }
}) {
  return result.success ? undefined : result.error?.issues[0]?.message
}

describe('resourceNameSchema', () => {
  it('accepts letters, numbers, spaces, and hyphens, and trims', () => {
    expect(resourceNameSchema.parse('  Portal-2 beta ')).toBe('Portal-2 beta')
  })

  it.each([
    ['', 'Enter a resource name.'],
    ['   ', 'Enter a resource name.'],
    ['Portal_2', 'Use only letters, numbers, spaces, and hyphens.'],
    ['a'.repeat(256), 'Use 255 characters or fewer.'],
  ])('rejects %j', (value, message) => {
    expect(firstError(resourceNameSchema.safeParse(value))).toBe(message)
  })
})

describe('basicInfoFormSchema', () => {
  it('accepts a complete, valid module', () => {
    expect(basicInfoFormSchema.safeParse(VALID_BASIC_INFO).success).toBe(true)
  })

  it.each([
    ['owner', 'Ada 2', 'Use only letters and spaces.'],
    ['email', 'ada@example', 'Enter an email address like name@example.com.'],
    ['email', '', 'Enter an email address.'],
    ['description', 'x'.repeat(1001), 'Use 1000 characters or fewer.'],
    ['priority', '', 'Choose a priority.'],
    ['priority', 'urgent', 'Choose a priority.'],
  ])('rejects %s = %j', (field, value, message) => {
    const result = basicInfoFormSchema.safeParse({ ...VALID_BASIC_INFO, [field]: value })
    expect(firstError(result)).toBe(message)
  })
})

describe('projectDetailsSchema', () => {
  it('accepts a complete, valid module', () => {
    expect(projectDetailsSchema.safeParse(VALID_PROJECT_DETAILS).success).toBe(true)
  })

  it.each([
    ['budget', '12.5', 'Use whole numbers only, without symbols or separators.'],
    ['budget', '1,000', 'Use whole numbers only, without symbols or separators.'],
    ['budget', '', 'Enter a budget.'],
    ['category', 'partner', 'Choose a category.'],
    ['options', [], 'Select at least one team member.'],
    ['options', ['Astronaut'], 'Select team members from the list.'],
    ['projectName', 'Portal/v1', 'Use only letters, numbers, spaces, and hyphens.'],
  ])('rejects %s = %j', (field, value, message) => {
    const result = projectDetailsSchema.safeParse({
      ...VALID_PROJECT_DETAILS,
      [field]: value,
    })
    expect(firstError(result)).toBe(message)
  })
})
