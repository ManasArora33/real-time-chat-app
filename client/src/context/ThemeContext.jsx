import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Read saved preference from localStorage, default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nexchat-theme');
    return saved ? saved === 'dark' : true;
  });

  // Apply theme class to body and persist preference
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('nexchat-theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('nexchat-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
