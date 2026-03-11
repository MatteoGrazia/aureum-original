import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ isDarkMode: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('aureum_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    document.startViewTransition?.(() => {
      setIsDarkMode(prev => {
        const next = !prev;
        localStorage.setItem('aureum_theme', next ? 'dark' : 'light');
        return next;
      });
    }) ?? setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('aureum_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);