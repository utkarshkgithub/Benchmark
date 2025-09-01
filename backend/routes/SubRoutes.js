import express from 'express'
import { createSubject, fetchInstructor } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor } from '../middleware/auth.js';
import { generateQr } from '../controllers/AttendenceC.js';
const router = express.Router()

router.post("/create-subject",auth,isAdmin,createSubject);
router.get("/fetch-instructor",fetchInstructor)
router.post("/qrcode",auth,isInstructor,generateQr)
export default router;