import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const generateQr = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subjectCode } = req.body;

        console.log("user:", userId);

        // ✅ Await the user fetch
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Prepare payload
        const payload = {
            email: userDetails.email,
            id: userDetails._id,
            accountType: userDetails.accountType,
            subjectCode: subjectCode,
            date: new Date().toISOString(), // more readable timestamp
        };

        // ✅ Generate short-lived attendance token
        const attendanceToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2m", // 2 minutes
        });

        return res.status(200).json({
            success: true,
            token: attendanceToken,
            message: "QR token generated successfully.",
        });
    } catch (error) {
        console.error("QR Generation error:", error);
        return res.status(500).json({
            success: false,
            message: "Token generation failed, please try again.",
        });
    }
};
