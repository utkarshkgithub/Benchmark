import React from 'react'
import { useSelector } from 'react-redux'

function IconBTN(
    {text,
    onClick,
    children,
    disabled = false,
    outline = true,
    customClasses = "",
    active,
    type = "button",
    loading = false,
}
){
  const { loading: globalLoading } = useSelector((state) => state.auth)
  const { loading: profileLoading } = useSelector((state) => state.profile)
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false
  
  // Button is disabled if any loading state is true or explicitly disabled
  const isDisabled = disabled || loading || globalLoading || profileLoading

  return (
    <button
    onClick={onClick}
    disabled={isDisabled}
    type={type}
    style={{
      backgroundColor: isDisabled 
        ? (darkMode ? '#4b5563' : '#d1d5db') 
        : (active ? '#eab308' : (darkMode ? '#374151' : '#f3f4f6')),
      color: isDisabled 
        ? (darkMode ? '#9ca3af' : '#6b7280')
        : (darkMode ? '#f9fafb' : '#111827')
    }}
    className={`${customClasses} py-2 font-medium text-xl px-4 rounded-lg transition-all duration-300 relative ${
      !isDisabled ? "hover:scale-105 transform" : ""
    } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {(loading || globalLoading || profileLoading) ? (
        <div className="flex justify-center items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children ? (
          <div className={`flex justify-center items-center gap-1`}>
            <p className=''>  
              {text}
            </p>
            {children}
          </div>
        ) : (text)
      )}
    </button>
  )
}

export default IconBTN