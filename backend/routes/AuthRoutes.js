import express from 'express'
import { changePassword, login, mobLogin, sendOTP, signUp } from '../controllers/AuthC.js';
const router = express.Router()
router.post("/sendOTP",sendOTP);
router.post("/signup",signUp);
router.post("/login",login);
router.post("/mob-login",mobLogin);

router.post("/changepassword",changePassword);
// router.post("/forgotPassword",forgotPassword);


export default router;