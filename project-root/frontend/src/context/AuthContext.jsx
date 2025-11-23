import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext()

const STORAGE_KEY = '4blue_auth_v1'

const defaultUsers = [
  { id: 'A', name: 'Usuário A' },
  { id: 'B', name: 'Usuário B' }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // object { id, name } or null
  const [availableUsers] = useState(defaultUsers)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.user) setUser(parsed.user)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }))
    } catch (e) {}
  }, [user])

  function login(userId) {
    const u = availableUsers.find(x => x.id === userId)
    if (u) setUser(u)
  }

  function logout() {
    setUser(null)
  }

  function switchUser(userId) {
    login(userId)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser, availableUsers }}>
      {children}
    </AuthContext.Provider>
  )
}
