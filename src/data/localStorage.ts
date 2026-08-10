import type { CheckIn, Habit } from '../types'

const GUEST_HABITS_KEY = 'goalstreak:v3:habits'
const GUEST_CHECK_INS_KEY = 'goalstreak:v3:checkins'

function readValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function keyFor(guestKey: string, userId?: string | null) {
  return userId ? `${guestKey}:user:${userId}` : guestKey
}

export function loadHabits(userId?: string | null) {
  return readValue<Habit[]>(keyFor(GUEST_HABITS_KEY, userId), [])
}

export function saveHabits(habits: Habit[], userId?: string | null) {
  window.localStorage.setItem(keyFor(GUEST_HABITS_KEY, userId), JSON.stringify(habits))
}

export function loadCheckIns(userId?: string | null) {
  return readValue<CheckIn[]>(keyFor(GUEST_CHECK_INS_KEY, userId), [])
}

export function saveCheckIns(checkIns: CheckIn[], userId?: string | null) {
  window.localStorage.setItem(keyFor(GUEST_CHECK_INS_KEY, userId), JSON.stringify(checkIns))
}

export function clearGuestData() {
  window.localStorage.removeItem(GUEST_HABITS_KEY)
  window.localStorage.removeItem(GUEST_CHECK_INS_KEY)
}
