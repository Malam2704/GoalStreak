import type { CheckIn, Habit } from '../types'

const HABITS_KEY = 'goalstreak:v3:habits'
const CHECK_INS_KEY = 'goalstreak:v3:checkins'

function readValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function loadHabits() {
  return readValue<Habit[]>(HABITS_KEY, [])
}

export function saveHabits(habits: Habit[]) {
  window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function loadCheckIns() {
  return readValue<CheckIn[]>(CHECK_INS_KEY, [])
}

export function saveCheckIns(checkIns: CheckIn[]) {
  window.localStorage.setItem(CHECK_INS_KEY, JSON.stringify(checkIns))
}
