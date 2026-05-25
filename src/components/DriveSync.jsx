import { useState, useEffect } from 'react'
import {
  getStoredClientId, saveClientId,
  initGIS, requestToken, requestTokenSilent, signOut,
  saveToDrive, loadFromDrive, getToken,
  wasPreviouslyAuthed,
} from '../services/googleDrive.js'

const STATUS = { idle: 'idle', auth: 'auth', saving: 'saving', loading: 'loading', done: 'done', error: 'error' }

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function DriveSync({ data, onLoad, autoSync, onManualSync }) {
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState(getStoredClientId)
  const [draftId, setDraftId] = useState(getStoredClientId)
  const [status, setStatus] = useState(STATUS.idle)
  const [msg, setMsg] = useState('')
  const [authed, setAuthed] = useState(false)

  const gisReady = !!window.google?.accounts?.oauth2

  function setup() {
    if (!draftId.trim()) return
    saveClientId(draftId)
    setClientId(draftId)
    initGIS(
      draftId.trim(),
      () => { setAuthed(true); setStatus(STATUS.done); setMsg('Conectado ao Google!') },
      (err) => { setStatus(STATUS.error); setMsg(String(err)) }
    )
  }

  useEffect(() => {
    if (clientId && gisReady) {
      initGIS(
        clientId,
        () => { setAuthed(true) },
        (err) => { setStatus(STATUS.error); setMsg(String(err)) }
      )
      if (wasPreviouslyAuthed()) {
        requestTokenSilent()
      }
    }
  }, [clientId, gisReady])

  function handleAuth() {
    setStatus(STATUS.auth)
    try {
      requestToken()
    } catch (e) {
      setStatus(STATUS.error)
      setMsg('Inicie o fluxo novamente.')
    }
  }

  async function handleSave() {
    if (!authed || !getToken()) { handleAuth(); return }
    setStatus(STATUS.saving)
    try {
      await saveToDrive(data)
      setStatus(STATUS.done)
      setMsg(`Salvo em ${new Date().toLocaleTimeString('pt-BR')}`)
    } catch (e) {
      setStatus(STATUS.error)
      setMsg(e.message)
    }
  }

  async function handleLoad() {
    if (!authed || !getToken()) { handleAuth(); return }
    setStatus(STATUS.loading)
    try {
      const loaded = await loadFromDrive()
      if (!loaded) { setStatus(STATUS.error); setMsg('Nenhum backup encontrado no Drive.'); return }
      onLoad(loaded)
      setStatus(STATUS.done)
      setMsg('Dados restaurados do Drive!')
    } catch (e) {
      setStatus(STATUS.error)
      setMsg(e.message)
    }
  }

  function handleSignOut() {
    signOut()
    setAuthed(false)
    setStatus(STATUS.idle)
    setMsg('')
  }

  const busy = status === STATUS.saving || status === STATUS.loading || status === STATUS.auth

  // Merge auto-sync status into chip display
  const isAutoSyncing = autoSync?.state === 'syncing'
  const autoSynced    = autoSync?.state === 'done'
  const autoError     = autoSync?.state === 'error'

  const chipIcon = isAutoSyncing ? '⏳'
    : autoSynced  ? '✅'
    : autoError   ? '⚠️'
    : authed      ? '☁️'
    : '☁️'

  const chipLabel = isAutoSyncing ? 'Salvando…'
    : autoSynced  ? `Salvo ${formatTime(autoSync.time)}`
    : autoError   ? 'Erro ao salvar'
    : authed      ? 'Drive'
    : 'Conectar Drive'

  const chipColor = isAutoSyncing || autoSynced ? 'var(--green)'
    : autoError   ? 'var(--red)'
    : authed      ? 'var(--green)'
    : 'var(--text-2)'

  const chipBg = isAutoSyncing || autoSynced ? 'rgba(6,214,160,.12)'
    : autoError   ? 'rgba(255,59,59,.12)'
    : authed      ? 'rgba(6,214,160,.12)'
    : 'var(--surface-2)'

  const chipBorder = isAutoSyncing || autoSynced ? 'rgba(6,214,160,.3)'
    : autoError   ? 'rgba(255,59,59,.3)'
    : authed      ? 'rgba(6,214,160,.3)'
    : 'var(--border)'

  return (
    <>
      {/* Sync chip in the UI */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: chipBg,
          border: `1px solid ${chipBorder}`,
          borderRadius: 999, padding: '5px 12px',
          color: chipColor,
          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all .3s ease',
        }}
      >
        {chipIcon} {chipLabel}
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(7,7,15,.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn .2s ease',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 430, margin: '0 auto',
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid var(--border)',
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
              animation: 'slideUp .25s ease',
            }}
          >
            <div style={{ width: 36, height: 4, background: 'var(--border-2)', borderRadius: 2, margin: '0 auto 20px' }} />

            <h2 className="h3" style={{ marginBottom: 6 }}>☁️ Google Drive Sync</h2>
            <p className="caption" style={{ marginBottom: 20 }}>
              Seus treinos ficam salvos no arquivo <code style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>forge-workout-backup.json</code> no seu Drive.
            </p>

            {!clientId ? (
              /* Setup: needs Client ID */
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Cole seu Google OAuth Client ID:
                </p>
                <input
                  type="text"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={draftId}
                  onChange={e => setDraftId(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
                    color: 'var(--text)', fontFamily: 'inherit',
                    fontSize: 12, padding: '12px', outline: 'none',
                    marginBottom: 12,
                  }}
                />
                <SetupGuide />
                <button
                  className="btn btn-primary w-full"
                  style={{ marginTop: 14 }}
                  onClick={setup}
                  disabled={!draftId.trim()}
                >
                  Salvar e conectar
                </button>
              </div>
            ) : (
              /* Main sync actions */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!authed ? (
                  <button className="btn btn-primary w-full" onClick={handleAuth} disabled={busy}>
                    🔑 Entrar com Google
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary w-full" onClick={handleSave} disabled={busy}>
                      {status === STATUS.saving ? '⏳ Salvando...' : '⬆️ Salvar no Drive'}
                    </button>
                    <button className="btn btn-ghost w-full" onClick={handleLoad} disabled={busy}>
                      {status === STATUS.loading ? '⏳ Carregando...' : '⬇️ Restaurar do Drive'}
                    </button>
                  </>
                )}

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
                    background: status === STATUS.error ? 'rgba(255,59,59,.1)' : 'rgba(6,214,160,.1)',
                    border: `1px solid ${status === STATUS.error ? 'rgba(255,59,59,.2)' : 'rgba(6,214,160,.2)'}`,
                    color: status === STATUS.error ? 'var(--red)' : 'var(--green)',
                    fontSize: 13,
                  }}>
                    {msg}
                  </div>
                )}

                <div className="sep" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="caption" style={{ fontSize: 11 }}>
                    Client ID: …{clientId.slice(-12)}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {authed && (
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 10px' }} onClick={handleSignOut}>
                        Sair
                      </button>
                    )}
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 11, padding: '6px 10px', color: 'var(--text-3)' }}
                      onClick={() => { saveClientId(''); setClientId(''); setDraftId(''); setAuthed(false) }}
                    >
                      Trocar Client ID
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function SetupGuide() {
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 'var(--r-md)',
      padding: 14, fontSize: 12, lineHeight: 1.6, color: 'var(--text-2)',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Como obter o Client ID:</p>
      {[
        'Acesse console.cloud.google.com e crie um projeto',
        'APIs e Serviços → Ativar APIs → ative "Google Drive API"',
        'Credenciais → Criar credencial → ID do cliente OAuth → Aplicativo da Web',
        'Em "Origens JS autorizadas" adicione: http://localhost:5173',
        'Copie o Client ID gerado e cole acima',
      ].map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--grad)', color: '#fff',
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
          }}>
            {i + 1}
          </span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  )
}
