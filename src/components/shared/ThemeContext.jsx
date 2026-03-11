import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('color-scheme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = async () => {
    setIsTransitioning(true);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        setIsDarkMode(prev => {
          const next = !prev;
          localStorage.setItem('aureum_theme', next ? 'dark' : 'light');
          return next;
        });
      });
      await transition.finished;
    } else {
      setIsDarkMode(prev => {
        const next = !prev;
        localStorage.setItem('aureum_theme', next ? 'dark' : 'light');
        return next;
      });
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setIsTransitioning(false);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: isDarkMode ? 'rgba(8, 8, 8, 0.4)' : 'rgba(245, 245, 247, 0.4)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 24,
                height: 24,
                border: '2px solid transparent',
                borderTopColor: '#D4AF37',
                borderRadius: '50%',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);