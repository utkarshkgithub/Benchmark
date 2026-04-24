import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { setSignupData } from '../Slices/authSlice.js';
import { sendOtp } from '../services/opretions/Auth.js';
import Button from '../components/common/Button.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    accountType: "Instructor",
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
    <div className="cb-auth-page">
      <div className="cb-auth-card !max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
          onboarding
        </p>
        <h1 className="cb-display-tight mt-2 text-4xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Create your Benchmark account
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Start with OTP verification and continue with role-specific profile setup.
        </p>

        <form onSubmit={handleOnSubmit} className="mt-7 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={handleOnChange}
                required
                placeholder="Amit"
                className="cb-input mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={handleOnChange}
                required
                placeholder="Kumar"
                className="cb-input mt-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Institutional email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleOnChange}
              required
              placeholder="user@iiitbh.ac.in"
              className="cb-input mt-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleOnChange}
                required
                placeholder="Create a strong password"
                className="cb-input mt-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[39px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Confirm password
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                required
                placeholder="Re-enter password"
                className="cb-input mt-2"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[39px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Account type defaults to Instructor during registration.
          </p>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Continue with OTP
          </Button>
        </form>

        <p className="mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="cb-link font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
