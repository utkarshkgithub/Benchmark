// security.js - Comprehensive security middleware for attendance system
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Joi from "joi";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

// IP-based blocking system (in-memory store - production mein Redis use karo)
const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { count, lastAttempt }

export function applySecurity(app) {
  // console.log("🔒 Setting up security middleware...");
  
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
  
  // 3. CORS configuration with enhanced preflight handling
  app.use(
    cors({
      origin: function (origin, callback) {
        const allowedOrigins = [
          "https://iiitbhbenchmark.vercel.app",
          "http://localhost:5173",
          "http://localhost:3000",
          "http://127.0.0.1:5173"
        ];
        
        console.log(`🌐 CORS request from origin: ${origin}`);
        
        // Development mein origin null ho sakta hai (for tools like Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          console.log(`✅ CORS allowed for origin: ${origin}`);
          callback(null, true);
        } else {
          console.log(`🚫 CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
      ],
      exposedHeaders: ["Set-Cookie"],
      maxAge: 86400, // Preflight requests cache for 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    })
  );

  // 3a. Additional explicit OPTIONS handler for all routes
  app.options('*', (req, res) => {
    console.log(`🔄 OPTIONS request for: ${req.path} from origin: ${req.get('Origin')}`);
    res.header('Access-Control-Allow-Origin', req.get('Origin'));
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });
  
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
      preserveExtension: 4,
      limitHandler: (req, res) => {
        res.status(413).json({
          success: false,
          message: "File too large. Maximum size allowed is 5MB."
        });
      }
    })
  );
  
  // 5. Helmet: Secure HTTP headers set karta hai
  app.use(helmet({
    // Content Security Policy - XSS attacks se bachata hai
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only same origin se content load kar sakta hai
        styleSrc: ["'self'", "'unsafe-inline'"], // CSS ke liye
        scriptSrc: ["'self'"], // JavaScript ke liye
        imgSrc: ["'self'", "data:", "https:"], // Images ke liye
        connectSrc: ["'self'", "http:", "https:"], // AJAX calls ke liye (allowing both HTTP and HTTPS for development)
      },
    },
    // Hide X-Powered-By header (attackers ko framework nahi pata chalega)
    hidePoweredBy: true,
    // HTTP Strict Transport Security - HTTPS force karta hai
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    // X-Frame-Options - Clickjacking attacks se bachata hai
    frameguard: { action: 'deny' },
    // X-Content-Type-Options - MIME type sniffing prevent karta hai
    noSniff: true,
    // Referrer Policy - referrer information leak prevent karta hai
    referrerPolicy: { policy: "same-origin" }
  }));
  // console.log("✅ Helmet configured");

  // 6. IP Blocking Middleware - Malicious IPs ko block karta hai
  app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Agar IP blocked hai to reject kar do
    if (blockedIPs.has(clientIP)) {
      console.log(`🚫 Blocked IP attempted access: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Your IP has been blocked due to suspicious activity."
      });
    }
    
    next();
  });
  // console.log("✅ IP blocking middleware configured");

  // 7. General Rate Limiting - Sabhi requests ko limit karta hai
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Maximum 100 requests per IP in 15 minutes
    message: {
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
      retryAfter: "15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Handler for when limit is reached (updated for v7+)
    handler: (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      trackSuspiciousActivity(clientIP);
      console.log(`⚠️ Rate limit reached for IP: ${clientIP}`);
      res.status(429).json({
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes.",
        retryAfter: "15 minutes"
      });
    }
  });
  app.use(generalLimiter);
  // console.log("✅ General rate limiting configured");

  // 8. Attendance Specific Rate Limiting - Attendance endpoints ke liye strict limit
  const attendanceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // Maximum 5 attendance requests per minute
    message: {
      success: false,
      message: "Too many attendance requests. Please wait 1 minute before trying again.",
      retryAfter: "1 minute"
    },
    handler: (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      trackSuspiciousActivity(clientIP);
      // console.log(`🚨 Attendance spam detected from IP: ${clientIP}`);
      res.status(429).json({
        success: false,
        message: "Too many attendance requests. Please wait 1 minute before trying again.",
        retryAfter: "1 minute"
      });
    }
  });

  // Attendance routes ko strict limiting apply karo
  app.use("/api/v3/subject/mark-attendance", attendanceLimiter);
  app.use("/api/v3/subject/get-attendance", attendanceLimiter);
  // console.log("✅ Attendance rate limiting configured");

  // 9. Auth Specific Rate Limiting - Login/Signup ke liye
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Maximum 10 auth attempts per 15 minutes
    message: {
      success: false,
      message: "Too many authentication attempts. Please try again after 15 minutes.",
      retryAfter: "15 minutes"
    },
    handler: (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      trackSuspiciousActivity(clientIP);
      // console.log(`🚨 Auth brute force detected from IP: ${clientIP}`);
      res.status(429).json({
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes.",
        retryAfter: "15 minutes"
      });
    }
  });

  app.use("/api/v3/auth/login", authLimiter);
  app.use("/api/v3/auth/signup", authLimiter);
  app.use("/api/v3/auth/sendotp", authLimiter);
  // console.log("✅ Auth rate limiting configured");

  // console.log("🔒 All security middleware configured successfully");
}

// Suspicious activity track karne ka function
function trackSuspiciousActivity(ip) {
  if (suspiciousIPs.has(ip)) {
    const activity = suspiciousIPs.get(ip);
    activity.count++;
    activity.lastAttempt = new Date();
    
    // Agar 5 baar suspicious activity hai to IP block kar do
    if (activity.count >= 5) {
      blockedIPs.add(ip);
      suspiciousIPs.delete(ip);
      // console.log(`🚫 IP blocked due to repeated suspicious activity: ${ip}`);
    }
  } else {
    suspiciousIPs.set(ip, {
      count: 1,
      lastAttempt: new Date()
    });
  }
}

// Request validation middleware
export function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // console.log(`❌ Validation failed: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        details: error.details[0].message
      });
    }
    next();
  };
}

// Common validation schemas
export const validationSchemas = {
  // Email validation
  email: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Valid email address required',
      'any.required': 'Email is required'
    })
  }),
  
  // Login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),
  
  // Attendance validation
  attendance: Joi.object({
    subjectId: Joi.string().required().messages({
      'any.required': 'Subject ID is required'
    }),
    studentId: Joi.string().required().messages({
      'any.required': 'Student ID is required'
    })
  })
};

// Clean up blocked IPs periodically (24 hours ke baad unblock kar do)
setInterval(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [ip, activity] of suspiciousIPs.entries()) {
    if (activity.lastAttempt < oneDayAgo) {
      suspiciousIPs.delete(ip);
    }
  }
  
  console.log("🧹 Cleaned up old suspicious IP records");
}, 60 * 60 * 1000); // Every hour check karo
