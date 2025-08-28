import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaGraduationCap } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/opretions/Auth';
import { useDispatch } from 'react-redux';

const SignIn = () => {
  // State to manage password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle the form submission
  const onSubmit = (data) => {
    dispatch(login(data.email, data.password, navigate))
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <FaGraduationCap className="mx-auto h-12 w-12 text-teal-600" />
          <h1 className="text-4xl font-bold mt-4 text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-lg text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username or Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username or Email</label>
              <input
                type="text"
                placeholder="Enter your username or email"
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
              <a href="#" className="text-sm font-medium text-teal-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
              >
                Sign In
              </button>
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