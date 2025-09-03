import express from 'express'
import { createSubject, fetchAttendanceBySubject, fetchInstructor,fetchInstructorSubjects,fetchSubjects } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor, isStudent } from '../middleware/auth.js';
import { generateQr, verifyQrCode } from '../controllers/AttendenceC.js';
import { fetchStudentAttendance } from '../controllers/getStudentAttendance.js';
const router = express.Router()

router.post("/create-subject",auth,isAdmin,createSubject);
router.get("/fetch-instructor",fetchInstructor)
router.post("/qrcode",auth,isInstructor,generateQr)
router.post("/verifyqrcode",auth,isStudent,verifyQrCode);
router.get("/fetch-subjects",fetchSubjects)
router.get("/student", auth,isStudent, fetchStudentAttendance);
router.get("/instructor-subjects", auth, isInstructor, fetchInstructorSubjects);
router.get("/fetch-by-subject/:subjectId", auth, fetchAttendanceBySubject);
export default router;