import express from 'express'
import {  duplicateUsers, login, mobLogin, sendOTP, signUp } from '../controllers/AuthC.js';
import { resetPassword, resetPasswordToken } from '../controllers/ReSetPassword.js';
import { auth } from '../middleware/auth.js';
// 🔒 Import validation middleware and Joi
import { validateRequest } from '../middleware/security.js';
import Joi from 'joi';

const router = express.Router()

// 🔒 COMPREHENSIVE validation schemas for authentication routes
const authValidation = {
  // OTP sending validation
  sendOTP: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    extra: Joi.string().optional().allow('').messages({
      'string.base': 'Extra field must be a string'
    })
  }),
  
  // User signup validation
  signup: Joi.object({
    firstName: Joi.string().required().min(2).max(50).trim().pattern(/^[a-zA-Z\s]+$/).messages({
      'any.required': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces'
    }),
    lastName: Joi.string().required().min(2).max(50).trim().pattern(/^[a-zA-Z\s]+$/).messages({
      'any.required': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces'
    }),
    email: Joi.string().email().required().lowercase().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().min(6).messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match'
    }),
    accountType: Joi.string().required().valid('Student', 'Instructor', 'Admin').messages({
      'any.required': 'Account type is required',
      'any.only': 'Account type must be Student, Instructor, or Admin'
    }),
    otp: Joi.string().required().length(6).pattern(/^\d+$/).messages({
      'any.required': 'OTP is required',
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    }),
    // Additional fields for Student account
    rollNumber: Joi.string().optional().allow('').when('accountType', {
      is: 'Student',
      then: Joi.string().required().messages({
        'any.required': 'Roll number is required for student accounts'
      })
    }),
    semester: Joi.string().optional().allow('').when('accountType', {
      is: 'Student', 
      then: Joi.string().required().messages({
        'any.required': 'Semester is required for student accounts'
      })
    }),
    deviceId: Joi.string().optional().allow('').when('accountType', {
      is: 'Student',
      then: Joi.string().required().messages({
        'any.required': 'Device ID is required for student accounts'
      })
    }),
    branch: Joi.string().optional().allow('').when('accountType', {
      is: 'Student',
      then: Joi.string().required().messages({
        'any.required': 'Branch is required for student accounts'
      })
    }),
    subjects: Joi.array().items(Joi.string().hex().length(24)).optional().default([]).messages({
      'array.base': 'Subjects must be an array',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    }),
    // Additional field for Instructor account
    department: Joi.string().optional().allow('').when('accountType', {
      is: 'Instructor',
      then: Joi.string().required().messages({
        'any.required': 'Department is required for instructor accounts'
      })
    })
  }),
  
  // User login validation
  login: Joi.object({
    email: Joi.string().email().required().lowercase().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().min(1).messages({
      'any.required': 'Password is required',
      'string.min': 'Password cannot be empty'
    })
  }),
  
  // Mobile login validation
  mobLogin: Joi.object({
    email: Joi.string().email().required().lowercase().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().min(1).messages({
      'any.required': 'Password is required',
      'string.min': 'Password cannot be empty'
    }),
    deviceId: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'Device ID cannot exceed 100 characters'
    }),
    additionaldeviceId: Joi.string().optional().allow('').max(100).messages({
      'string.max': 'Additional device ID cannot exceed 100 characters'
    })
  }),
  
  // Reset password token validation
  resetPasswordToken: Joi.object({
    email: Joi.string().email().required().lowercase().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  }),
  
  // Verify OTP and reset password validation
  verifyOTP: Joi.object({
    otp: Joi.string().required().length(6).pattern(/^\d+$/).messages({
      'any.required': 'OTP is required',
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    }),
    password: Joi.string().required().min(6).messages({
      'any.required': 'New password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
    email: Joi.string().email().required().lowercase().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  })
};

// 🔒 Routes with COMPREHENSIVE validation middleware

// OTP routes (high risk for spam)
router.post("/sendOTP", 
  // validateRequest(authValidation.sendOTP),
  sendOTP
);

// Authentication routes (critical security)
router.post("/signup", 
  validateRequest(authValidation.signup),
  signUp
);

router.post("/login", 
  validateRequest(authValidation.login),
  login
);

router.post("/mob-login", 
  validateRequest(authValidation.mobLogin),
  mobLogin
);

// Password reset routes (security sensitive)
router.post("/reset-password-token", 
  validateRequest(authValidation.resetPasswordToken),
  resetPasswordToken
);

router.post("/verifyotp", 
  validateRequest(authValidation.verifyOTP),
  resetPassword
);

// Admin route (protected)
router.get("/get-duplicates", 
  auth, // Only authenticated users can access
  duplicateUsers
);

export default router;