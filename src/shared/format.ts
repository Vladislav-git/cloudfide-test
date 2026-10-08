// Fixed to match the interface language instead of the browser's locale.
const LOCALE = 'en-GB'

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const integerFormatter = new Intl.NumberFormat(LOCALE)

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** Budget is stored as a digit string; group it for reading. */
export function formatInteger(digits: string): string {
  return /^\d+$/.test(digits) ? integerFormatter.format(Number(digits)) : digits
}
