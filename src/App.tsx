import { useMemo, useState, type FormEvent } from 'react'
import { Alert, LinearProgress, Snackbar } from '@mui/material'
import './App.css'
import ActivityCalendar from './components/ActivityCalendar'
import AddGoalForm from './components/AddGoalFormPanel'
import AuthControls from './components/AuthControls'
import CheckInModal from './components/CheckInModal'
import GoalList from './components/GoalList'
import { isSupabaseConfigured } from './data/supabaseClient'
import useGoalData from './hooks/useGoalData'
import type { CheckIn, Habit, NewHabit } from './types'
import { today } from './utils/date'

function App() {
  const goalData = useGoalData()
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [checkInHabitId, setCheckInHabitId] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState(today)
  const [note, setNote] = useState('')
  const [showGoalForm, setShowGoalForm] = useState(false)

  const selectedHabit = goalData.habits.find((habit) => habit.id === selectedHabitId)
  const checkInHabit = goalData.habits.find((habit) => habit.id === checkInHabitId)
  const entries = useMemo(
    () => new Map(goalData.checkIns.map((entry) => [`${entry.habitId}:${entry.date}`, entry])),
    [goalData.checkIns],
  )

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

  function submitCheckIn(event: FormEvent) {
    event.preventDefault()
    if (!checkInHabitId) return

    const checkIn: CheckIn = {
      habitId: checkInHabitId,
      date: checkInDate,
      note: note.trim(),
      completedAt: new Date().toISOString(),
    }

    goalData.saveCheckIn(checkIn)
    setSelectedHabitId(checkInHabitId)
    setCheckInHabitId(null)
  }

  function removeCurrentCheckIn() {
    if (!checkInHabitId) return
    goalData.removeCheckIn(checkInHabitId, checkInDate)
    setCheckInHabitId(null)
  }

  function addHabit(input: NewHabit) {
    goalData.addHabit(input)
    setShowGoalForm(false)
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="brand-lockup">
          <div className="brand-mark">G</div>
          <div><h1>GoalStreak</h1><p>A simple record of showing up.</p></div>
        </div>

        <AuthControls
          configured={isSupabaseConfigured}
          loading={!goalData.authReady || goalData.authBusy}
          onSignIn={() => void goalData.connectGoogle()}
          onSignOut={() => {
            setSelectedHabitId(null)
            setCheckInHabitId(null)
            setShowGoalForm(false)
            void goalData.disconnectAccount()
          }}
          user={goalData.session?.user.is_anonymous ? null : goalData.session?.user ?? null}
        />
      </header>

      {!goalData.dataReady && <LinearProgress className="sync-progress" />}
      {goalData.errorMessage && (
        <Alert severity="error" onClose={() => goalData.setErrorMessage('')} sx={{ mb: 3 }}>
          {goalData.errorMessage}
        </Alert>
      )}

      {goalData.dataReady && (
        <>
          <GoalList
            habits={goalData.habits}
            onAddEntry={openCheckIn}
            onAddGoal={() => setShowGoalForm(true)}
            onSelectGoal={setSelectedHabitId}
            selectedHabitId={selectedHabitId}
          />

          <ActivityCalendar
            entries={entries}
            onSelectDate={openCheckIn}
            selectedHabit={selectedHabit}
          />
        </>
      )}

      {goalData.dataReady && checkInHabit && (
        <CheckInModal
          date={checkInDate}
          habit={checkInHabit}
          hasEntry={entries.has(`${checkInHabit.id}:${checkInDate}`)}
          note={note}
          onCancel={() => setCheckInHabitId(null)}
          onDateChange={changeCheckInDate}
          onNoteChange={setNote}
          onRemove={removeCurrentCheckIn}
          onSave={submitCheckIn}
        />
      )}

      {goalData.dataReady && showGoalForm && (
        <AddGoalForm onAdd={addHabit} onCancel={() => setShowGoalForm(false)} />
      )}

      <Snackbar
        autoHideDuration={5000}
        message={goalData.successMessage}
        onClose={() => goalData.setSuccessMessage('')}
        open={Boolean(goalData.successMessage)}
      />
    </main>
  )
}

export default App
