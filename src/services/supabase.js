import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fbgvswzckdtozpklcerm.supabase.co',
  'sb_publishable_4gJQZKPqX1X3-A-5x0dW7w_RYnuUWIf'
)

/* ── Auth ─────────────────────────────────────────────── */

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Retorna um subscription — chame .unsubscribe() no cleanup */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_, session) => callback(session))
  return data
}

/* ── Data ─────────────────────────────────────────────── */

export async function saveToCloud(payload) {
  const session = await getSession()
  if (!session) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('workout_data')
    .upsert(
      { user_id: session.user.id, data: payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) throw error
}

export async function loadFromCloud() {
  const session = await getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('workout_data')
    .select('data')
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // ainda não tem registro
    throw error
  }

  return data?.data ?? null
}
