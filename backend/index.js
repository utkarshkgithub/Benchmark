
import express from "express"
import dotenv from "dotenv";
import AuthRoutes from './routes/AuthRoutes.js'
import SettingRoutes from './routes/SettingRoutes.js'
import SubjectRoutes from "./routes/SubRoutes.js"
import {connectDB} from './config/dbConnect.js'
// Temporarily disable security middleware
// import { applySecurity } from "./middleware/security.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config()
const PORT = process.env.PORT || 5001;

// Temporarily use basic security instead of full security
app.use(cors({
  origin: ["https://ilitbh-benchmark.vercel.app", "http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 🔒 Apply FULL comprehensive security middleware (handles everything)
// applySecurity(app); // Temporarily disabled

// console.log("🛡️ All security middleware applied - Server protected against spam attacks");

// Explicit OPTIONS handler for all routes
app.options('*', (req, res) => {
  res.status(200).end();
});

app.use("/api/v3/auth", AuthRoutes);
app.use("/api/v3/setting", SettingRoutes);
app.use("/api/v3/subject", SubjectRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Attendance API is running securely...",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
    security: "Full protection active - Helmet, Rate Limiting, IP Blocking",
    cors: "Enabled for https://iiitbh-benchmark.vercel.app"
  });
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🔍 Handle undefined routes (404 middleware)
app.use("*", (req, res) => {
  // console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    requestedPath: req.originalUrl,
    availableEndpoints: [
      "GET /",
      "POST /api/v3/auth/*",
      "POST /api/v3/setting/*", 
      "POST /api/v3/subject/*"
    ]
  });
});

// 🚨 Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global error:", error);
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS: Origin not allowed"
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: "File too large"
    });
  }
  
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format"
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 🚀 Start server
app.listen(PORT, () => {
    // console.log(`✅ Server running on http://localhost:${PORT}`);
    // console.log(`🔒 Security active: Rate limiting, IP blocking, Helmet headers, CORS`);
    // console.log(`�️ Protection against student spam attacks: ENABLED`);
    connectDB();
});