import { useState, type FormEvent } from 'react'
import type { HabitSchedule, NewHabit } from '../types'

interface Props {
  onAdd: (habit: NewHabit) => void
  onCancel: () => void
}

const colors = ['#2563eb', '#7c3aed', '#059669', '#e11d48', '#ea580c', '#0891b2']
const icons = ['✓', '💊', '🏋️', '📚', '💧', '🧘']

export default function AddGoalForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✓')
  const [color, setColor] = useState(colors[0])
  const [schedule, setSchedule] = useState<HabitSchedule>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState(4)
  const [activeDays, setActiveDays] = useState(2)
  const [restDays, setRestDays] = useState(1)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(), icon, color, schedule,
      weeklyTarget: schedule === 'weekly' ? weeklyTarget : undefined,
      activeDays: schedule === 'cycle' ? activeDays : undefined,
      restDays: schedule === 'cycle' ? restDays : undefined,
    })
  }

  return (
    <form className="habit-form" onSubmit={submit}>
      <div className="form-heading">
        <div><span className="eyebrow">New streak</span><h2>Create a habit</h2></div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Close">×</button>
      </div>
      <label className="field"><span>Name</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Take vitamins" /></label>
      <div className="field"><span>Icon</span><div className="choice-row">{icons.map((item) => <button type="button" key={item} className={`icon-choice ${icon === item ? 'selected' : ''}`} onClick={() => setIcon(item)}>{item}</button>)}</div></div>
      <div className="field"><span>Color</span><div className="choice-row">{colors.map((item) => <button type="button" key={item} className={`color-choice ${color === item ? 'selected' : ''}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Choose ${item}`} />)}</div></div>
      <label className="field"><span>Schedule</span><select value={schedule} onChange={(e) => setSchedule(e.target.value as HabitSchedule)}><option value="daily">Every day</option><option value="weekly">Times per week</option><option value="cycle">Workout / rest cycle</option></select></label>
      {schedule === 'weekly' && <label className="field"><span>Weekly target</span><input type="number" min="1" max="7" value={weeklyTarget} onChange={(e) => setWeeklyTarget(Number(e.target.value))} /></label>}
      {schedule === 'cycle' && <div className="split-fields"><label className="field"><span>Active days</span><input type="number" min="1" max="14" value={activeDays} onChange={(e) => setActiveDays(Number(e.target.value))} /></label><label className="field"><span>Rest days</span><input type="number" min="1" max="14" value={restDays} onChange={(e) => setRestDays(Number(e.target.value))} /></label></div>}
      <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" type="submit">Create streak</button></div>
    </form>
  )
}
