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
    qr_data: Joi.string().required().messages({
      'any.required': 'QR code data is required'
    })
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
    }),
    branches: Joi.array().items(Joi.string().min(1).max(50)).required().min(1).messages({
      'any.required': 'At least one branch is required',
      'array.min': 'At least one branch must be selected',
      'string.min': 'Branch name cannot be empty',
      'string.max': 'Branch name cannot exceed 50 characters'
    }),
    instructor: Joi.string().required().hex().length(24).messages({
      'any.required': 'Instructor is required',
      'string.hex': 'Invalid instructor ID format',
      'string.length': 'Invalid instructor ID length'
    }),
    semester: Joi.string().required().min(1).max(10).messages({
      'any.required': 'Semester is required',
      'string.min': 'Semester cannot be empty',
      'string.max': 'Semester cannot exceed 10 characters'
    }),
    isMinor: Joi.boolean().optional().default(false).messages({
      'boolean.base': 'isMinor must be a boolean value'
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

  // Delete subject validation
  deleteSubject: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format', 
      'string.length': 'Invalid subject ID length'
    })
  }),

  // Update attendance validation
  updateAttendance: Joi.object({
    attendanceId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Attendance ID is required',
      'string.hex': 'Invalid attendance ID format',
      'string.length': 'Invalid attendance ID length'
    }),
    studentId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Student ID is required',
      'string.hex': 'Invalid student ID format',
      'string.length': 'Invalid student ID length'
    }),
    action: Joi.string().required().valid('present', 'absent').messages({
      'any.required': 'Action is required',
      'any.only': 'Action must be either "present" or "absent"'
    })
  }),

  // Get subject students validation
  getSubjectStudents: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),

  // Get attendance details validation
  getAttendanceDetails: Joi.object({
    attendanceId: Joi.string().required().hex().length(24).messages({
      'any.required': 'attendance ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
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
  validateRequest(attendanceValidation.deleteSubject),
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
  validateRequest(attendanceValidation.updateAttendance),
  updateAttendance
);

router.post("/getSubjectStudents", 
  auth, 
  isInstructor, 
  validateRequest(attendanceValidation.getSubjectStudents),
  getSubjectStudents
);

router.post("/getAttendanceDetails", 
  auth, 
  isInstructor, 
  validateRequest(attendanceValidation.getAttendanceDetails),
  getAttendanceDetails
);

// Student routes (medium security - main attack vector)
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