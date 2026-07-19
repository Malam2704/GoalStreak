import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { CheckIn, Habit } from '../types'
import { formatDate, moveDate, today } from '../utils/date'

interface ActivityCalendarProps {
  selectedHabit?: Habit
  entries: Map<string, CheckIn>
  onSelectDate: (habit: Habit, date: string) => void
}

export default function ActivityCalendar({ selectedHabit, entries, onSelectDate }: ActivityCalendarProps) {
  const calendarDays = useMemo(
    () => Array.from({ length: 371 }, (_, index) => moveDate(today, index - 370)),
    [],
  )

  return (
    <section className="calendar-section" aria-labelledby="calendar-title">
      <div className="section-title">
        <div>
          <p className="eyebrow">Activity</p>
          <h2 id="calendar-title">{selectedHabit ? selectedHabit.name : 'Calendar'}</h2>
        </div>
        {selectedHabit && (
          <span className="selected-key">
            <i style={{ background: selectedHabit.color }} />
            Completed days
          </span>
        )}
      </div>

      <div className={`calendar-panel ${selectedHabit ? '' : 'calendar-empty'}`}>
        {selectedHabit ? (
          <>
            <div className="month-labels"><span>1 year ago</span><span>Today</span></div>
            <div className="heatmap-scroll">
              <div className="heatmap" aria-label={`${selectedHabit.name} activity over the last year`}>
                {calendarDays.map((date) => {
                  const entry = entries.get(`${selectedHabit.id}:${date}`)
                  const tooltip = entry
                    ? `${formatDate(date)}${entry.note ? ` — ${entry.note}` : ' — Completed'}`
                    : `${formatDate(date)} — No entry`

                  return (
                    <button
                      aria-label={tooltip}
                      className={`heat-cell ${entry ? 'checked' : ''}`}
                      data-tooltip={tooltip}
                      key={date}
                      onClick={() => onSelectDate(selectedHabit, date)}
                      style={{ '--goal-color': selectedHabit.color } as CSSProperties}
                      type="button"
                    />
                  )
                })}
              </div>
            </div>
            <p className="calendar-hint">Select any day to add or edit an entry</p>
          </>
        ) : (
          <div className="empty-message">
            <div className="empty-grid" aria-hidden="true">
              {Array.from({ length: 70 }, (_, index) => <i key={index} />)}
            </div>
            <p>Select a goal below to see its activity.</p>
          </div>
        )}
      </div>
    </section>
  )
}
