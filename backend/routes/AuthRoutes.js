import express from 'express'
import {  login, mobLogin, sendOTP, signUp } from '../controllers/AuthC.js';
import { resetPassword, resetPasswordToken } from '../controllers/ReSetPassword.js';
import { auth } from '../middleware/auth.js';
const router = express.Router()
router.post("/sendOTP",sendOTP);
router.post("/signup",signUp);
router.post("/login",login);
router.post("/mob-login",mobLogin);
router.post("/reset-password-token",resetPasswordToken);
router.post("/verifyotp",resetPassword);
// router.post("/changepassword",auth,changePassword);
// router.post("/forgotPassword",forgotPassword);


export default router;