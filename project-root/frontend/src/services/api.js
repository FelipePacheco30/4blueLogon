// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Helper: low-level fetch wrapper that throws on non-2xx and returns parsed json
async function safeFetch(url, opts = {}) {
  const full = url.startsWith('http') ? url : `${API_BASE}${url}`
  const defaultOpts = {
    headers: {
      Accept: 'application/json',
    },
    // NOTE: do NOT set credentials by default. If you need cookies/auth, set
    // VITE_API_USE_CREDENTIALS=true and handle CORS on Django (see README).
    credentials: (import.meta.env.VITE_API_USE_CREDENTIALS === 'true') ? 'include' : 'omit',
    ...opts,
  }

  try {
    const res = await fetch(full, defaultOpts)
    const text = await res.text()
    let body = null
    try { body = text ? JSON.parse(text) : null } catch (e) { body = text }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${res.statusText}`)
      err.status = res.status
      err.body = body
      throw err
    }
    return body
  } catch (e) {
    // propagate a clear object the frontend can log
    throw { url: full, opts: defaultOpts, error: e }
  }
}

/* -------------------------
   Helpers for DRF-style paginated endpoints
   ------------------------- */
async function fetchAllPages(pathWithQuery = '') {
  // pathWithQuery = '/api/messages/?user=A' or '/api/messages/?user=A&page=2'
  let out = []
  let next = `${API_BASE}${pathWithQuery}`
  while (next) {
    // call using full url: safeFetch accepts full urls
    const parsed = await safeFetch(next, { method: 'GET' })
    // DRF paginated response: { count, next, previous, results: [...] }
    if (Array.isArray(parsed)) {
      // If backend returned array (non-paginated) just return it
      out = out.concat(parsed)
      break
    } else if (parsed && Array.isArray(parsed.results)) {
      out = out.concat(parsed.results)
      next = parsed.next || null
    } else {
      // unexpected shape: try to return what we have
      break
    }
  }
  return out
}

/* -------------------------
   Exported API functions (real backend)
   ------------------------- */

/**
 * getMessagesByUser(userId)
 * Returns an ARRAY of message objects (flattened across pages)
 */
export async function getMessagesByUser(userId) {
  if (!userId) return []
  const q = `/api/messages/?user=${encodeURIComponent(userId)}`
  return await fetchAllPages(q)
}

/**
 * postMessage(payload)
 * payload: { user: 'A'|'B'|..., userName?: 'Display Name', text: '...' }
 * returns parsed JSON from backend or throws
 */
export async function postMessage(payload) {
  if (!payload || !payload.user || !payload.text) {
    throw new Error('postMessage expects payload with user and text')
  }
  try {
    return await safeFetch(`/api/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    // rethrow so caller can catch and surface
    throw err
  }
}

/**
 * markMessagesViewed(userId)
 * backend endpoint expects POST to /api/messages/mark_viewed/?user=...
 * returns parsed JSON from backend
 */
export async function markMessagesViewed(userId) {
  if (!userId) return null
  try {
    return await safeFetch(`/api/messages/mark_viewed/?user=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Accept: 'application/json' }
    })
  } catch (err) {
    throw err
  }
}

/**
 * deleteHistory(userId)
 * backend expects POST to /api/messages/delete_history/ with body {"user": "..."}
 */
export async function deleteHistory(userId) {
  if (!userId) throw new Error('deleteHistory requires userId')
  try {
    return await safeFetch(`/api/messages/delete_history/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify({ user: userId })
    })
  } catch (err) {
    throw err
  }
}

export default { getMessagesByUser, postMessage, markMessagesViewed, deleteHistory }
