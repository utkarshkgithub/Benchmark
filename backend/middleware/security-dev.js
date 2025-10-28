// security-dev.js - Chrome-friendly security middleware for development
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

// Minimal security for development - Chrome friendly
export function applyDevSecurity(app) {
  console.log("🔒 Setting up development-friendly security middleware...");
  
  // 0. Trust proxy for proper IP detection
  app.set('trust proxy', 1);
  
  // 1. Body parsing middleware
  app.use(express.json({ 
    limit: '10mb', 
    strict: true 
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
  
  // 2. Cookie parser
  app.use(cookieParser());
  
  // 3. Very permissive CORS for development
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"]
  }));

  // 4. File upload middleware
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max file size
      },
      abortOnLimit: true,
      safeFileNames: true,
      preserveExtension: 4
    })
  );
  
  // 5. Minimal helmet configuration - Chrome friendly
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development
    hsts: false, // Disable HSTS in development
    frameguard: false, // Disable frame options in development
    crossOriginEmbedderPolicy: false // Disable COEP in development
  }));
  
  // 6. Very lenient rate limiting for development
  const devLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Very high limit for development
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for localhost
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost');
    }
  });
  app.use(devLimiter);
  
  console.log("✅ Development security configured - Chrome friendly");
}

// Validation schemas (same as production)
export const validationSchemas = {
  email: Joi.object({
    email: Joi.string().email().required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  attendance: Joi.object({
    subjectId: Joi.string().required(),
    studentId: Joi.string().required()
  })
};

export function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        details: error.details[0].message
      });
    }
    next();
  };
}