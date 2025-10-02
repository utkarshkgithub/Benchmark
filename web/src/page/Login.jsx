import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaGraduationCap } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/opretions/Auth';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/common/Button';

const SignIn = () => {
  // State to manage password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  // Handle the form submission
  const onSubmit = (data) => {
    dispatch(login(data.email, data.password, navigate))
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 font-sans h-[calc(100vh-100px)]">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Header Section */}
        <div>
 <h1 className="text-4xl text-center font-bold  text-gray-800">Welcome Back</h1>
          <p className="text-lg text-center text-gray-600">Sign in to your account to continue</p>
        </div>
       
        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username or Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username or Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                {...register('email', { required: 'Username or email is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
              >
                {isPasswordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Button 
                type='button' 
                onClick={handleForgotPassword} 
                variant="outline" 
                size="sm"
                className="text-sm font-medium text-teal-600 hover:underline border-none bg-transparent p-0 hover:bg-transparent hover:scale-100"
              >
                Forgot password?
              </Button>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;