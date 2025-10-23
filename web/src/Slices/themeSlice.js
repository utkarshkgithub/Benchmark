import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      // Update localStorage to persist theme preference
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    },
    initializeTheme: (state) => {
      // Check localStorage for saved theme preference
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        state.darkMode = JSON.parse(savedTheme);
      } else {
        // Default to light mode instead of system preference
        state.darkMode = false;
      }
      localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
    }
  },
});

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;