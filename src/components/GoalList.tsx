import type { Habit } from '../types'

interface GoalListProps {
  habits: Habit[]
  selectedHabitId: string | null
  onAddGoal: () => void
  onAddEntry: (habit: Habit) => void
  onSelectGoal: (habitId: string) => void
}

export default function GoalList({ habits, selectedHabitId, onAddGoal, onAddEntry, onSelectGoal }: GoalListProps) {
  return (
    <section className="goals-section" aria-labelledby="goals-title">
      <div className="section-title goals-title">
        <div><p className="eyebrow">Your list</p><h2 id="goals-title">Goals</h2></div>
        <button className="text-button" onClick={onAddGoal} type="button">＋ New goal</button>
      </div>

      <div className="goal-list">
        {habits.map((habit) => (
          <div className={`goal-row ${selectedHabitId === habit.id ? 'selected' : ''}`} key={habit.id}>
            <button className="goal-select" onClick={() => onSelectGoal(habit.id)} type="button">
              <span className="goal-color" style={{ background: habit.color }} />
              <span>{habit.name}</span>
            </button>
            <button className="add-entry" onClick={() => onAddEntry(habit)} aria-label={`Add ${habit.name} entry`} type="button">＋</button>
          </div>
        ))}
      </div>
    </section>
  )
}
