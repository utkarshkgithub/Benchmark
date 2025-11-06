import express from "express";
import { createLocation, fetchLocations } from "../controllers/LocationC.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Create location (admin only)
router.post("/create", auth, isAdmin, createLocation);

// Get all locations (auth required)
router.get("/all", auth, fetchLocations);

export default router;
