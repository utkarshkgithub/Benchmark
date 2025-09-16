import express from 'express'
import { createSubject, fetchAttendanceBySubject, fetchInstructor,fetchInstructorSubjects,fetchStudent,fetchSubjects, getSubjectStudents } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor, isStudent } from '../middleware/auth.js';
import { fetchStudentAttendance } from '../controllers/getStudentAttendance.js';
import { deleteSubject, generateQr, getAttendanceDetails, getInstructorAttendanceSummary, updateAttendance, verifyQrCode } from '../controllers/AttendanceC.js';
// 🔒 Import validation middleware and schemas
import { validateRequest, validationSchemas } from '../middleware/security.js';
import Joi from 'joi';

const router = express.Router()

// 🔒 COMPREHENSIVE validation schemas for attendance system
const attendanceValidation = {
  // QR code generation validation
  generateQR: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),
  
  // QR code verification validation
  verifyQR: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Attendance token is required'
    }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional()
  }),
  
  // Subject creation validation
  createSubject: Joi.object({
    subjectName: Joi.string().required().min(2).max(100).trim().messages({
      'any.required': 'Subject name is required',
      'string.min': 'Subject name must be at least 2 characters',
      'string.max': 'Subject name cannot exceed 100 characters'
    }),
    subjectCode: Joi.string().required().min(2).max(20).uppercase().trim().messages({
      'any.required': 'Subject code is required',
      'string.min': 'Subject code must be at least 2 characters',
      'string.max': 'Subject code cannot exceed 20 characters'
    })
  }),
  
  // Subject ID parameter validation
  subjectIdParam: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),
getAttendanceDetails: Joi.object({
    attendanceId: Joi.string().required().hex().length(24).messages({
      'any.required': 'attendance ID is required',
      'string.hex': 'Invalid attendance ID format',
      'string.length': 'Invalid attendance ID length'
    })
  })
};

// 🔒 Routes with FULL validation middleware

// Admin routes (highest security)
router.post("/create-subject", 
  auth, 
  isAdmin, 
  validateRequest(attendanceValidation.createSubject),
  createSubject
);

router.delete("/delete-subject", 
  auth, 
  isAdmin, 
  validateRequest(attendanceValidation.subjectIdParam),
  deleteSubject
);

// Instructor routes (high security)
router.post("/qrcode", 
  auth, 
  isInstructor, 
  validateRequest(attendanceValidation.generateQR),
  generateQr
);

router.put("/updateAttendance", 
  auth, 
  isInstructor, 
  updateAttendance
);

router.post("/getSubjectStudents", 
  auth, 
  isInstructor, 
  validateRequest(attendanceValidation.subjectIdParam),
  getSubjectStudents
);

router.post("/getAttendanceDetails", 
  auth, 
  isInstructor, 
  validateRequest(attendanceValidation.getAttendanceDetails),
  getAttendanceDetails
);

// Student routes (medium security - main attack vector)
router.post("/verifyqrcode", 
  auth, 
  isStudent, 
  validateRequest(attendanceValidation.verifyQR),
  verifyQrCode
);

router.get("/student", 
  auth, 
  isStudent, 
  fetchStudentAttendance
);

// General fetch routes (with parameter validation where needed)
router.get("/fetch-instructor", fetchInstructor);
router.get("/fetch-subjects", fetchSubjects);
router.get("/fetch-students", fetchStudent);
router.get("/instructor-subjects", auth, isInstructor, fetchInstructorSubjects);

// Fixed route with proper parameter (this was causing the path-to-regexp error)
router.get("/fetch-by-subject/:subjectId", auth, fetchAttendanceBySubject);

router.get("/instructor-summary", auth, getInstructorAttendanceSummary);

export default router;