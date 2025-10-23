// components/Error.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

function Error() {
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <div 
      className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6"
      style={{
        backgroundColor: darkMode ? '#111827' : '#f9fafb'
      }}
    >
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 
        className="mt-4 text-2xl font-semibold text-gray-800"
        style={{
          color: darkMode ? '#f9fafb' : '#1f2937'
        }}
      >
        Page Not Found
      </h2>
      <p 
        className="mt-2 text-gray-600 max-w-md"
        style={{
          color: darkMode ? '#d1d5db' : '#4b5563'
        }}
      >
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default Error;
