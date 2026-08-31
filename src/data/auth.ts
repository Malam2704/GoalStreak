import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export async function getCurrentSession() {
  if (!supabase) return null

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!supabase) return () => undefined

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured yet.')

  const redirectTo = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google' as const,
    options: { redirectTo },
  })

  if (error) throw error
}

export async function signOut() {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
