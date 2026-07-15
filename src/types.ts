export interface Habit {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface CheckIn {
  habitId: string
  date: string
  note?: string
  completedAt: string
}

export type NewHabit = Omit<Habit, 'id' | 'createdAt'>
