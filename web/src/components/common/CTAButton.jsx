import React from 'react'
import { useSelector } from 'react-redux'

function CTAButton({ children, text, active, onClick, disabled = false, loading = false, type = "button" }) {
  const { loading: globalLoading } = useSelector((state) => state.auth)
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false
  
  // Button is disabled if any loading state is true or explicitly disabled
  const isDisabled = disabled || loading || globalLoading || profileLoading

  const getButtonStyles = () => {
    if (isDisabled) {
      return {
        backgroundColor: '#d1d5db',
        color: '#6b7280',
        cursor: 'not-allowed',
        opacity: '0.5'
      }
    }
    
    if (active) {
      return {
        backgroundColor: '#1197a8',
        color: '#ffffff'
      }
    }
    
    return {
      backgroundColor: 'transparent',
      color: darkMode ? '#ffffff' : '#000000',
      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="px-4 py-2 rounded font-medium transition-all duration-300 relative transform hover:scale-105"
      style={getButtonStyles()}
    >
      {(loading || globalLoading || profileLoading) ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <p className='flex justify-center items-center gap-2'>
          {children} {text}
        </p>
        
      )}
    </button>
  )
}

export default CTAButton
