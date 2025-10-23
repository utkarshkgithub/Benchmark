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
  
  // Button is disabled if any loading state is true or explicitly disabled
  const isDisabled = disabled || loading || globalLoading || profileLoading

  return (
    <button
    onClick={onClick}
    disabled={isDisabled}
    type={type}
    className={`${
      isDisabled
        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
        : `text-black dark:text-white ${active ? "bg-yellow-500" : "bg-pure-greys-200"}`
    } ${customClasses} py-2 font-medium text-xl px-4 rounded-lg transition-all duration-300 relative ${
      !isDisabled ? "hover:scale-105 transform" : ""
    }`}
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