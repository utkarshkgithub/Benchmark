// Example component demonstrating the global loading button functionality
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../Slices/authSlice'
import Button from '../common/Button'
import CTAButton from '../common/CTAButton'
import IconBTN from '../common/IconBTN'

const LoadingDemo = () => {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  const simulateLoading = () => {
    dispatch(setLoading(true))
    
    // Simulate an API call
    setTimeout(() => {
      dispatch(setLoading(false))
    }, 3000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Global Loading Button Demo</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Current loading state: <strong>{loading ? 'Loading...' : 'Not Loading'}</strong>
        </p>
        
        <Button 
          onClick={simulateLoading}
          variant="primary"
          className="mb-4"
        >
          Trigger 3-second Loading State
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All buttons below will be disabled when loading is true:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="outline">Outline Button</Button>
          
          <CTAButton text="CTA Button" active={true} />
          <CTAButton text="CTA Button Inactive" active={false} />
          
          <IconBTN text="Icon Button" active={true}>
            <span>🚀</span>
          </IconBTN>
          
          <IconBTN text="Icon Button" active={false}>
            <span>📄</span>
          </IconBTN>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• All buttons automatically check the global loading state from Redux</li>
            <li>• When loading is true, buttons are disabled and show loading spinner</li>
            <li>• Individual buttons can also have their own loading prop</li>
            <li>• Prevents multiple form submissions and API calls</li>
            <li>• Provides consistent user experience across the app</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LoadingDemo