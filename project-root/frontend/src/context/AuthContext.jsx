// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

const USERS_STORAGE = '4blue_users_v1'
const SESSION_STORAGE = '4blue_session_v1'

// default users
const DEFAULT_USERS = [
  { id: 'A', name: 'Usuário A', defaultName: 'Usuário A', hasPassword: false },
  { id: 'B', name: 'Usuário B', defaultName: 'Usuário B', hasPassword: false }
]

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE)
    if (!raw) return DEFAULT_USERS.slice()
    const parsed = JSON.parse(raw)
    // ensure defaults exist
    const merged = DEFAULT_USERS.map(d => {
      const found = Array.isArray(parsed) ? parsed.find(p => p.id === d.id) : null
      return found ? { ...d, ...found } : d
    })
    // include any extra accounts created previously
    const extras = Array.isArray(parsed) ? parsed.filter(p => !merged.find(m => m.id === p.id)) : []
    return [...merged, ...extras]
  } catch (e) {
    console.error('AuthContext: failed to read users', e)
    return DEFAULT_USERS.slice()
  }
}

function writeUsers(arr) {
  try {
    localStorage.setItem(USERS_STORAGE, JSON.stringify(arr))
  } catch (e) {
    console.warn('AuthContext: failed to write users', e)
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function writeSession(obj) {
  try {
    if (!obj) localStorage.removeItem(SESSION_STORAGE)
    else localStorage.setItem(SESSION_STORAGE, JSON.stringify(obj))
  } catch (e) {
    console.warn('AuthContext: failed to write session', e)
  }
}

export function AuthProvider({ children }) {
  const [availableUsers, setAvailableUsers] = useState(() => readUsers())
  const [user, setUser] = useState(() => readSession())

  // persist users whenever they change
  useEffect(() => {
    writeUsers(availableUsers)
  }, [availableUsers])

  // persist session whenever it changes
  useEffect(() => {
    writeSession(user)
  }, [user])

  const login = useCallback(async (userId) => {
    // since A/B have no password, selecting is enough.
    const u = availableUsers.find(x => x.id === userId)
    if (!u) return null
    // session shape can be minimal; keep name copy for easy display
    const session = { id: u.id, name: u.name }
    setUser(session)
    return session
  }, [availableUsers])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchUser = useCallback((userId) => {
    // switch selection in UI (not same as login)
    const u = availableUsers.find(x => x.id === userId)
    if (!u) return
    setUser({ id: u.id, name: u.name })
  }, [availableUsers])

  const updateUserName = useCallback((userId, newName) => {
    if (!userId) return false
    setAvailableUsers(prev => {
      const next = prev.map(u => (u.id === userId ? { ...u, name: newName } : u))
      return next
    })
    // if current session is the same user, update session name too
    setUser(prev => (prev && prev.id === userId ? { ...prev, name: newName } : prev))
    return true
  }, [])

  const resetUserName = useCallback((userId) => {
    if (!userId) return false
    setAvailableUsers(prev => {
      const next = prev.map(u => (u.id === userId ? { ...u, name: u.defaultName || `Usuário ${u.id}` } : u))
      return next
    })
    setUser(prev => (prev && prev.id === userId ? { ...prev, name: (availableUsers.find(u=>u.id===userId)?.defaultName || `Usuário ${userId}`) } : prev))
    return true
  }, [availableUsers])

  // helper to add a new account (visual only; no password flow here)
  const addAccount = useCallback((id, name) => {
    setAvailableUsers(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, name, defaultName: name, hasPassword: false }]
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      availableUsers,
      user,
      login,
      logout,
      switchUser,
      updateUserName,
      resetUserName,
      addAccount,
      setAvailableUsers
    }}>
      {children}
    </AuthContext.Provider>
  )
}
