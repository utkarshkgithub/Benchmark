import express from "express";
import serverlessExpress from "@codegenie/serverless-express";
import AuthRoutes from "./routes/AuthRoutes.js";
import SettingRoutes from "./routes/SettingRoutes.js";
import SubjectRoutes from "./routes/SubRoutes.js";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
// CORS: allow the frontend dev server and any other trusted origins
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy: This origin is not allowed."), false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
// Enable preflight across-the-board
app.options("*", cors(corsOptions));

// ✅ Handle API Gateway base path dynamically (for Lambda)
app.use((req, res, next) => {
  const basePaths = ["/default/benchmark-backend", "/benchmark-backend"];
  for (const base of basePaths) {
    if (req.path.startsWith(base)) {
      req.url = req.url.replace(base, "") || "/";
      break;
    }
  }
  next();
});

// Routes
app.use("/api/v3/auth", AuthRoutes);
app.use("/api/v3/setting", SettingRoutes);
app.use("/api/v3/subject", SubjectRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `Your server is up and running on port ${port}`,
  });
});

// Error Handlers
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ Environment detection
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Exported handler binding (will be set when running on Lambda)
let handler;

if (isLambda) {
  // Running on AWS Lambda: ensure DB is connected before creating the handler
  await connectDB();
  handler = serverlessExpress({ app });
} else {
  // Running locally
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`✅ Server running locally on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to DB:", err);
    });
}

// Named export must be at top-level; export the handler variable (may be undefined locally)
export { handler };
