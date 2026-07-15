import { useEffect, useMemo, useState } from 'react'
import './App.css'
import AddGoalForm from './components/AddGoalFormPanel'
import type { CheckIn, Habit, NewHabit } from './types'

const HABITS_KEY = 'goalstreak:v2:habits'
const CHECKINS_KEY = 'goalstreak:v2:checkins'
const today = dateKey(new Date())

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function fromKey(key: string) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d) }
function move(key: string, days: number) { const date = fromKey(key); date.setDate(date.getDate() + days); return dateKey(date) }
function daysBetween(a: string, b: string) { return Math.floor((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000) }
function read<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback } }

const seedDate = move(today, -35)
const seedHabits: Habit[] = [
  { id: 'meds', name: 'Take medication', icon: '💊', color: '#2563eb', schedule: 'daily', createdAt: seedDate },
  { id: 'creatine', name: 'Take creatine', icon: '💧', color: '#0891b2', schedule: 'daily', createdAt: seedDate },
  { id: 'gym', name: 'Go to the gym', icon: '🏋️', color: '#7c3aed', schedule: 'cycle', activeDays: 2, restDays: 1, createdAt: seedDate },
  { id: 'read', name: 'Read', icon: '📚', color: '#059669', schedule: 'daily', createdAt: seedDate },
]

function scheduleText(habit: Habit) {
  if (habit.schedule === 'daily') return 'Every day'
  if (habit.schedule === 'weekly') return `${habit.weeklyTarget}× per week`
  return `${habit.activeDays} days on, ${habit.restDays} day${habit.restDays === 1 ? '' : 's'} rest`
}

function isDue(habit: Habit, key: string) {
  if (key < habit.createdAt) return false
  if (habit.schedule !== 'cycle') return true
  const cycle = (habit.activeDays ?? 1) + (habit.restDays ?? 1)
  return daysBetween(habit.createdAt, key) % cycle < (habit.activeDays ?? 1)
}

function currentStreak(habit: Habit, lookup: Set<string>) {
  let key = today
  let count = 0
  while (key >= habit.createdAt) {
    if (!isDue(habit, key)) { key = move(key, -1); continue }
    if (!lookup.has(`${habit.id}:${key}`)) break
    count++; key = move(key, -1)
  }
  return count
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => read(HABITS_KEY, seedHabits))
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => read(CHECKINS_KEY, []))
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedHabitId, setSelectedHabitId] = useState(() => habits[0]?.id ?? '')
  const [showForm, setShowForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => localStorage.setItem(HABITS_KEY, JSON.stringify(habits)), [habits])
  useEffect(() => localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns)), [checkIns])

  const lookup = useMemo(() => new Set(checkIns.map((item) => `${item.habitId}:${item.date}`)), [checkIns])
  const selectedHabit = habits.find((item) => item.id === selectedHabitId) ?? habits[0]
  const calendarDays = useMemo(() => Array.from({ length: 98 }, (_, i) => move(today, i - 97)), [])
  const dayHabits = habits.filter((habit) => habit.createdAt <= selectedDate)
  const dueToday = habits.filter((habit) => isDue(habit, today))
  const doneToday = dueToday.filter((habit) => lookup.has(`${habit.id}:${today}`)).length
  const totalCheckIns = selectedHabit ? checkIns.filter((item) => item.habitId === selectedHabit.id).length : 0

  function toggle(habitId: string, key = selectedDate) {
    const token = `${habitId}:${key}`
    setCheckIns((current) => lookup.has(token)
      ? current.filter((item) => `${item.habitId}:${item.date}` !== token)
      : [...current, { habitId, date: key, completedAt: new Date().toISOString() }])
  }
  function addHabit(input: NewHabit) {
    const habit = { ...input, id: crypto.randomUUID(), createdAt: today }
    setHabits((current) => [...current, habit]); setSelectedHabitId(habit.id); setShowForm(false)
  }
  function deleteHabit() {
    if (!selectedHabit || !window.confirm(`Delete “${selectedHabit.name}” and its history?`)) return
    setHabits((current) => current.filter((item) => item.id !== selectedHabit.id))
    setCheckIns((current) => current.filter((item) => item.habitId !== selectedHabit.id))
    setSelectedHabitId(habits.find((item) => item.id !== selectedHabit.id)?.id ?? '')
    setMenuOpen(false)
  }

  const dateTitle = selectedDate === today ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'long' }).format(fromKey(selectedDate))
  const dateSubtitle = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(fromKey(selectedDate))

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">G</div><span>GoalStreak</span></div>
        <nav>
          <button className="nav-item active"><span>⌂</span>Today</button>
          <a className="nav-item" href="#history"><span>▦</span>History</a>
        </nav>
        <div className="streak-nav">
          <div className="nav-label"><span>My streaks</span><button onClick={() => setShowForm(true)} aria-label="Add streak">+</button></div>
          {habits.map((habit) => <button key={habit.id} className={`habit-nav ${selectedHabitId === habit.id ? 'active' : ''}`} onClick={() => { setSelectedHabitId(habit.id); document.querySelector('#history')?.scrollIntoView({ behavior: 'smooth' }) }}><span className="habit-dot" style={{ background: habit.color }} />{habit.name}</button>)}
        </div>
        <div className="profile"><div className="avatar">MA</div><div><strong>My account</strong><span>Stored on this device</span></div></div>
      </aside>

      <main className="main">
        <header className="mobile-header"><div className="brand"><div className="brand-mark">G</div><span>GoalStreak</span></div><button onClick={() => setShowForm(true)}>＋</button></header>
        <section className="topbar">
          <div><p className="eyebrow">Your daily check-in</p><h1>{dateTitle}</h1><p>{dateSubtitle}</p></div>
          <div className="date-actions"><button className="round-button" onClick={() => setSelectedDate(move(selectedDate, -1))}>‹</button><button className="today-button" onClick={() => setSelectedDate(today)}>Today</button><button className="round-button" disabled={selectedDate >= today} onClick={() => setSelectedDate(move(selectedDate, 1))}>›</button></div>
        </section>

        <section className="progress-card"><div className="progress-copy"><div className="progress-ring" style={{ '--progress': `${dueToday.length ? (doneToday / dueToday.length) * 360 : 0}deg` } as React.CSSProperties}><span>{doneToday}/{dueToday.length}</span></div><div><h2>{doneToday === dueToday.length && dueToday.length ? 'All done for today!' : 'Keep your momentum going'}</h2><p>{dueToday.length - doneToday} {dueToday.length - doneToday === 1 ? 'habit' : 'habits'} left today</p></div></div><div className="week-pips">{Array.from({ length: 7 }, (_, i) => move(today, i - 6)).map((key) => { const due = habits.filter((h) => isDue(h, key)); const done = due.filter((h) => lookup.has(`${h.id}:${key}`)).length; return <div key={key}><span>{new Intl.DateTimeFormat('en', { weekday: 'narrow' }).format(fromKey(key))}</span><i className={done === due.length && due.length ? 'complete' : done ? 'partial' : ''}>{fromKey(key).getDate()}</i></div> })}</div></section>

        <section className="today-section"><div className="section-heading"><div><h2>Your streaks</h2><p>Small actions, done consistently.</p></div><button className="button primary" onClick={() => setShowForm(true)}>＋ Add streak</button></div>
          <div className="habit-list">{dayHabits.map((habit) => { const done = lookup.has(`${habit.id}:${selectedDate}`); const due = isDue(habit, selectedDate); return <article className={`habit-card ${done ? 'done' : ''}`} key={habit.id}><button className="check-button" style={{ '--habit-color': habit.color } as React.CSSProperties} onClick={() => toggle(habit.id)} aria-label={`Mark ${habit.name} ${done ? 'incomplete' : 'complete'}`}>{done ? '✓' : ''}</button><div className="habit-icon" style={{ background: `${habit.color}16`, color: habit.color }}>{habit.icon}</div><div className="habit-info"><h3>{habit.name}</h3><p>{due ? scheduleText(habit) : 'Rest day'}</p></div><div className="streak-count"><strong>{currentStreak(habit, lookup)}</strong><span>day streak</span></div></article> })}</div>
        </section>

        <section className="history-section" id="history"><div className="section-heading"><div><p className="eyebrow">Activity</p><h2>Your consistency</h2></div>{selectedHabit && <div className="history-controls"><select value={selectedHabit.id} onChange={(e) => setSelectedHabitId(e.target.value)}>{habits.map((h) => <option value={h.id} key={h.id}>{h.icon} {h.name}</option>)}</select><div className="menu-wrap"><button className="round-button" onClick={() => setMenuOpen(!menuOpen)}>•••</button>{menuOpen && <button className="delete-menu" onClick={deleteHabit}>Delete streak</button>}</div></div>}</div>
          {selectedHabit ? <div className="calendar-card"><div className="calendar-stats"><div><strong>{currentStreak(selectedHabit, lookup)}</strong><span>Current streak</span></div><div><strong>{totalCheckIns}</strong><span>Total check-ins</span></div><div><strong>{scheduleText(selectedHabit)}</strong><span>Schedule</span></div></div><div className="heatmap-wrap"><div className="heatmap" aria-label="14 week activity calendar">{calendarDays.map((key) => { const done = lookup.has(`${selectedHabit.id}:${key}`); const due = isDue(selectedHabit, key); return <button key={key} title={`${key}: ${done ? 'completed' : due ? 'not completed' : 'rest day'}`} onClick={() => toggle(selectedHabit.id, key)} className={`heat-cell ${done ? 'checked' : ''} ${!due ? 'rest' : ''}`} style={{ '--habit-color': selectedHabit.color } as React.CSSProperties} /> })}</div></div><div className="calendar-legend"><span>14 weeks ago</span><span><i /> Not done <i className="legend-done" style={{ background: selectedHabit.color }} /> Done</span><span>Today</span></div></div> : <div className="empty-card">Create your first streak to start tracking.</div>}
        </section>
      </main>
      {showForm && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><div className="modal"><AddGoalForm onAdd={addHabit} onCancel={() => setShowForm(false)} /></div></div>}
    </div>
  )
}

export default App
