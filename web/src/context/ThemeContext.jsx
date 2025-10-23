import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const themeState = useSelector((state) => state.theme);
  const darkMode = themeState?.darkMode || false;

  const getThemeStyles = (lightStyle = {}, darkStyle = {}) => {
    return darkMode ? { ...lightStyle, ...darkStyle } : lightStyle;
  };

  const getTextColor = (primary = true) => {
    if (primary) {
      return darkMode ? '#ffffff' : '#111827';
    }
    return darkMode ? '#d1d5db' : '#6b7280';
  };

  const getBackgroundColor = (variant = 'primary') => {
    switch (variant) {
      case 'primary':
        return darkMode ? '#111827' : '#ffffff';
      case 'secondary':
        return darkMode ? '#1f2937' : '#f9fafb';
      case 'card':
        return darkMode ? '#374151' : '#ffffff';
      default:
        return darkMode ? '#111827' : '#ffffff';
    }
  };

  const getBorderColor = () => {
    return darkMode ? '#4b5563' : '#e5e7eb';
  };

  const theme = {
    darkMode,
    getThemeStyles,
    getTextColor,
    getBackgroundColor,
    getBorderColor,
    colors: {
      text: {
        primary: darkMode ? '#ffffff' : '#111827',
        secondary: darkMode ? '#d1d5db' : '#6b7280',
        muted: darkMode ? '#9ca3af' : '#9ca3af',
      },
      background: {
        primary: darkMode ? '#111827' : '#ffffff',
        secondary: darkMode ? '#1f2937' : '#f9fafb',
        card: darkMode ? '#374151' : '#ffffff',
      },
      border: darkMode ? '#4b5563' : '#e5e7eb',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};