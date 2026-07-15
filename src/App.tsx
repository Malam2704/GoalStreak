import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import AddGoalForm from './components/AddGoalFormPanel'
import type { CheckIn, Habit, NewHabit } from './types'

const HABITS_KEY = 'goalstreak:v2:habits'
const CHECKINS_KEY = 'goalstreak:v2:checkins'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function move(key: string, days: number) {
  const date = fromKey(key)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const today = dateKey(new Date())
const seedDate = move(today, -120)
const seedHabits: Habit[] = [
  { id: 'meds', name: 'Taking medicine', icon: '💊', color: '#2563eb', schedule: 'daily', createdAt: seedDate },
  { id: 'gym', name: 'Gym days', icon: '🏋️', color: '#7c3aed', schedule: 'cycle', activeDays: 2, restDays: 1, createdAt: seedDate },
  { id: 'read', name: 'Reading', icon: '📚', color: '#059669', schedule: 'daily', createdAt: seedDate },
  { id: 'programming', name: 'Programming', icon: '✓', color: '#0891b2', schedule: 'weekly', weeklyTarget: 4, createdAt: seedDate },
]

function formatDate(key: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(fromKey(key))
}

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  completedDates: Set<string>
  color: string
}

function DatePicker({ value, onChange, completedDates, color }: DatePickerProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = fromKey(value)
    return new Date(selected.getFullYear(), selected.getMonth(), 1)
  })
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const leadingBlanks = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const canMoveForward = year < new Date().getFullYear() || month < new Date().getMonth()

  function changeMonth(amount: number) {
    setVisibleMonth(new Date(year, month + amount, 1))
  }

  return (
    <div className="date-picker" style={{ '--picker-color': color } as React.CSSProperties}>
      <div className="picker-heading">
        <button onClick={() => changeMonth(-1)} type="button" aria-label="Previous month">‹</button>
        <strong>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth)}</strong>
        <button disabled={!canMoveForward} onClick={() => changeMonth(1)} type="button" aria-label="Next month">›</button>
      </div>
      <div className="weekday-row">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="month-grid">
        {Array.from({ length: leadingBlanks }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const key = dateKey(new Date(year, month, index + 1))
          const isFuture = key > today
          return (
            <button
              className={`${key === value ? 'selected' : ''} ${completedDates.has(key) ? 'has-entry' : ''}`}
              disabled={isFuture}
              key={key}
              onClick={() => onChange(key)}
              type="button"
            >
              {index + 1}
            </button>
          )
        })}
      </div>
      <div className="picker-shortcuts">
        <button type="button" onClick={() => { onChange(move(today, -1)); setVisibleMonth(new Date(fromKey(move(today, -1)).getFullYear(), fromKey(move(today, -1)).getMonth(), 1)) }}>Yesterday</button>
        <button type="button" onClick={() => { onChange(today); setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) }}>Today</button>
      </div>
    </div>
  )
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => read(HABITS_KEY, seedHabits))
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => read(CHECKINS_KEY, []))
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [checkInHabitId, setCheckInHabitId] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState(today)
  const [note, setNote] = useState('')
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => localStorage.setItem(HABITS_KEY, JSON.stringify(habits)), [habits])
  useEffect(() => localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns)), [checkIns])

  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId)
  const checkInHabit = habits.find((habit) => habit.id === checkInHabitId)
  const calendarDays = useMemo(() => Array.from({ length: 371 }, (_, index) => move(today, index - 370)), [])
  const entries = useMemo(
    () => new Map(checkIns.map((entry) => [`${entry.habitId}:${entry.date}`, entry])),
    [checkIns],
  )

  function openCheckIn(habit: Habit, date = today) {
    const existing = entries.get(`${habit.id}:${date}`)
    setCheckInHabitId(habit.id)
    setCheckInDate(date)
    setNote(existing?.note ?? '')
  }

  function saveCheckIn(event: FormEvent) {
    event.preventDefault()
    if (!checkInHabitId || !checkInDate) return

    setCheckIns((current) => [
      ...current.filter((entry) => !(entry.habitId === checkInHabitId && entry.date === checkInDate)),
      { habitId: checkInHabitId, date: checkInDate, note: note.trim(), completedAt: new Date().toISOString() },
    ])
    setSelectedHabitId(checkInHabitId)
    setCheckInHabitId(null)
  }

  function removeCheckIn() {
    if (!checkInHabitId) return
    setCheckIns((current) => current.filter((entry) => !(entry.habitId === checkInHabitId && entry.date === checkInDate)))
    setCheckInHabitId(null)
  }

  function addHabit(input: NewHabit) {
    const habit = { ...input, id: crypto.randomUUID(), createdAt: today }
    setHabits((current) => [...current, habit])
    setShowGoalForm(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand-mark">G</div>
        <div><h1>GoalStreak</h1><p>A simple record of showing up.</p></div>
      </header>

      <section className="calendar-section" aria-labelledby="calendar-title">
        <div className="section-title">
          <div>
            <p className="eyebrow">Activity</p>
            <h2 id="calendar-title">{selectedHabit ? selectedHabit.name : 'Calendar'}</h2>
          </div>
          {selectedHabit && <span className="selected-key"><i style={{ background: selectedHabit.color }} />Completed days</span>}
        </div>

        <div className={`calendar-panel ${selectedHabit ? '' : 'calendar-empty'}`}>
          {selectedHabit ? (
            <>
              <div className="month-labels"><span>1 year ago</span><span>Today</span></div>
              <div className="heatmap-scroll">
                <div className="heatmap" aria-label={`${selectedHabit.name} activity over the last year`}>
                  {calendarDays.map((key) => {
                    const entry = entries.get(`${selectedHabit.id}:${key}`)
                    const tooltip = entry
                      ? `${formatDate(key)}${entry.note ? ` — ${entry.note}` : ' — Completed'}`
                      : `${formatDate(key)} — No entry`
                    return (
                      <button
                        aria-label={tooltip}
                        className={`heat-cell ${entry ? 'checked' : ''}`}
                        data-tooltip={tooltip}
                        key={key}
                        onClick={() => openCheckIn(selectedHabit, key)}
                        style={{ '--goal-color': selectedHabit.color } as React.CSSProperties}
                        type="button"
                      />
                    )
                  })}
                </div>
              </div>
              <p className="calendar-hint">Hover to see notes · Select any day to add or edit an entry</p>
            </>
          ) : (
            <div className="empty-message">
              <div className="empty-grid" aria-hidden="true">{Array.from({ length: 70 }, (_, i) => <i key={i} />)}</div>
              <p>Select a goal below to see its activity.</p>
            </div>
          )}
        </div>
      </section>

      <section className="goals-section" aria-labelledby="goals-title">
        <div className="section-title goals-title">
          <div><p className="eyebrow">Your list</p><h2 id="goals-title">Goals</h2></div>
          <button className="text-button" onClick={() => setShowGoalForm(true)} type="button">＋ New goal</button>
        </div>
        <div className="goal-list">
          {habits.map((habit) => (
            <div className={`goal-row ${selectedHabitId === habit.id ? 'selected' : ''}`} key={habit.id}>
              <button className="goal-select" onClick={() => setSelectedHabitId(habit.id)} type="button">
                <span className="goal-icon" style={{ background: `${habit.color}16`, color: habit.color }}>{habit.icon}</span>
                <span>{habit.name}</span>
              </button>
              <button className="add-entry" onClick={() => openCheckIn(habit)} aria-label={`Add ${habit.name} entry`} type="button">＋</button>
            </div>
          ))}
        </div>
      </section>

      {checkInHabit && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCheckInHabitId(null)}>
          <form className="entry-modal" onSubmit={saveCheckIn}>
            <div className="modal-heading"><div><p className="eyebrow">Check in</p><h2>{checkInHabit.name}</h2></div><button className="close-button" type="button" onClick={() => setCheckInHabitId(null)}>×</button></div>
            <div className="entry-form-body">
              <div className="field"><span>Date</span><DatePicker key={checkInHabit.id} value={checkInDate} color={checkInHabit.color} completedDates={new Set(checkIns.filter((entry) => entry.habitId === checkInHabit.id).map((entry) => entry.date))} onChange={(date) => { setCheckInDate(date); setNote(entries.get(`${checkInHabit.id}:${date}`)?.note ?? '') }} /></div>
              <label className="field notes-field"><span>Notes</span><textarea autoFocus value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bench press — 3 × 8 at 135 lb&#10;Squats — 3 × 10 at 185 lb&#10;Incline dumbbell press — 3 × 10" /></label>
            </div>
            <div className="modal-actions">{entries.has(`${checkInHabit.id}:${checkInDate}`) && <button className="button danger" onClick={removeCheckIn} type="button">Remove entry</button>}<span /><button className="button secondary" onClick={() => setCheckInHabitId(null)} type="button">Cancel</button><button className="button primary" type="submit">Save check-in</button></div>
          </form>
        </div>
      )}

      {showGoalForm && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowGoalForm(false)}><div className="goal-modal"><AddGoalForm onAdd={addHabit} onCancel={() => setShowGoalForm(false)} /></div></div>}
    </main>
  )
}

export default App
