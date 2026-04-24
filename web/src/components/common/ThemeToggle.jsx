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
      className="cb-pill-btn cb-pill-secondary !min-h-[40px] !px-3 !py-2"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {darkMode ? (
          <FaSun className="h-4 w-4 text-amber-500" />
        ) : (
          <FaMoon className="h-4 w-4 text-[#0a0b0d]" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;