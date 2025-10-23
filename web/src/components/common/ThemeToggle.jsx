import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../Slices/themeSlice.js';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const themeState = useSelector((state) => state.theme);
  const darkMode = themeState?.darkMode || false;
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {darkMode ? (
          <FaSun className="w-5 h-5 text-yellow-500 transition-all duration-300 transform" />
        ) : (
          <FaMoon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-all duration-300 transform" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;