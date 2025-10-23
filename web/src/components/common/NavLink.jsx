import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <Link
      to={to}
      className="relative px-4 py-2 text-sm font-semibold transition-all duration-300 group"
      style={{
        color: isActive 
          ? (darkMode ? '#34d399' : '#059669')  // emerald-400 : emerald-600
          : (darkMode ? '#d1d5db' : '#374151')  // gray-300 : gray-700
      }}
    >
      <span className="relative">
        {children}
        <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 transform origin-left transition-all duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}></span>
      </span>
    </Link>
  )
}

export function MobileNavLink({ to, children, onClick }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4"
      style={{
        color: isActive 
          ? (darkMode ? '#34d399' : '#059669')  // emerald-400 : emerald-600
          : (darkMode ? '#d1d5db' : '#374151'), // gray-300 : gray-700
        borderColor: isActive 
          ? '#10b981'  // emerald-500
          : 'transparent'
      }}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isActive ? '#10b981' : (darkMode ? '#9ca3af' : '#6b7280')
          }}
        ></div>
        <span>{children}</span>
      </div>
    </Link>
  )
}