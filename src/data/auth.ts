import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export async function getCurrentSession() {
  if (!supabase) return null

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function subscribeToAuthChanges(callback: (session: Session | null) => void) {
  if (!supabase) return () => undefined

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured yet.')

  const redirectTo = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const credentials = {
    provider: 'google' as const,
    options: { redirectTo },
  }

  const { error } = sessionData.session?.user.is_anonymous
    ? await supabase.auth.linkIdentity(credentials)
    : await supabase.auth.signInWithOAuth(credentials)

  if (error) throw error
}

export async function signOut() {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
