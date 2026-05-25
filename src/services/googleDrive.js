const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const FILE_NAME = 'forge-workout-backup.json'
const STORAGE_CLIENT_KEY = 'forge_google_client_id'
const STORAGE_AUTHED_KEY  = 'forge_drive_authed'
const DEFAULT_CLIENT_ID = '803805538838-c8l1rautrqj40pl6erceluu5p9j7e222.apps.googleusercontent.com'

/* ─── OAuth token (in-memory only, expires in 1h) ─── */
let _token = null
let _tokenClient = null

export function getStoredClientId() {
  return localStorage.getItem(STORAGE_CLIENT_KEY) ?? DEFAULT_CLIENT_ID
}
export function saveClientId(id) {
  localStorage.setItem(STORAGE_CLIENT_KEY, id.trim())
}
export function wasPreviouslyAuthed() {
  return !!localStorage.getItem(STORAGE_AUTHED_KEY)
}
function markAuthed() {
  localStorage.setItem(STORAGE_AUTHED_KEY, '1')
}
function clearAuthed() {
  localStorage.removeItem(STORAGE_AUTHED_KEY)
}

/**
 * Initialize GIS token client.
 * prompt='' → silent reconnect if user already granted consent.
 * prompt='select_account' → force account picker (used on manual "Entrar").
 */
export function initGIS(clientId, onToken, onError, prompt = '') {
  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services não carregou. Verifique a conexão.')
    return
  }
  _tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    prompt,
    callback: (resp) => {
      if (resp.error) {
        // silent reconnect failed — not an error worth showing
        if (prompt === '') return
        onError(resp.error)
        return
      }
      _token = resp.access_token
      markAuthed()
      onToken(resp.access_token)
    },
  })
}

/** Request access token — opens Google popup if interaction needed */
export function requestToken() {
  if (!_tokenClient) throw new Error('GIS not initialized')
  _tokenClient.requestAccessToken()
}

/** Attempt silent reconnect (no UI) — works if user already granted consent */
export function requestTokenSilent() {
  if (!_tokenClient) return
  try { _tokenClient.requestAccessToken({ prompt: '' }) } catch { /* silent */ }
}

/** Revoke token and clear session */
export function signOut() {
  if (_token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(_token)
  }
  _token = null
  clearAuthed()
}

/* ─── Drive API helpers ────────────────────────────── */

async function driveRequest(url, options = {}) {
  if (!_token) throw new Error('Não autenticado')
  const resp = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${_token}`, ...options.headers },
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `HTTP ${resp.status}`)
  }
  return resp
}

async function findBackupFile() {
  const resp = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=name%3D'${FILE_NAME}'%20and%20trashed%3Dfalse&spaces=drive&fields=files(id,name,modifiedTime)`
  )
  const data = await resp.json()
  return data.files?.[0] ?? null
}

export async function saveToDrive(data) {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const existing = await findBackupFile()

  if (existing) {
    await driveRequest(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,
      { method: 'PATCH', body: blob, headers: { 'Content-Type': 'application/json' } }
    )
    return existing.id
  }

  const metadata = { name: FILE_NAME, mimeType: 'application/json' }
  const boundary = 'forge_boundary_abc123'
  const multipart = [
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n`,
    `--${boundary}--`,
  ].join('')

  const resp = await driveRequest(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    { method: 'POST', body: multipart, headers: { 'Content-Type': `multipart/related; boundary=${boundary}` } }
  )
  const result = await resp.json()
  return result.id
}

export async function loadFromDrive() {
  const file = await findBackupFile()
  if (!file) return null
  const resp = await driveRequest(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`)
  return resp.json()
}

export function getToken() { return _token }
