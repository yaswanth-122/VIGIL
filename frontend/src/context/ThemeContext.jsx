import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Theme state: 'auto' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('vigil_theme') || 'auto';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('dark');

  useEffect(() => {
    localStorage.setItem('vigil_theme', themeMode);

    const updateEffectiveTheme = () => {
      let resolved = themeMode;
      if (themeMode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      }
      setEffectiveTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    };

    updateEffectiveTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'auto') updateEffectiveTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
