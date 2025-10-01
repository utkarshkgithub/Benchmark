import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className="relative px-4 py-2 text-sm font-semibold transition-all duration-300 group"
    >
      <span className={`relative ${
        isActive 
          ? "text-emerald-600" 
          : "text-gray-700 hover:text-gray-900"
      }`}>
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

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-5 py-3 text-sm font-medium transition-all duration-200 ${
        isActive 
          ? "text-emerald-600 border-l-4 border-emerald-500" 
          : "text-gray-700 hover:text-emerald-600 hover:border-l-4 hover:border-emerald-500/50"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-gray-400 group-hover:bg-emerald-400"
        }`}></div>
        <span>{children}</span>
      </div>
    </Link>
  )
}