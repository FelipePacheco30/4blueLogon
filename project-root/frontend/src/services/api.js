// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || ''
const FORCE_MOCK = (import.meta.env.VITE_FORCE_MOCK === 'true') || API_BASE === ''

/* -------------------------
   Mock store (localStorage)
   ------------------------- */
const STORAGE_KEY = '4blue_mock_messages_v1'

function ensureStore() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  }
}

function readAll() {
  ensureStore()
  const raw = localStorage.getItem(STORAGE_KEY)
  try {
    return JSON.parse(raw) || []
  } catch (e) {
    console.error('failed to parse mock store', e)
    return []
  }
}

function writeAll(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
}

/* Mock implementations */
async function mockGetMessagesByUser(userId) {
  await new Promise((r) => setTimeout(r, 120))
  const all = readAll().filter((m) => m.user === userId)
  all.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return all
}

async function mockPostMessage({ user, text }) {
  await new Promise((r) => setTimeout(r, 260))
  const all = readAll()
  const numericIds = all
    .map((m) => {
      const n = Number(m.id)
      return Number.isFinite(n) ? n : null
    })
    .filter((v) => v !== null)
  const nextId = numericIds.length ? Math.max(...numericIds) + 1 : 1
  const created_at = new Date().toISOString()
  const response_text =
    user === 'A'
      ? 'Obrigado, Usuário A. Em breve nossa equipe retornará.'
      : 'Recebido, Usuário B. Um especialista responderá logo.'

  const userMsg = {
    id: nextId,
    user,
    text,
    response_text: '',
    created_at,
    direction: 'sent',
    viewed: false
  }

  const respMsg = {
    id: `${nextId}-r`,
    user,
    text: response_text,
    response_text: '',
    created_at: new Date(Date.now() + 10).toISOString(),
    direction: 'received',
    viewed: false
  }

  all.push(userMsg, respMsg)
  writeAll(all)

  return {
    id: userMsg.id,
    user: userMsg.user,
    text: userMsg.text,
    response_text,
    created_at: userMsg.created_at
  }
}

async function mockMarkMessagesViewed(userId) {
  await new Promise((r) => setTimeout(r, 120))
  const all = readAll()
  let changed = false
  for (let m of all) {
    if (m.user === userId && (m.direction === 'received' || m.direction === 'sent') && !m.viewed) {
      m.viewed = true
      changed = true
    }
  }
  if (changed) writeAll(all)
  return true
}

async function mockDeleteHistory(userId) {
  await new Promise((r) => setTimeout(r, 160))
  const filtered = readAll().filter((m) => m.user !== userId)
  writeAll(filtered)
  return { ok: true, status: 200 }
}

/* -------------------------
   Helper: callFetchIfAllowed
   - only attempts network fetch if FORCE_MOCK is false AND API_BASE is set.
   - otherwise uses mock immediately and does NOT cause network errors.
*/
async function callFetchIfAllowed(path, options = {}, fallbackFn) {
  if (FORCE_MOCK) {
    return await fallbackFn()
  }
  try {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, options)
    if (!res.ok) {
      // fallback to mock if server returns non-2xx
      return await fallbackFn()
    }
    // try parse json (if there's a body)
    const text = await res.text()
    try {
      return JSON.parse(text || 'null')
    } catch (e) {
      return text
    }
  } catch (e) {
    // network error -> fallback mock (no uncaught exception)
    return await fallbackFn()
  }
}

/* -------------------------
   Exported API functions
   ------------------------- */

export async function getMessagesByUser(userId) {
  return await callFetchIfAllowed(`/api/messages/?user=${encodeURIComponent(userId)}`, { method: 'GET' }, () =>
    mockGetMessagesByUser(userId)
  )
}

export async function postMessage(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('postMessage failed')
    return await res.json()
  } catch (e) {
    console.warn('postMessage fallback', e)
    const now = new Date().toISOString()
    // fallback responses (same sets as backend)
    const responsesA = [
      "Obrigado, Usuário A. Em breve nossa equipe retornará.",
      "Recebemos sua mensagem, Usuário A — já encaminhamos para o time.",
      "Perfeito, Usuário A! Em instantes alguém irá falar com você.",
      "Sua solicitação foi registrada, Usuário A. Acompanhe por aqui.",
      "Obrigado! Um especialista entrará em contato em breve, Usuário A."
    ]
    const responsesB = [
      "Recebido, Usuário B. Um especialista responderá logo.",
      "Mensagem entregue, Usuário B — estamos analisando.",
      "Ótimo, Usuário B. Em breve teremos retorno.",
      "Sua demanda foi registrada, Usuário B. Fique atento às atualizações.",
      "Obrigado, Usuário B. Já repassamos ao time responsável."
    ]
    const resp = payload.user === 'A' ? responsesA[Math.floor(Math.random()*responsesA.length)] : responsesB[Math.floor(Math.random()*responsesB.length)]
    return {
      id: Math.floor(Math.random() * 100000),
      user: payload.user,
      text: payload.text,
      response_text: resp,
      created_at: now,
      response_id: `${Math.floor(Math.random()*100000)}-r`
    }
  }
}


export async function markMessagesViewed(userId) {
  // try backend endpoint, but if FORCE_MOCK or failure -> mockMarkMessagesViewed
  return await callFetchIfAllowed(`/api/messages/mark_viewed/?user=${encodeURIComponent(userId)}`, {
    method: 'POST'
  }, () => mockMarkMessagesViewed(userId))
}

export async function deleteHistory(userId) {
  return await callFetchIfAllowed(`/api/messages/delete_history/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userId })
  }, () => mockDeleteHistory(userId))
}

export default { getMessagesByUser, postMessage, markMessagesViewed, deleteHistory }
