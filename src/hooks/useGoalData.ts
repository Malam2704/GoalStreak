import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getCurrentSession, signInWithGoogle, signOut, subscribeToAuthChanges } from '../data/auth'
import {
  clearGuestData,
  loadCheckIns,
  loadHabits,
  saveCheckIns,
  saveHabits,
} from '../data/localStorage'
import { deleteCheckIn, syncWithSupabase, upsertCheckIn, upsertHabit } from '../data/supabase'
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

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      setDataReady(false)
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
    const userId = session?.user.id

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
      const guestHabits = loadHabits()
      const guestCheckIns = loadCheckIns()
      const hasGuestData = guestHabits.length > 0 || guestCheckIns.length > 0

      try {
        const cloudData = await syncWithSupabase(userId, guestHabits, guestCheckIns)
        if (!active) return

        clearGuestData()
        setHabits(cloudData.habits)
        setCheckIns(cloudData.checkIns)
        setStorageUserId(userId)
        setDataReady(true)

        if (hasGuestData && !session?.user.is_anonymous) {
          setSuccessMessage('Your local data is now connected to your Google account.')
        }
      } catch (error) {
        if (!active) return

        const message = error instanceof Error ? error.message : 'Unknown sync error'
        setHabits(cachedHabits)
        setCheckIns(cachedCheckIns)
        setStorageUserId(userId)
        setDataReady(true)
        setErrorMessage(`Cloud sync failed. Using this device's cache: ${message}`)
      }
    }

    void loadData()
    return () => { active = false }
  }, [authReady, session?.user.id, session?.user.is_anonymous])

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
    setErrorMessage(`${action} was saved locally but not synced: ${detail}`)
  }

  async function connectGoogle() {
    setAuthBusy(true)
    setErrorMessage('')

    try {
      await signInWithGoogle()
    } catch (error) {
      setAuthBusy(false)
      reportCloudError('Google sign-in', error)
    }
  }

  async function disconnectAccount() {
    setAuthBusy(true)
    setErrorMessage('')

    try {
      await signOut()
    } catch (error) {
      setAuthBusy(false)
      reportCloudError('Sign out', error)
    }
  }

  function addHabit(input: NewHabit) {
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: today,
    }

    setHabits((current) => [...current, habit])
    if (session) {
      void upsertHabit(session.user.id, habit)
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

    if (session) {
      void upsertCheckIn(session.user.id, checkIn)
        .catch((error) => reportCloudError('Check-in', error))
    }
  }

  function removeCheckIn(habitId: string, date: string) {
    setCheckIns((current) => current.filter((entry) => (
      entry.habitId !== habitId || entry.date !== date
    )))

    if (session) {
      void deleteCheckIn(session.user.id, habitId, date)
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
