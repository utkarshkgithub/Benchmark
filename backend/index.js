// import express from "express";
// import dotenv from "dotenv";
// import AuthRoutes from "./routes/AuthRoutes.js";
// import SettingRoutes from "./routes/SettingRoutes.js";
// import SubjectRoutes from "./routes/SubRoutes.js";
// import fileUpload from "express-fileupload";
// import cors from "cors";
// import { connectDB } from "./config/dbConnect.js";
// import cookieParser from "cookie-parser";// 🔑 Security import
// import { applySecurity } from "./middleware/security.js";

// const app = express();
// dotenv.config();
// const PORT = process.env.PORT || 5001;

// // Body parser
// app.use(express.json());
// app.use(cookieParser());

// // CORS setup
// app.use(
//   cors({
//     origin: ["https://benchmark-official.vercel.app", "http://localhost:5173"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // File upload
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );
// console.log("1-1-1--1-1")
// // 🔒 Apply security middleware
// applySecurity(app);

// console.log("2,222828288282")

// // Routes
// app.use("/api/v2/auth", AuthRoutes);
// app.use("/api/v2/setting", SettingRoutes);
// app.use("/api/v2/subject", SubjectRoutes);

// app.get("/", (req, res) => {
//   res.send("🚀 API is running securely...");
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server is running on http://localhost:${PORT}`);
//   connectDB();
// });





import express from "express"
import dotenv from "dotenv";
import AuthRoutes from './routes/AuthRoutes.js'
import SettingRoutes from './routes/SettingRoutes.js'
import SubjectRoutes from "./routes/SubRoutes.js"
import fileUpload from "express-fileupload";
import cors from "cors"
import {connectDB} from './config/dbConnect.js'
import cookieParser from "cookie-parser";
const app = express();
dotenv.config()
const PORT = process.env.PORT || 5001;

app.use(express.json())
app.use(cookieParser()); 
app.use(
	cors({
		origin:["https://benchmarkofficial.vercel.app","http://localhost:5173"],
		credentials:true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    	allowedHeaders: ["Content-Type", "Authorization"],
	})
)

app.use(
	fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
)

app.use("/api/v2/auth",AuthRoutes);
app.use("/api/v2/setting",SettingRoutes);
app.use("/api/v2/subject",SubjectRoutes);
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});


app.listen(PORT,()=>{
    // console.log(`Server is running on port http://localhost:${PORT}`);
    connectDB();
});