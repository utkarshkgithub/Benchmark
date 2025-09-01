import express from 'express'
import { createSubject } from '../controllers/SubjectC.js';
import { auth, isAdmin } from '../middleware/auth.js';
const router = express.Router()

router.post("/create-subject",auth,isAdmin,createSubject);


export default router;