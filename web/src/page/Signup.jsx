import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import  toast  from 'react-hot-toast';

// Icons
import { FaGraduationCap } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { setSignupData } from '../Slices/authSlice.js';
import { sendOtp } from '../services/opretions/Auth.js';
// Redux and API imports (Assuming paths from your first file)

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form state managed by a single useState object
  const [formData, setFormData] = useState({
    userName: "",
    accountType: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Added accountType to the state
  });

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Destructure formData for easier access in the JSX
  const { userName,accountType, firstName, lastName, email, password, confirmPassword } = formData;

  // Handle input changes for all fields
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission
  const handleOnSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic validation
    if (!firstName || !lastName || !email || !userName || !password || !confirmPassword || !accountType) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match");
      return;
    }

    // This is the data that will be sent to the backend/redux
    const signupData = { ...formData };
    
    // Dispatch actions to save data and send OTP
    dispatch(setSignupData(signupData));
    dispatch(sendOtp(formData.email, navigate));

    // Reset the form after submission
    setFormData({
      userName: "",
      accountType: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <FaGraduationCap className="mx-auto h-12 w-12 text-teal-600" />
          <h1 className="text-4xl font-bold mt-4 text-gray-800">Create Account</h1>
          <p className="mt-2 text-lg text-gray-600">Join IIITBGP attendance management platform</p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold">Sign Up</h2>
          <p className="text-gray-500 mb-6">Fill in your details to create your account</p>

          <form onSubmit={handleOnSubmit} className="space-y-5">
            {/* First Name and Last Name */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder='Enter First Name'
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder='Enter Last Name'
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder='user@iiitbh.ac.in'
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                required
                type="text"
                name="userName"
                value={userName}
                onChange={handleOnChange}
                placeholder='Username must be unique'
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Create a strong password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            
            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm your password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                required
                name="accountType"
                value={accountType}
                onChange={handleOnChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="font-medium text-teal-600 hover:text-teal-500">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;