import { useState } from 'react'
import type { CSSProperties } from 'react'
import { fromDateKey, moveDate, toDateKey, today } from '../utils/date'

interface DatePickerProps {
  value: string
  completedDates: Set<string>
  color: string
  onChange: (date: string) => void
}

export default function DatePicker({ value, completedDates, color, onChange }: DatePickerProps) {
  const selectedDate = fromDateKey(value)
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const blankDays = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const currentDate = new Date()
  const canGoForward = year < currentDate.getFullYear() || month < currentDate.getMonth()

  function changeMonth(amount: number) {
    setVisibleMonth(new Date(year, month + amount, 1))
  }

  function selectShortcut(date: string) {
    const nextDate = fromDateKey(date)
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
    onChange(date)
  }

  return (
    <div className="date-picker" style={{ '--picker-color': color } as CSSProperties}>
      <div className="picker-heading">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
        <strong>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth)}</strong>
        <button type="button" disabled={!canGoForward} onClick={() => changeMonth(1)} aria-label="Next month">›</button>
      </div>

      <div className="weekday-row">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="month-grid">
        {Array.from({ length: blankDays }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = toDateKey(new Date(year, month, index + 1))
          const isSelected = date === value
          const hasEntry = completedDates.has(date)

          return (
            <button
              className={`${isSelected ? 'selected' : ''} ${hasEntry ? 'has-entry' : ''}`}
              disabled={date > today}
              key={date}
              onClick={() => onChange(date)}
              type="button"
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="picker-shortcuts">
        <button type="button" onClick={() => selectShortcut(moveDate(today, -1))}>Yesterday</button>
        <button type="button" onClick={() => selectShortcut(today)}>Today</button>
      </div>
    </div>
  )
}
