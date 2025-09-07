import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import { deleteStudent, updateDisplayPicture } from "../controllers/SettingC.js";
const router = express.Router();

router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.delete("/delete-student",auth,isAdmin,deleteStudent)

export default router;