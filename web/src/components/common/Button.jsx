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
  
  // Button is disabled if any loading state is true or explicitly disabled
  const isDisabled = disabled || loading || globalLoading || profileLoading

  const baseClasses = "font-medium rounded-lg transition-all duration-300 relative flex items-center justify-center gap-2"
  
  const variants = {
    primary: isDisabled 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
      : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105",
    secondary: isDisabled 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
      : "bg-gray-200 text-gray-800 hover:bg-gray-300 transform hover:scale-105",
    danger: isDisabled 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
      : "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105",
    success: isDisabled 
      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
      : "bg-green-600 text-white hover:bg-green-700 transform hover:scale-105",
    outline: isDisabled 
      ? "border border-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
      : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transform hover:scale-105"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
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