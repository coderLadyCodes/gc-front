import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false)
 
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-color",
      isDark ? "#242424" : "#f5f5f5"
    );
    document.documentElement.style.setProperty(
      "--text-color",
      isDark ? "#f5f5f5" : "#333333"
    );
  }, [isDark])
   

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
