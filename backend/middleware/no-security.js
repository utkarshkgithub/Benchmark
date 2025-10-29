// no-security.js - Minimal security to avoid Chrome warnings
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

export function applyMinimalSecurity(app) {
  console.log("⚠️ Running with MINIMAL security - Chrome compatible mode");
  
  // 1. Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // 2. Cookie parser
  app.use(cookieParser());
  
  // 3. COMPLETELY OPEN CORS - No restrictions
  app.use(cors({
    origin: true, // Allow ALL origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: "*"
  }));
  
  // 4. File upload
  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }
  }));
  
  // NO HELMET - Completely disabled
  // NO Rate Limiting - Completely disabled
  // NO Security Headers - Completely disabled
  
  console.log("✅ Minimal security applied - All Chrome-blocking features disabled");
}
