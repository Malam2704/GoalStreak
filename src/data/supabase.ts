import type { CheckIn, Habit } from '../types'
import { supabase } from './supabaseClient'

type HabitRow = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

type CheckInRow = {
  habit_id: string
  user_id: string
  date: string
  note: string
  completed_at: string
}

function toHabitRow(habit: Habit, userId: string): HabitRow {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    color: habit.color,
    created_at: habit.createdAt,
  }
}

function toCheckInRow(checkIn: CheckIn, userId: string): CheckInRow {
  return {
    habit_id: checkIn.habitId,
    user_id: userId,
    date: checkIn.date,
    note: checkIn.note ?? '',
    completed_at: checkIn.completedAt,
  }
}

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  }
}

function toCheckIn(row: CheckInRow): CheckIn {
  return {
    habitId: row.habit_id,
    date: row.date,
    note: row.note,
    completedAt: row.completed_at,
  }
}

export async function syncWithSupabase(
  userId: string,
  localHabits: Habit[],
  localCheckIns: CheckIn[],
) {
  if (!supabase) throw new Error('Supabase is not configured yet.')

  if (localHabits.length > 0) {
    const { error } = await supabase.from('habits').upsert(
      localHabits.map((habit) => toHabitRow(habit, userId)),
    )
    if (error) throw error
  }

  if (localCheckIns.length > 0) {
    const { error } = await supabase.from('check_ins').upsert(
      localCheckIns.map((checkIn) => toCheckInRow(checkIn, userId)),
    )
    if (error) throw error
  }

  const [habitsResult, checkInsResult] = await Promise.all([
    supabase.from('habits').select('id, user_id, name, color, created_at').order('created_at'),
    supabase.from('check_ins').select('habit_id, user_id, date, note, completed_at').order('date'),
  ])

  if (habitsResult.error) throw habitsResult.error
  if (checkInsResult.error) throw checkInsResult.error

  return {
    habits: (habitsResult.data as HabitRow[]).map(toHabit),
    checkIns: (checkInsResult.data as CheckInRow[]).map(toCheckIn),
  }
}

export async function upsertHabit(userId: string, habit: Habit) {
  if (!supabase) return
  const { error } = await supabase.from('habits').upsert(toHabitRow(habit, userId))
  if (error) throw error
}

export async function upsertCheckIn(userId: string, checkIn: CheckIn) {
  if (!supabase) return
  const { error } = await supabase.from('check_ins').upsert(toCheckInRow(checkIn, userId))
  if (error) throw error
}

export async function deleteCheckIn(userId: string, habitId: string, date: string) {
  if (!supabase) return
  const { error } = await supabase
    .from('check_ins')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('date', date)

  if (error) throw error
}
