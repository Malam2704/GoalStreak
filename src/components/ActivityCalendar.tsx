import { cloneElement } from 'react'
import { ActivityCalendar as CalendarHeatmap } from 'react-activity-calendar'
import type { CheckIn, Habit } from '../types'
import { formatDate, moveDate, today } from '../utils/date'

interface ActivityCalendarProps {
  selectedHabit?: Habit
  entries: Map<string, CheckIn>
  onSelectDate: (habit: Habit, date: string) => void
}

function calendarData(habitId: string, entries: Map<string, CheckIn>) {
  const start = moveDate(today, -364)
  const days = new Map([
    [start, { date: start, count: 0, level: 0 }],
    [today, { date: today, count: 0, level: 0 }],
  ])

  for (const entry of entries.values()) {
    if (entry.habitId === habitId && entry.date >= start && entry.date <= today) {
      days.set(entry.date, { date: entry.date, count: 1, level: 1 })
    }
  }

  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export default function ActivityCalendar({ selectedHabit, entries, onSelectDate }: ActivityCalendarProps) {

  return (
    <section className="calendar-section" aria-labelledby="calendar-title">
      <div className="section-title">
        <div>
          <p className="eyebrow">Activity</p>
          <h2 id="calendar-title">{selectedHabit ? selectedHabit.name : 'Calendar'}</h2>
        </div>
      </div>

      <div className={`calendar-panel ${selectedHabit ? '' : 'calendar-empty'}`}>
        {selectedHabit ? (
          <>
            <CalendarHeatmap
              blockMargin={5}
              blockRadius={3}
              blockSize={13}
              colorScheme="light"
              data={calendarData(selectedHabit.id, entries)}
              maxLevel={1}
              renderBlock={(block, day) => cloneElement(block, {
                'aria-label': `${formatDate(day.date)} — ${day.count ? 'Completed' : 'No entry'}`,
                onClick: () => onSelectDate(selectedHabit, day.date),
                style: { cursor: 'pointer' },
              })}
              showColorLegend={false}
              showTotalCount={false}
              theme={{ light: ['#edf0f4', selectedHabit.color] }}
            />
            <p className="calendar-hint">Select any day to add or edit an entry</p>
          </>
        ) : (
          <p className="empty-message">Select a goal to see its activity.</p>
        )}
      </div>
    </section>
  )
}
