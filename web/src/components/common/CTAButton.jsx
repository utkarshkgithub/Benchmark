import React from 'react'
import { useSelector } from 'react-redux'

function CTAButton({ children, text, active, onClick, disabled = false, loading = false, type = "button" }) {
  const { loading: globalLoading } = useSelector((state) => state.auth)
  const { loading: profileLoading } = useSelector((state) => state.profile)
  
  // Button is disabled if any loading state is true or explicitly disabled
  const isDisabled = disabled || loading || globalLoading || profileLoading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`px-4 py-2 rounded font-medium transition-all duration-300 relative ${
        isDisabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
          : active
          ? "text-white bg-[#1197a8] hover:bg-[#0faabe] transform hover:scale-105"
          : "bg-transparent text-black dark:text-white hover:text-white hover:bg-blue-400 border-[1px] border-black/20 transform hover:scale-105"
      }`}
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
