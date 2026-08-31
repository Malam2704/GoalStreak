import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getCurrentSession, signInWithGoogle, signOut, subscribeToAuthChanges } from '../data/auth'
import { loadCheckIns, loadHabits, saveCheckIns, saveHabits } from '../data/localStorage'
import { deleteCheckIn, loadSupabaseData, upsertCheckIn, upsertHabit } from '../data/supabase'
import type { CheckIn, Habit, NewHabit } from '../types'
import { today } from '../utils/date'

export default function useGoalData() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [checkIns, setCheckIns] = useState<CheckIn[]>(loadCheckIns)
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [storageUserId, setStorageUserId] = useState<string | null | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const userId = session && !session.user.is_anonymous ? session.user.id : null

  useEffect(() => {
    let active = true

    getCurrentSession()
      .then((currentSession) => {
        if (active) {
          setSession(currentSession)
          setAuthReady(true)
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(`Could not restore your session: ${error.message}`)
          setAuthReady(true)
        }
      })

    const unsubscribe = subscribeToAuthChanges((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
      setAuthBusy(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) return

    let active = true

    async function loadData() {
      setDataReady(false)

      if (!userId) {
        if (active) {
          setHabits(loadHabits())
          setCheckIns(loadCheckIns())
          setStorageUserId(null)
          setDataReady(true)
        }
        return
      }

      const cachedHabits = loadHabits(userId)
      const cachedCheckIns = loadCheckIns(userId)

      try {
        const cloudData = await loadSupabaseData()
        if (!active) return

        setHabits(cloudData.habits)
        setCheckIns(cloudData.checkIns)
        setStorageUserId(userId)
        setDataReady(true)
      } catch (error) {
        if (!active) return

        const message = error instanceof Error ? error.message : 'Unknown sync error'
        setHabits(cachedHabits)
        setCheckIns(cachedCheckIns)
        setStorageUserId(userId)
        setDataReady(true)
        setErrorMessage(`Cloud sync failed. Showing this device's saved copy: ${message}`)
      }
    }

    void loadData()
    return () => { active = false }
  }, [authReady, userId])

  useEffect(() => {
    if (dataReady && storageUserId !== undefined) {
      saveHabits(habits, storageUserId)
    }
  }, [dataReady, habits, storageUserId])

  useEffect(() => {
    if (dataReady && storageUserId !== undefined) {
      saveCheckIns(checkIns, storageUserId)
    }
  }, [checkIns, dataReady, storageUserId])

  function reportCloudError(action: string, error: unknown) {
    const detail = error instanceof Error ? error.message : 'Unknown error'
    setErrorMessage(`${action} was saved on this device but not synced: ${detail}`)
  }

  async function connectGoogle() {
    setAuthBusy(true)
    setErrorMessage('')

    try {
      await signInWithGoogle()
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setAuthBusy(false)
      setErrorMessage(`Google sign-in failed: ${detail}`)
    }
  }

  async function disconnectAccount() {
    setAuthBusy(true)
    setErrorMessage('')

    try {
      await signOut()
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setAuthBusy(false)
      setErrorMessage(`Sign out failed: ${detail}`)
    }
  }

  function addHabit(input: NewHabit) {
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: today,
    }

    setHabits((current) => [...current, habit])
    if (userId) {
      void upsertHabit(userId, habit)
        .catch((error) => reportCloudError('Goal', error))
    }
  }

  function saveCheckIn(checkIn: CheckIn) {
    setCheckIns((current) => [
      ...current.filter((entry) => (
        entry.habitId !== checkIn.habitId || entry.date !== checkIn.date
      )),
      checkIn,
    ])

    if (userId) {
      void upsertCheckIn(userId, checkIn)
        .catch((error) => reportCloudError('Check-in', error))
    }
  }

  function removeCheckIn(habitId: string, date: string) {
    setCheckIns((current) => current.filter((entry) => (
      entry.habitId !== habitId || entry.date !== date
    )))

    if (userId) {
      void deleteCheckIn(userId, habitId, date)
        .catch((error) => reportCloudError('Check-in removal', error))
    }
  }

  return {
    habits,
    checkIns,
    session,
    authReady,
    authBusy,
    dataReady,
    errorMessage,
    successMessage,
    addHabit,
    connectGoogle,
    disconnectAccount,
    removeCheckIn,
    saveCheckIn,
    setErrorMessage,
    setSuccessMessage,
  }
}
