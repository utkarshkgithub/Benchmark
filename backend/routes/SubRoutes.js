import express from 'express'
import { createSubject, fetchInstructor,fetchSubjects } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor, isStudent } from '../middleware/auth.js';
import { generateQr, verifyQrCode } from '../controllers/AttendenceC.js';
const router = express.Router()

router.post("/create-subject",auth,isAdmin,createSubject);
router.get("/fetch-instructor",fetchInstructor)
router.post("/qrcode",auth,isInstructor,generateQr)
router.post("/verifyqrcode",auth,isStudent,verifyQrCode);
router.get("/fetch-subjects",fetchSubjects)
export default router;