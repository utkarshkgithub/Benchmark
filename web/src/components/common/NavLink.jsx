import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className="group relative px-1 py-2 text-sm font-semibold transition-colors duration-200"
      style={{ color: isActive ? 'var(--cb-blue)' : 'var(--text-primary)' }}
    >
      <span className="relative">
        {children}
        <span className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-[#0052ff] transition-transform duration-200 ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
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
      className="block rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200"
      style={{
        color: isActive ? 'var(--cb-blue)' : 'var(--text-primary)',
        background: isActive ? 'var(--surface-secondary)' : 'transparent'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? 'var(--cb-blue)' : 'var(--text-secondary)' }}></div>
        <span>{children}</span>
      </div>
    </Link>
  )
}