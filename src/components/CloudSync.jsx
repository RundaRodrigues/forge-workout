import { useState, useEffect } from 'react'
import {
  signUp, signIn, signOut,
  getSession, onAuthStateChange, loadFromCloud, saveToCloud,
  getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection,
} from '../services/supabase.js'

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function CloudSync({ data, onLoad, autoSync }) {
  const [open, setOpen]       = useState(false)
  const [user, setUser]       = useState(null)
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]   = useState('idle')    // idle | loading | done | error
  const [msg, setMsg]         = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [configDraft, setConfigDraft] = useState(() => getSupabaseConfig())

  /* ── Escuta auth state ──────────────────────────────── */
  useEffect(() => {
    let alive = true
    getSession()
      .then(session => {
        if (alive) setUser(session?.user ?? null)
      })
      .catch(() => {})

    let sub = null
    try {
      sub = onAuthStateChange((session) => {
        setUser(session?.user ?? null)
      })
    } catch {
      setUser(null)
    }
    return () => {
      alive = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  /* ── Auto-load ao logar ─────────────────────────────── */
  useEffect(() => {
    if (!user) return
    loadFromCloud()
      .then(loaded => {
        if (!loaded) return
        const hasLocalData = !!data?.activeWorkout || !!data?.gender || (data?.history?.length ?? 0) > 0
        if (!hasLocalData) {
          onLoad(loaded)
          return
        }
        setStatus('done')
        setMsg('Backup encontrado. Use "Restaurar da nuvem" para substituir os dados deste aparelho.')
      })
      .catch(() => {})
  }, [user?.id])

  /* ── Ações auth ─────────────────────────────────────── */
  async function handleAuth(e) {
    e.preventDefault()
    if (!email || !password) return
    setStatus('loading')
    setMsg('')
    try {
      if (mode === 'register') {
        const result = await signUp(email, password)
        if (result.session) {
          setUser(result.user)
          setOpen(false)
        } else {
          setMsg('Conta criada. Confirme seu email e depois entre.')
        }
      } else {
        const result = await signIn(email, password)
        setUser(result.user)
        setOpen(false)
      }
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setMsg(translateError(err.message))
    }
  }

  async function handleSignOut() {
    await signOut()
    setUser(null)
    setStatus('idle')
    setMsg('')
  }

  /* ── Ações dados ─────────────────────────────────────── */
  async function handleSave() {
    setStatus('loading')
    try {
      await saveToCloud(data)
      setStatus('done')
      setMsg(`Salvo às ${new Date().toLocaleTimeString('pt-BR')}`)
    } catch (err) {
      setStatus('error')
      setMsg(translateError(err.message))
    }
  }

  async function handleConfigSave() {
    setStatus('loading')
    setMsg('')
    try {
      await testSupabaseConnection(configDraft)
      saveSupabaseConfig(configDraft)
      setStatus('done')
      setMsg('Supabase conectado. Agora tente entrar ou criar conta.')
      setShowConfig(false)
    } catch (err) {
      setStatus('error')
      setMsg(translateError(err.message))
    }
  }

  async function handleLoad() {
    setStatus('loading')
    try {
      const loaded = await loadFromCloud()
      if (!loaded) { setStatus('error'); setMsg('Nenhum backup encontrado.'); return }
      onLoad(loaded)
      setStatus('done')
      setMsg('Dados restaurados!')
    } catch (err) {
      setStatus('error')
      setMsg(translateError(err.message))
    }
  }

  /* ── Chip ────────────────────────────────────────────── */
  const isAutoSyncing = autoSync?.state === 'syncing'
  const autoSynced    = autoSync?.state === 'done'
  const autoError     = autoSync?.state === 'error'

  const chipIcon  = isAutoSyncing ? '⏳' : autoSynced ? '✅' : autoError ? '⚠️' : '☁️'
  const chipLabel = isAutoSyncing ? 'Salvando…'
    : autoSynced ? `Salvo ${formatTime(autoSync.time)}`
    : autoError  ? 'Erro sync'
    : user        ? 'Sync'
    : 'Entrar'

  const isGreen    = (user && !autoError) || autoSynced || isAutoSyncing
  const chipColor  = isGreen ? 'var(--green)' : autoError ? 'var(--red)' : 'var(--text-2)'
  const chipBg     = isGreen ? 'rgba(6,214,160,.12)' : autoError ? 'rgba(255,59,59,.12)' : 'var(--surface-2)'
  const chipBorder = isGreen ? 'rgba(6,214,160,.3)'  : autoError ? 'rgba(255,59,59,.3)'  : 'var(--border)'
  const configHost = getSupabaseConfig().url.replace(/^https?:\/\//, '')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: chipBg, border: `1px solid ${chipBorder}`,
          borderRadius: 999, padding: '5px 12px',
          color: chipColor, fontSize: 12, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer',
          transition: 'all .3s ease', whiteSpace: 'nowrap',
        }}
      >
        {chipIcon} {chipLabel}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(7,7,15,.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: user ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: user ? '0' : '16px',
            animation: 'fadeIn .2s ease',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 400, margin: '0 auto',
              background: 'var(--surface)',
              borderRadius: user ? '24px 24px 0 0' : '20px',
              border: '1px solid var(--border)',
              padding: user
                ? '20px 20px calc(24px + env(safe-area-inset-bottom))'
                : '24px 20px',
              animation: user ? 'slideUp .25s ease' : 'fadeIn .2s ease',
              maxHeight: '90dvh',
              overflowY: 'auto',
            }}
          >
            {user && <div style={{ width: 36, height: 4, background: 'var(--border-2)', borderRadius: 2, margin: '0 auto 20px' }} />}

            <h2 className="h3" style={{ marginBottom: 4 }}>☁️ Cloud Sync</h2>
            <p className="caption" style={{ marginBottom: 16 }}>
              {user ? 'Seus treinos ficam salvos na nuvem e sincronizam entre dispositivos.' : 'Entre para salvar seus treinos na nuvem.'}
            </p>

            <div style={{
              padding: '10px 12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              marginBottom: 12,
            }}>
              <div className="row-between" style={{ gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700 }}>Supabase</p>
                  <p className="caption" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {configHost || 'Não configurado'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: '6px 10px', flexShrink: 0 }}
                  onClick={() => setShowConfig(open => !open)}
                >
                  Configurar
                </button>
              </div>

              {showConfig && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  <input
                    type="url"
                    placeholder="https://seu-projeto.supabase.co"
                    value={configDraft.url}
                    onChange={e => setConfigDraft(current => ({ ...current, url: e.target.value }))}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    placeholder="anon public key ou publishable key"
                    value={configDraft.key}
                    onChange={e => setConfigDraft(current => ({ ...current, key: e.target.value }))}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    style={{ fontSize: 13, padding: '12px' }}
                    onClick={handleConfigSave}
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Testando...' : 'Testar e salvar conexão'}
                  </button>
                </div>
              )}
            </div>

            {!user ? (
              /* ── Login / Registro ───────────────── */
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Toggle */}
                <div style={{
                  display: 'flex', gap: 0,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', overflow: 'hidden',
                  marginBottom: 4,
                }}>
                  {['login', 'register'].map(m => (
                    <button
                      key={m} type="button"
                      onClick={() => { setMode(m); setMsg('') }}
                      style={{
                        flex: 1, padding: '10px',
                        background: mode === m ? 'var(--surface-3)' : 'transparent',
                        border: 'none',
                        color: mode === m ? 'var(--text)' : 'var(--text-3)',
                        fontSize: 13, fontWeight: 600,
                        fontFamily: 'inherit', cursor: 'pointer',
                        borderRadius: 'var(--r-md)',
                        transition: 'all .15s',
                      }}
                    >
                      {m === 'login' ? 'Entrar' : 'Criar conta'}
                    </button>
                  ))}
                </div>

                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={inputStyle}
                />

                {msg && (
                  <p style={{
                    fontSize: 13, padding: '8px 12px',
                    borderRadius: 'var(--r-md)',
                    background: status === 'error' ? 'rgba(255,59,59,.1)' : 'rgba(6,214,160,.1)',
                    color: status === 'error' ? 'var(--red)' : 'var(--green)',
                    border: `1px solid ${status === 'error' ? 'rgba(255,59,59,.2)' : 'rgba(6,214,160,.2)'}`,
                  }}>
                    {msg}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? '⏳ Aguarde...' : mode === 'login' ? '🔑 Entrar' : '✨ Criar conta'}
                </button>
              </form>
            ) : (
              /* ── Painel autenticado ──────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* User info */}
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(6,214,160,.08)',
                  border: '1px solid rgba(6,214,160,.2)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Conectado</p>
                    <p className="caption" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <button className="btn btn-primary w-full" onClick={handleSave} disabled={status === 'loading'}>
                  {status === 'loading' ? '⏳ Salvando...' : '⬆️ Salvar na nuvem'}
                </button>
                <button className="btn btn-ghost w-full" onClick={handleLoad} disabled={status === 'loading'}>
                  {status === 'loading' ? '⏳ Carregando...' : '⬇️ Restaurar da nuvem'}
                </button>

                {autoSynced && autoSync?.time && (
                  <div style={{
                    padding: '8px 14px', borderRadius: 'var(--r-md)',
                    background: 'rgba(6,214,160,.08)',
                    border: '1px solid rgba(6,214,160,.2)',
                    color: 'var(--green)', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    ✅ Auto-salvo às {formatTime(autoSync.time)}
                  </div>
                )}

                {msg && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 'var(--r-md)',
                    background: status === 'error' ? 'rgba(255,59,59,.1)' : 'rgba(6,214,160,.1)',
                    border: `1px solid ${status === 'error' ? 'rgba(255,59,59,.2)' : 'rgba(6,214,160,.2)'}`,
                    color: status === 'error' ? 'var(--red)' : 'var(--green)',
                    fontSize: 13,
                  }}>
                    {msg}
                  </div>
                )}

                <div className="sep" />

                <button
                  className="btn btn-ghost w-full"
                  style={{ color: 'var(--text-3)', fontSize: 13 }}
                  onClick={handleSignOut}
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border-2)',
  borderRadius: 'var(--r-md)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: 14,
  padding: '13px',
  outline: 'none',
}

function translateError(msg) {
  if (!msg) return 'Não foi possível entrar. Tente novamente.'
  if (msg.includes('SUPABASE_CONFIG_INVALID')) {
    return 'Informe uma Project URL do Supabase e uma chave pública válida.'
  }
  if (msg.includes('SUPABASE_CONFIG_UNREACHABLE')) {
    return 'Não consegui validar esse Supabase. Confira a URL do projeto e a chave pública.'
  }
  if (msg.includes('Load failed') || msg.includes('fetch failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Servidor de login indisponível. Confira a URL/chave do Supabase em Configurar.'
  }
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('Email not confirmed'))       return 'Confirme seu email antes de entrar.'
  if (msg.includes('User already registered'))   return 'Este email já possui conta. Faça login.'
  if (msg.includes('Password should be'))        return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate'))        return 'Sessão expirada. Tente novamente.'
  return msg
}
