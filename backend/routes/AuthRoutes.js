import express from 'express'
import { changePassword, login, sendOTP, signUp } from '../controllers/AuthC.js';
const router = express.Router()
console.log("apich:-0",0)
router.post("/sendOTP",sendOTP);
router.post("/signup",signUp);
router.post("/login",login);
router.post("/changepassword",changePassword);
// router.post("/forgotPassword",forgotPassword);


export default router;