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
    <div className="cb-auth-page">
      {loading ? (
        <div className="text-xl" style={{ color: 'var(--text-primary)' }}>
          Loading...
        </div>
      ) : (
        <div className="cb-auth-card !max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
            verification
          </p>
          <h1 className="cb-display-tight mt-2 text-3xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Verify your email
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter the 6-digit code sent to your inbox to continue onboarding.
          </p>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <form onSubmit={onSubmitHandle} className="mt-6 space-y-5">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              containerStyle={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: '0.5rem'
              }}
              renderInput={(props) => (
                <input
                  {...props}
                  className="cb-input text-center"
                  style={{ paddingLeft: 0, paddingRight: 0, textTransform: 'uppercase' }}
                />
              )}
            />
            <button
              className="cb-pill-btn cb-pill-primary w-full"
              disabled={loading}
            >
              Verify Email
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <Link to="/login" className="cb-link flex items-center gap-2 text-sm font-semibold">
              <FaArrowLeft className="mr-2" /> Back to Login
            </Link>
            <button onClick={OtpHandler} className="cb-link text-sm font-semibold">
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
