import express from 'express'
import { createSubject, fetchAttendanceBySubject, fetchInstructor,fetchInstructorSubjects,fetchStudent,fetchSubjects, getSubjectStudents } from '../controllers/SubjectC.js';
import { auth, isAdmin, isInstructor, isStudent } from '../middleware/auth.js';
import { fetchStudentAttendance } from '../controllers/getStudentAttendance.js';
import { deleteSubject, generateQr, getAttendanceDetails, getInstructorAttendanceSummary, updateAttendance, verifyQrCode } from '../controllers/AttendanceC.js';
import { validateRequest, validationSchemas } from '../middleware/security.js';
import Joi from 'joi';

const router = express.Router()

const attendanceValidation = {
  generateQR: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),
  

  verifyQR: Joi.object({
    qr_data: Joi.string().required().messages({
      'any.required': 'QR code data is required'
    })
  }),
  

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
  

  subjectIdParam: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),


  deleteSubject: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format', 
      'string.length': 'Invalid subject ID length'
    })
  }),


  updateAttendance: Joi.object({
     attendanceId: Joi.string().required().hex().length(24).messages({
    'any.required': 'Attendance ID is required',
    'string.hex': 'Invalid attendance ID format',
    'string.length': 'Invalid attendance ID length'
  }),
  updatedStudents: Joi.object().pattern(
    Joi.string().hex().length(24),
    Joi.boolean()
  ).required().messages({
    'any.required': 'Updated students are required',
    'object.base': 'Updated students must be an object with student IDs as keys'
  })
  }),


  getSubjectStudents: Joi.object({
    subjectId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Subject ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  }),


  getAttendanceDetails: Joi.object({
    attendanceId: Joi.string().required().hex().length(24).messages({
      'any.required': 'attendance ID is required',
      'string.hex': 'Invalid subject ID format',
      'string.length': 'Invalid subject ID length'
    })
  })
};

// Admin routes
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

// Instructor routes
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
 

// router.post("/verifyqrcode", 
//   auth, 
//   isStudent, 
//   validateRequest(attendanceValidation.verifyQR),
//   verifyQrCode
// );
router.post("/verifyqrcode", auth, isStudent, verifyQrCode);

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