import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import ActivityCalendar from './components/ActivityCalendar'
import AddGoalForm from './components/AddGoalFormPanel'
import CheckInModal from './components/CheckInModal'
import GoalList from './components/GoalList'
import { loadCheckIns, loadHabits, saveCheckIns, saveHabits } from './data/localStorage'
import type { CheckIn, Habit, NewHabit } from './types'
import { today } from './utils/date'

function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [checkIns, setCheckIns] = useState<CheckIn[]>(loadCheckIns)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [checkInHabitId, setCheckInHabitId] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState(today)
  const [note, setNote] = useState('')
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  useEffect(() => {
    saveCheckIns(checkIns)
  }, [checkIns])

  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId)
  const checkInHabit = habits.find((habit) => habit.id === checkInHabitId)

  const entries = useMemo(() => {
    return new Map(checkIns.map((entry) => [`${entry.habitId}:${entry.date}`, entry]))
  }, [checkIns])

  function openCheckIn(habit: Habit, date = today) {
    const existingEntry = entries.get(`${habit.id}:${date}`)
    setCheckInHabitId(habit.id)
    setCheckInDate(date)
    setNote(existingEntry?.note ?? '')
  }

  function changeCheckInDate(date: string) {
    setCheckInDate(date)
    setNote(entries.get(`${checkInHabitId}:${date}`)?.note ?? '')
  }

  function saveCheckIn(event: FormEvent) {
    event.preventDefault()
    if (!checkInHabitId) return

    const otherCheckIns = checkIns.filter((entry) => {
      return entry.habitId !== checkInHabitId || entry.date !== checkInDate
    })

    const newCheckIn: CheckIn = {
      habitId: checkInHabitId,
      date: checkInDate,
      note: note.trim(),
      completedAt: new Date().toISOString(),
    }

    setCheckIns([...otherCheckIns, newCheckIn])
    setSelectedHabitId(checkInHabitId)
    setCheckInHabitId(null)
  }

  function removeCheckIn() {
    setCheckIns((current) => current.filter((entry) => {
      return entry.habitId !== checkInHabitId || entry.date !== checkInDate
    }))
    setCheckInHabitId(null)
  }

  function addHabit(input: NewHabit) {
    const newHabit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: today,
    }

    setHabits((current) => [...current, newHabit])
    setShowGoalForm(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand-mark">G</div>
        <div><h1>GoalStreak</h1><p>A simple record of showing up.</p></div>
      </header>

      <ActivityCalendar
        entries={entries}
        onSelectDate={openCheckIn}
        selectedHabit={selectedHabit}
      />

      <GoalList
        habits={habits}
        onAddEntry={openCheckIn}
        onAddGoal={() => setShowGoalForm(true)}
        onSelectGoal={setSelectedHabitId}
        selectedHabitId={selectedHabitId}
      />

      {checkInHabit && (
        <CheckInModal
          date={checkInDate}
          habit={checkInHabit}
          hasEntry={entries.has(`${checkInHabit.id}:${checkInDate}`)}
          note={note}
          onCancel={() => setCheckInHabitId(null)}
          onDateChange={changeCheckInDate}
          onNoteChange={setNote}
          onRemove={removeCheckIn}
          onSave={saveCheckIn}
        />
      )}

      {showGoalForm && (
        <AddGoalForm onAdd={addHabit} onCancel={() => setShowGoalForm(false)} />
      )}
    </main>
  )
}

export default App
