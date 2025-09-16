// security-simple.js - Simplified but effective security middleware
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// IP-based blocking system (in-memory store)
const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> { count, lastAttempt }

export function applySecurity(app) {
  // console.log("🔒 Setting up security middleware...");
  
  // 1. Helmet: Secure HTTP headers
  app.use(helmet({
    contentSecurityPolicy: false, // Simplified for now
    crossOriginEmbedderPolicy: false // Prevent COEP issues
  }));
  // console.log("✅ Helmet configured");

  // 2. IP Blocking Middleware
  app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (blockedIPs.has(clientIP)) {
      console.log(`🚫 Blocked IP attempted access: ${clientIP}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Your IP has been blocked due to suspicious activity."
      });
    }
    
    next();
  });
  console.log("✅ IP blocking middleware configured");

  // 3. General Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Maximum 100 requests per IP in 15 minutes
    message: {
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
      retryAfter: "15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
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
  console.log("✅ General rate limiting configured");

  // 4. Attendance Specific Rate Limiting (strictest)
  const attendanceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // Maximum 5 attendance requests per minute
    handler: (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      trackSuspiciousActivity(clientIP);
      console.log(`🚨 Attendance spam detected from IP: ${clientIP}`);
      res.status(429).json({
        success: false,
        message: "Too many attendance requests. Please wait 1 minute before trying again.",
        retryAfter: "1 minute"
      });
    }
  });

  // Apply to attendance-related routes
  app.use("/api/v3/subject/qrcode", attendanceLimiter);
  app.use("/api/v3/subject/verifyqrcode", attendanceLimiter);
  console.log("✅ Attendance rate limiting configured");

  // 5. Auth Specific Rate Limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Maximum 10 auth attempts per 15 minutes
    handler: (req, res) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      trackSuspiciousActivity(clientIP);
      console.log(`🚨 Auth brute force detected from IP: ${clientIP}`);
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
  console.log("✅ Auth rate limiting configured");

  // console.log("🔒 All security middleware configured successfully");
}

// Track suspicious activity
function trackSuspiciousActivity(ip) {
  if (suspiciousIPs.has(ip)) {
    const activity = suspiciousIPs.get(ip);
    activity.count++;
    activity.lastAttempt = new Date();
    
    // Block IP after 5 suspicious activities
    if (activity.count >= 5) {
      blockedIPs.add(ip);
      suspiciousIPs.delete(ip);
      console.log(`🚫 IP blocked due to repeated suspicious activity: ${ip}`);
    }
  } else {
    suspiciousIPs.set(ip, {
      count: 1,
      lastAttempt: new Date()
    });
  }
}

// Clean up blocked IPs every hour
setInterval(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [ip, activity] of suspiciousIPs.entries()) {
    if (activity.lastAttempt < oneDayAgo) {
      suspiciousIPs.delete(ip);
    }
  }
  
  console.log("🧹 Cleaned up old suspicious IP records");
}, 60 * 60 * 1000);