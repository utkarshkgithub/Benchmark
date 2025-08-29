import express from "express";
import { auth, isInstructor } from "../middleware/auth.js";
import { updateDisplayPicture } from "../controllers/ProfileC.js";
// import { deleteAccount, updateProfile, getAllUserDetails, getEnrolledCourses,  instructorDashboard } from "../controllers/ProfileC.js";
const router = express.Router();




// router.delete("/deleteProfile",auth, deleteAccount)
// router.put("/updateProfile", auth, updateProfile)
// router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

export default router;