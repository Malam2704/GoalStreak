export type HabitSchedule = 'daily' | 'weekly' | 'cycle'

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  schedule: HabitSchedule
  weeklyTarget?: number
  activeDays?: number
  restDays?: number
  createdAt: string
}

export interface CheckIn {
  habitId: string
  date: string
  completedAt: string
}

export type NewHabit = Omit<Habit, 'id' | 'createdAt'>
