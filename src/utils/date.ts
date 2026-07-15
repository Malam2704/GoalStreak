export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function moveDate(key: string, numberOfDays: number) {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + numberOfDays)
  return toDateKey(date)
}

export function formatDate(key: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(fromDateKey(key))
}

export const today = toDateKey(new Date())
