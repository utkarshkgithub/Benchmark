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
      className="relative p-2 rounded-full"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {darkMode ? (
          <FaSun className="w-5 h-5 text-yellow-500" />
        ) : (
          <FaMoon className="w-5 h-5 text-gray-700 dark:text-gray-900" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;