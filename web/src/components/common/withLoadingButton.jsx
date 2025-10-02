import React from 'react'
import { useSelector } from 'react-redux'

// Higher-order component to wrap any button with loading functionality
const withLoadingButton = (WrappedComponent) => {
  return function LoadingButton(props) {
    const { loading: globalLoading } = useSelector((state) => state.auth)
    const { loading: profileLoading } = useSelector((state) => state.profile)
    
    // Button is disabled if any loading state is true or explicitly disabled
    const isDisabled = props.disabled || props.loading || globalLoading || profileLoading
    const isLoading = props.loading || globalLoading || profileLoading

    return (
      <WrappedComponent
        {...props}
        disabled={isDisabled}
        loading={isLoading}
        style={{
          ...(props.style || {}),
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      />
    )
  }
}

export default withLoadingButton

// Create wrapped versions of common HTML elements
export const LoadingButton = withLoadingButton('button')
export const LoadingInput = withLoadingButton('input')