import React, { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()
const THEME_KEY = '4blue_theme_v1'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light') // 'light' | 'dark'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'dark' || saved === 'light') setTheme(saved)
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (e) {}
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
