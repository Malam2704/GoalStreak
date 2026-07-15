import { useState, type FormEvent } from 'react'
import type { NewHabit } from '../types'

interface Props {
  onAdd: (habit: NewHabit) => void
  onCancel: () => void
}

const colors = ['#2563eb', '#7c3aed', '#059669', '#e11d48', '#ea580c', '#0891b2']
export default function AddGoalForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[0])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), color })
  }

  return (
    <form className="habit-form" onSubmit={submit}>
      <div className="form-heading">
        <div><span className="eyebrow">New goal</span><h2>Add something to track</h2></div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Close">×</button>
      </div>
      <label className="field"><span>Name</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Take vitamins" /></label>
      <div className="field"><span>Color</span><div className="choice-row">{colors.map((item) => <button type="button" key={item} className={`color-choice ${color === item ? 'selected' : ''}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Choose ${item}`} />)}</div></div>
      <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" type="submit">Add goal</button></div>
    </form>
  )
}
