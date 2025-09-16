import express from 'express'
import { createSubject, fetchAttendanceBySubject, fetchInstructor,fetchInstructorSubjects,fetchStudent,fetchSubjects, getSubjectStudents } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor, isStudent } from '../middleware/auth.js';
import { fetchStudentAttendance } from '../controllers/getStudentAttendance.js';
import { deleteSubject, generateQr, getAttendanceDetails, getInstructorAttendanceSummary, updateAttendance, verifyQrCode } from '../controllers/AttendanceC.js';

const router = express.Router()


// Admin routes (highest security)
router.post("/create-subject", auth, isAdmin, createSubject);
router.delete("/delete-subject", auth, isAdmin, deleteSubject);

// Instructor routes (high security)
router.post("/qrcode", auth, isInstructor, generateQr);
router.put("/updateAttendance", auth, isInstructor, updateAttendance);
router.post("/getSubjectStudents", auth, isInstructor, getSubjectStudents);
router.post("/getAttendanceDetails", auth, isInstructor, getAttendanceDetails);

// Student routes (main attack vector - protected by rate limiting)

router.get("/student", auth, isStudent, fetchStudentAttendance);

// General fetch routes
router.get("/fetch-instructor", fetchInstructor);
router.get("/fetch-subjects", fetchSubjects);
router.get("/fetch-students", fetchStudent);
router.get("/instructor-subjects", auth, isInstructor, fetchInstructorSubjects);
router.get("/fetch-by-subject/:subjectId", auth, fetchAttendanceBySubject);
router.get("/instructor-summary", auth, getInstructorAttendanceSummary);

export default router;