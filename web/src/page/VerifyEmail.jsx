import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import OtpInput from "react-otp-input";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { sendOtp, signUp } from "../services/opretions/Auth.js";
import { setSignupData } from "../Slices/authSlice.js";

function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signupData, loading } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);

  const onSubmitHandle = (e) => {
    e.preventDefault();
    if (!signupData) return;

    if (signupData.accountType !== "Admin") {
      const updatedData = { ...signupData, otp };
      dispatch(setSignupData(updatedData));
      navigate("/personal-details");
    } else {
      const { accountType, firstName, lastName, email, password, confirmPassword } = signupData;
      dispatch(signUp(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate));
    }
  };

  const OtpHandler = async (e) => {
    e.preventDefault();
    try {
      const { email } = signupData || {};
      await dispatch(sendOtp(email, navigate));
    } catch {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen mt-20 flex items-center justify-center bg-gray-900 text-white">
      {loading ? (
        <div className="text-xl">Loading...</div>
      ) : (
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Verify Email</h1>
          <p className="mb-4">A verification code has been sent to your email. Enter the code below:</p>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={onSubmitHandle} className="space-y-4">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span>-</span>}
              renderInput={(props) => (
                <input {...props} className="text-center border-2 mx-2 rounded-md text-white" />
              )}
            />
            <button
              className="w-full py-2 px-4 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700"
              disabled={loading}
            >
              Verify Email
            </button>
          </form>

          <div className="mt-4 flex justify-between items-center">
            <Link to="/login" className="flex items-center text-blue-400 hover:underline">
              <FaArrowLeft className="mr-2" /> Back to Login
            </Link>
            <button onClick={OtpHandler} className="text-blue-400 hover:underline">
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
