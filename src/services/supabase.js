import { createClient } from '@supabase/supabase-js'

const CONFIG_KEY = 'forge_supabase_config_v1'

const DEFAULT_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://fbgvswzckdtozpklcerm.supabase.co',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4gJQZKPqX1X3-A-5x0dW7w_RYnuUWIf',
}

let cachedClient = null
let cachedConfigId = ''

function normalizeConfig(config) {
  return {
    url: (config?.url ?? '').trim().replace(/\/+$/, ''),
    key: (config?.key ?? '').trim(),
  }
}

export function getSupabaseConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return normalizeConfig(JSON.parse(raw))
  } catch { /* ignore bad local config */ }

  return normalizeConfig(DEFAULT_CONFIG)
}

export function saveSupabaseConfig(config) {
  const normalized = normalizeConfig(config)
  localStorage.setItem(CONFIG_KEY, JSON.stringify(normalized))
  cachedClient = null
  cachedConfigId = ''
  return normalized
}

export function hasSupabaseConfig() {
  const config = getSupabaseConfig()
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url) && config.key.length > 20
}

function getSupabase() {
  const config = getSupabaseConfig()
  const configId = `${config.url}|${config.key}`

  if (!hasSupabaseConfig()) {
    throw new Error('SUPABASE_CONFIG_INVALID')
  }

  if (!cachedClient || cachedConfigId !== configId) {
    cachedClient = createClient(config.url, config.key)
    cachedConfigId = configId
  }

  return cachedClient
}

export async function testSupabaseConnection(config = getSupabaseConfig()) {
  const normalized = normalizeConfig(config)
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalized.url) || normalized.key.length <= 20) {
    throw new Error('SUPABASE_CONFIG_INVALID')
  }

  const res = await fetch(`${normalized.url}/auth/v1/health`, {
    headers: { apikey: normalized.key },
  })

  if (!res.ok) throw new Error('SUPABASE_CONFIG_UNREACHABLE')
  return true
}

/* ── Auth ─────────────────────────────────────────────── */

export async function signUp(email, password) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Retorna um subscription — chame .unsubscribe() no cleanup */
export function onAuthStateChange(callback) {
  const supabase = getSupabase()
  const { data } = supabase.auth.onAuthStateChange((_, session) => callback(session))
  return data
}

/* ── Data ─────────────────────────────────────────────── */

export async function saveToCloud(payload) {
  const session = await getSession()
  if (!session) throw new Error('Não autenticado')

  const supabase = getSupabase()
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

  const supabase = getSupabase()
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
