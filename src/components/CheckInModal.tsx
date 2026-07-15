import type { FormEvent } from 'react'
import DatePicker from './DatePicker'
import type { Habit } from '../types'

interface CheckInModalProps {
  habit: Habit
  date: string
  note: string
  completedDates: Set<string>
  hasEntry: boolean
  onCancel: () => void
  onDateChange: (date: string) => void
  onNoteChange: (note: string) => void
  onRemove: () => void
  onSave: (event: FormEvent) => void
}

export default function CheckInModal({
  habit,
  date,
  note,
  completedDates,
  hasEntry,
  onCancel,
  onDateChange,
  onNoteChange,
  onRemove,
  onSave,
}: CheckInModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <form className="entry-modal" onSubmit={onSave}>
        <div className="modal-heading">
          <div><p className="eyebrow">Check in</p><h2>{habit.name}</h2></div>
          <button className="close-button" type="button" onClick={onCancel}>×</button>
        </div>

        <div className="entry-form-body">
          <div className="field">
            <span>Date</span>
            <DatePicker
              color={habit.color}
              completedDates={completedDates}
              onChange={onDateChange}
              value={date}
            />
          </div>

          <label className="field notes-field">
            <span>Notes</span>
            <textarea
              autoFocus
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={'Bench press — 3 × 8 at 135 lb\nSquats — 3 × 10 at 185 lb'}
            />
          </label>
        </div>

        <div className="modal-actions">
          {hasEntry && <button className="button danger" onClick={onRemove} type="button">Remove entry</button>}
          <span />
          <button className="button secondary" onClick={onCancel} type="button">Cancel</button>
          <button className="button primary" type="submit">Save check-in</button>
        </div>
      </form>
    </div>
  )
}
