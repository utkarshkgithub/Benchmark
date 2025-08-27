import express from "express"
import dotenv from "dotenv";
import AuthRoutes from './routes/AuthRoutes.js'
import SubRoutes from './routes/SubRoutes.js'
import cors from "cors"

// import UserRoutes from './Routes/UserRoutes.js'
// import ChatRoutes from './Routes/ChatRoutes.js'
import {connectDB} from './config/dbConnect.js'
import cookieParser from "cookie-parser";
const app = express();
dotenv.config()
const PORT = process.env.PORT || 5001;

app.use(express.json())
app.use(cookieParser()); 
app.use(
	cors({
		origin:"http://localhost:5173",
		credentials:true,
	})
)
app.use("/api/v1/auth",AuthRoutes);
app.use("/api/v1/sub",SubRoutes);


app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});


app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
    connectDB();
});