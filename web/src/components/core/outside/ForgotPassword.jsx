import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { getPasswordResetToken } from '../../../services/opretions/Auth';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");                 // ✅ Added
  const [newPassword, setNewPassword] = useState(""); // ✅ Added
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ Added

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(getPasswordResetToken(email, setEmailSent));
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Resetting password with:", { email, otp, newPassword });
    // ✅ Call API for reset password here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {loading ? (
        <div className="text-center text-lg font-semibold">Loading...</div>
      ) : !emailSent ? (
        <div className="px-4 rounded flex flex-col gap-[12px] shadow-md w-full max-w-md bg-white">
          <h1 className="text-2xl text-black font-bold">Reset Your Password</h1>
          <p className="text-black font-normal text-[18px] leading-[26px]">
            Have no fear. We’ll email you instructions to reset your password.
          </p>
          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black ">
                Email Address
              </label>
              <input
                required
                id="email"
                type="email"
                placeholder="myemailaddress@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700"
            >
              Send OTP
            </button>
          </form>
          <div className="mt-4 flex items-center text-blue-600 hover:underline">
            <FaArrowLeft className="mr-2" />
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 rounded shadow-md w-full max-w-md flex flex-col gap-4 bg-white">
          <h1 className="text-2xl text-black font-bold">Enter OTP</h1>
          <p className="text-black text-[16px]">
            Enter the OTP sent to your email and set a new password.
          </p>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-black">
                OTP
              </label>
              <input
                required
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-black">
                New Password
              </label>
              <input
                required
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                Confirm Password
              </label>
              <input
                required
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
            >
              Reset Password
            </button>
          </form>
          <div className="mt-4 flex items-center text-blue-600 hover:underline">
            <FaArrowLeft className="mr-2" />
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
