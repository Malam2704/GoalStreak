import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CheckIn, Habit } from '../types'

type HabitRow = {
  id: string
  name: string
  color: string
  created_at: string
}

type CheckInRow = {
  habit_id: string
  date: string
  note: string
  completed_at: string
}

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY
const client = url && key ? createClient(url, key) : null
let authentication: Promise<SupabaseClient | null> | null = null

async function startAuthentication(): Promise<SupabaseClient | null> {
  if (!client) return null

  const { data, error } = await client.auth.getSession()
  if (error) throw error
  if (!data.session) {
    const { error: signInError } = await client.auth.signInAnonymously()
    if (signInError) throw signInError
  }

  return client
}

function authenticatedClient() {
  authentication ??= startAuthentication().catch((error) => {
    authentication = null
    throw error
  })
  return authentication
}

function habitRow(habit: Habit) {
  return { id: habit.id, name: habit.name, color: habit.color, created_at: habit.createdAt }
}

function checkInRow(checkIn: CheckIn) {
  return {
    habit_id: checkIn.habitId,
    date: checkIn.date,
    note: checkIn.note ?? '',
    completed_at: checkIn.completedAt,
  }
}

export async function syncWithSupabase(localHabits: Habit[], localCheckIns: CheckIn[]) {
  const supabase = await authenticatedClient()
  if (!supabase) return null

  if (localHabits.length) {
    const { error } = await supabase.from('habits').upsert(localHabits.map(habitRow))
    if (error) throw error
  }
  if (localCheckIns.length) {
    const { error } = await supabase.from('check_ins').upsert(localCheckIns.map(checkInRow))
    if (error) throw error
  }

  const [habitsResult, checkInsResult] = await Promise.all([
    supabase.from('habits').select('id, name, color, created_at').order('created_at'),
    supabase.from('check_ins').select('habit_id, date, note, completed_at').order('date'),
  ])
  if (habitsResult.error) throw habitsResult.error
  if (checkInsResult.error) throw checkInsResult.error

  return {
    habits: (habitsResult.data as HabitRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: row.created_at,
    })),
    checkIns: (checkInsResult.data as CheckInRow[]).map((row) => ({
      habitId: row.habit_id,
      date: row.date,
      note: row.note,
      completedAt: row.completed_at,
    })),
  }
}

export async function upsertHabit(habit: Habit) {
  const supabase = await authenticatedClient()
  if (!supabase) return
  const { error } = await supabase.from('habits').upsert(habitRow(habit))
  if (error) throw error
}

export async function upsertCheckIn(checkIn: CheckIn) {
  const supabase = await authenticatedClient()
  if (!supabase) return
  const { error } = await supabase.from('check_ins').upsert(checkInRow(checkIn))
  if (error) throw error
}

export async function deleteCheckIn(habitId: string, date: string) {
  const supabase = await authenticatedClient()
  if (!supabase) return
  const { error } = await supabase
    .from('check_ins')
    .delete()
    .eq('habit_id', habitId)
    .eq('date', date)
  if (error) throw error
}
