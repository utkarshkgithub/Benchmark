import express from 'express'
import {  duplicateUsers, login, mobLogin, sendOTP, signUp } from '../controllers/AuthC.js';
import { resetPassword, resetPasswordToken } from '../controllers/ReSetPassword.js';
import { auth } from '../middleware/auth.js';

const router = express.Router()

// 🔒 Routes with basic security (rate limiting applied in main app)

// OTP routes (protected by rate limiting)
router.post("/sendOTP", sendOTP);

// Authentication routes (protected by rate limiting)
router.post("/signup", signUp);
router.post("/login", login);
router.post("/mob-login", mobLogin);

// Password reset routes (protected by rate limiting)
router.post("/reset-password-token", resetPasswordToken);
router.post("/verifyotp", resetPassword);

// Admin route (protected by auth)
router.get("/get-duplicates", auth, duplicateUsers);

export default router;