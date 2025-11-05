import express from "express";
import serverlessExpress from "@codegenie/serverless-express";
import AuthRoutes from './routes/AuthRoutes.js';
import SettingRoutes from './routes/SettingRoutes.js';
import SubjectRoutes from "./routes/SubRoutes.js";
import connectDB from './db.js';
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(fileUpload());

// ADD THIS: Handle API Gateway base path
// app.use((req, res, next) => {
//   // Strip /default/benchmark-backend from the path
//   if (req.path.startsWith('/default/benchmark-backend')) {
//     req.url = req.url.replace('/default/benchmark-backend', '') || '/';
//   } else if (req.path.startsWith('/benchmark-backend')) {
//     req.url = req.url.replace('/benchmark-backend', '') || '/';
//   }
//   next();
// });

// Your routes
app.use("/api/v3/auth", AuthRoutes);
app.use("/api/v3/setting", SettingRoutes);
app.use("/api/v3/subject", SubjectRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running...."
  });
});

// Error handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// Connect DB
await connectDB();

// Export Lambda handler - KEEP IT SIMPLE
export const handler = serverlessExpress({ app });
