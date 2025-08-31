import express from "express";
import { auth } from "../middleware/auth.js";
import { updateDisplayPicture } from "../controllers/SettingC.js";
const router = express.Router();

router.put("/updateDisplayPicture", auth, updateDisplayPicture)

export default router;