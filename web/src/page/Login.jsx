import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/opretions/Auth';
import { useDispatch } from 'react-redux';
import Button from '../components/common/Button';

const SignIn = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  const onSubmit = (data) => {
    dispatch(login(data.email, data.password, navigate))
  };

  return (
    <div className="cb-auth-page">
      <div className="cb-auth-card">
        <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
          secure access
        </p>
        <h1 className="cb-display-tight mt-2 text-4xl font-medium" style={{ color: 'var(--text-primary)' }}>
          Sign in to Benchmark
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Access attendance dashboards and institution workflows.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Institutional email
            </label>
            <input
              type="email"
              placeholder="user@iiitbh.ac.in"
              {...register('email', { required: 'Email is required' })}
              className="cb-input mt-2"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Password
            </label>
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="cb-input mt-2"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              className="absolute right-3 top-[39px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isPasswordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleForgotPassword}
              variant="outline"
              size="sm"
              className="!min-h-[32px] !border-0 !bg-transparent !px-0 !py-0 text-sm !text-[#0667d0] hover:!bg-transparent hover:underline"
            >
              Forgot Password?
            </Button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          No account yet?{' '}
          <Link to="/signup" className="cb-link font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;