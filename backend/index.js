
import express from "express"
import dotenv from "dotenv";
import AuthRoutes from './routes/AuthRoutes.js'
import SettingRoutes from './routes/SettingRoutes.js'
import SubjectRoutes from "./routes/SubRoutes.js"
import {connectDB} from './config/dbConnect.js'
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";

const app = express();
dotenv.config()
const PORT = process.env.PORT || 5001;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(fileUpload()); 
app.use(cookieParser());



app.use(
  cors({
    origin: ["https://iiitbhbenchmark.vercel.app", "http://localhost:5173","https://benchmark-official.vercel.app","benchmark.codes"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/api/v3/auth", AuthRoutes);
app.use("/api/v3/setting", SettingRoutes);
app.use("/api/v3/subject", SubjectRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running...."
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});