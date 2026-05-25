const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const FILE_NAME = 'forge-workout-backup.json'
const STORAGE_CLIENT_KEY = 'forge_google_client_id'
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

/** Initialize Google Identity Services token client */
export function initGIS(clientId, onToken, onError) {
  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services não carregou. Verifique a conexão.')
    return
  }
  _tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error) { onError(resp.error); return }
      _token = resp.access_token
      onToken(resp.access_token)
    },
  })
}

/** Request access token (opens Google popup) */
export function requestToken() {
  if (!_tokenClient) throw new Error('GIS not initialized')
  _tokenClient.requestAccessToken()
}

/** Revoke token and clear session */
export function signOut() {
  if (_token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(_token)
  }
  _token = null
}

/* ─── Drive API helpers ────────────────────────────── */

async function driveRequest(url, options = {}) {
  if (!_token) throw new Error('Não autenticado')
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${_token}`,
      ...options.headers,
    },
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `HTTP ${resp.status}`)
  }
  return resp
}

/** Find the backup file id, or null */
async function findBackupFile() {
  const resp = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=name%3D'${FILE_NAME}'%20and%20trashed%3Dfalse&spaces=drive&fields=files(id,name,modifiedTime)`
  )
  const data = await resp.json()
  return data.files?.[0] ?? null
}

/** Save data object → Drive JSON file (create or update) */
export async function saveToDrive(data) {
  const content = JSON.stringify(data, null, 2)
  const blob = new Blob([content], { type: 'application/json' })

  const existing = await findBackupFile()

  if (existing) {
    // PATCH content only (metadata stays the same)
    await driveRequest(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,
      { method: 'PATCH', body: blob, headers: { 'Content-Type': 'application/json' } }
    )
    return existing.id
  }

  // Multipart upload: metadata + content
  const metadata = { name: FILE_NAME, mimeType: 'application/json' }
  const boundary = 'forge_boundary_abc123'
  const multipart = [
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n`,
    `--${boundary}--`,
  ].join('')

  const resp = await driveRequest(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      body: multipart,
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    }
  )
  const result = await resp.json()
  return result.id
}

/** Load data from Drive backup file */
export async function loadFromDrive() {
  const file = await findBackupFile()
  if (!file) return null
  const resp = await driveRequest(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
  )
  return resp.json()
}

export function getToken() { return _token }
