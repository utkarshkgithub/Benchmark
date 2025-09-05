import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Icons
import { FaGraduationCap } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { setSignupData } from '../Slices/authSlice.js';
import { sendOtp } from '../services/opretions/Auth.js';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    accountType: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { accountType, firstName, lastName, email, password, confirmPassword } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(setSignupData(formData));
    dispatch(sendOtp(formData.email, navigate));
  };

  return (
    <div className="flex items-center justify-center  bg-gray-100 font-sans">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mt-4 text-gray-800">Create Account</h1>
          <p className="mt-2 text-lg text-gray-600">Join IIITBGP attendance management platform</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold">Sign Up</h2>
          <p className="text-gray-500 mb-6">Fill in your details to create your account</p>

          <form onSubmit={handleOnSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  required
                  placeholder="Enter First Name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  required
                  placeholder="Enter Last Name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                required
                placeholder="user@iiitbh.ac.in"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
<div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                required
                placeholder="Create a strong password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <div className="relative w-full">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                required
                placeholder="Confirm your password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
</div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                name="accountType"
                value={accountType}
                onChange={handleOnChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-lg font-medium text-white bg-teal-600 hover:bg-teal-700"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-teal-600 hover:text-teal-500">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
