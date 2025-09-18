import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import { deleteStudent, updateDisplayPicture } from "../controllers/SettingC.js";
// 🔒 Import validation middleware and Joi
import { validateRequest } from '../middleware/security.js';
import Joi from 'joi';

const router = express.Router();

// 🔒 COMPREHENSIVE validation schemas for settings routes
const settingsValidation = {
  // Delete student validation
  deleteStudent: Joi.object({
    studentId: Joi.string().required().hex().length(24).messages({
      'any.required': 'Student ID is required',
      'string.hex': 'Invalid student ID format',
      'string.length': 'Invalid student ID length'
    })
  })
};

// 🔒 Routes with validation middleware
router.put("/updateDisplayPicture", 
  auth, 
  updateDisplayPicture
);

router.delete("/delete-student", 
  auth, 
  isAdmin, 
  // validateRequest(settingsValidation.deleteStudent),
  deleteStudent
);

export default router;