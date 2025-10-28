// chrome-safe-security.js - Absolutely Chrome-safe security middleware
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

// CHROME SAFE - No problematic headers at all
export function applyChromeSafeSecurity(app) {
  console.log("🔓 Using Chrome-safe security (NO problematic headers)");
  
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Basic parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  
  // Very permissive CORS
  app.use(cors({
    origin: true, // Allow ALL origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"]
  }));

  // File upload
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  );
  
  // NO HELMET - No security headers that Chrome flags
  // NO CSP, NO HSTS, NO frame options, NO XSS protection
  
  console.log("✅ Chrome-safe security configured - NO problematic headers");
}