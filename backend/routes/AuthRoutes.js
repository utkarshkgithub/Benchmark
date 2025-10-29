import express from 'express'
import {  duplicateUsers, login, mobLogin, sendOTP, signUp } from '../controllers/AuthC.js';
import { resetPassword, resetPasswordToken } from '../controllers/ReSetPassword.js';
import { auth } from '../middleware/auth.js';

const router = express.Router()

router.post("/sendOTP", 
  sendOTP
);

router.post("/signup", 
  signUp
);

router.post("/login", 
  login
);

router.post("/mob-login", 
  mobLogin
);

router.post("/reset-password-token", 
  resetPasswordToken
);

router.post("/verifyotp", 
  resetPassword
);

router.get("/get-duplicates", 
  auth,
  duplicateUsers
);

export default router;