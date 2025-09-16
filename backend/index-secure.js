import express from "express"
import dotenv from "dotenv";
import AuthRoutes from './routes/AuthRoutes-simple.js'
// import SettingRoutes from './routes/SettingRoutes.js'
import SubjectRoutes from "./routes/SubRoutes-simple.js"
import fileUpload from "express-fileupload";
import cors from "cors"
import {connectDB} from './config/dbConnect.js'
import cookieParser from "cookie-parser";
// 🔑 Security imports
import { applySecurity } from "./middleware/security-simple.js";

const app = express();
dotenv.config()
const PORT = process.env.PORT || 5001;

// 🔒 Enable trust proxy for proper IP detection
app.set('trust proxy', 1);

// 📝 Body parser with size limits
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// 🍪 Cookie parser
app.use(cookieParser()); 

// 🌐 CORS configuration
app.use(
	cors({
		origin: [
			"https://benchmarkofficial.vercel.app",
			"http://localhost:5173",
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: [
			"Content-Type", 
			"Authorization", 
			"X-Requested-With",
			"Accept",
			"Origin"
		],
		exposedHeaders: ["Set-Cookie"],
		maxAge: 86400
	})
)

// 📁 File upload with security restrictions
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
		limits: { 
			fileSize: 5 * 1024 * 1024 // 5MB max
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
)

console.log("🔧 Basic middleware configured");

// 🔒 Apply security middleware
applySecurity(app);

console.log("🛡️ Security middleware applied");

// 🛣️ API Routes
app.use("/api/v3/auth", AuthRoutes);
// app.use("/api/v3/setting", SettingRoutes);
app.use("/api/v3/subject", SubjectRoutes);

// 🏠 Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Attendance API is running securely...",
    timestamp: new Date().toISOString(),
    version: "3.0.0-secure",
    security: {
      helmet: "✅ Enabled",
      rateLimiting: "✅ Enabled", 
      ipBlocking: "✅ Enabled",
      corsProtection: "✅ Enabled"
    }
  });
});

// 🚫 Handle undefined routes
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    requestedPath: req.originalUrl
  });
});

// 🚨 Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global error:", error);
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS: Origin not allowed"
    });
  }
  
  // File upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: "File too large"
    });
  }
  
  // JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format"
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`🔒 Security features enabled`);
    console.log(`🌐 CORS configured for production origins`);
    console.log(`⚡ Rate limiting active - General: 100/15min, Auth: 10/15min, Attendance: 5/1min`);
    console.log(`📊 IP blocking system ready`);
    console.log(`🛡️ Protection against student spam attacks: ACTIVE`);
    connectDB();
});