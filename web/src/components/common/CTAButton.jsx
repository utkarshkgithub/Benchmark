import React from 'react'
import { useSelector } from 'react-redux'

function CTAButton({
  children,
  text,
  active,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = ''
}) {
  const { loading: globalLoading } = useSelector((state) => state.auth)
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const isBusy = loading || globalLoading || profileLoading
  const isDisabled = disabled || isBusy
  const isPrimary = active === true || active === 'true'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`cb-pill-btn ${isPrimary ? 'cb-pill-primary' : 'cb-pill-secondary'} ${
        isDisabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
    >
      {isBusy ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <span className='flex items-center justify-center gap-2'>
          {children}
          {text ? <span>{text}</span> : null}
        </span>
      )}
    </button>
  )
}

export default CTAButton
