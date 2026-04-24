import React from 'react'
import { useSelector } from 'react-redux'

function Button({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  type = "button", 
  variant = "primary", 
  size = "md",
  className = "",
  ...props 
}) {
  const { loading: globalLoading } = useSelector((state) => state.auth)
  const { loading: profileLoading } = useSelector((state) => state.profile)

  const isDisabled = disabled || loading || globalLoading || profileLoading

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200'

  const variants = {
    primary: 'cb-pill-btn cb-pill-primary',
    secondary: 'cb-pill-btn cb-pill-secondary',
    danger: 'cb-pill-btn bg-[#0a0b0d] border border-[#0a0b0d] text-white hover:bg-[#282b31] hover:border-[#282b31]',
    success: 'cb-pill-btn cb-pill-primary',
    outline: 'cb-pill-btn bg-transparent border border-[#0052ff] text-[#0052ff] hover:bg-[#eef0f3]'
  }

  const sizes = {
    sm: 'min-h-10 px-4 py-2 text-sm',
    md: 'min-h-11 px-5 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base',
    xl: 'min-h-14 px-8 py-3.5 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
      {...props}
    >
      {(loading || globalLoading || profileLoading) ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button