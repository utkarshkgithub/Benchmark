import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Attendence from "../models/Attendence.js";
import Subject from "../models/Subject.js";

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

        const subjectDetails = await Subject.findOne({ subjectCode: subjectCode });
        if (!subjectDetails) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // ✅ FIX: await create so we get _id
        const attendence = await Attendence.create({
            date: new Date().toISOString(),
            subject: subjectDetails._id,
            instructor: userDetails._id,
            presentStudent: []
        });

        // ✅ Prepare payload with correct attendenceId
        const payload = {
            email: userDetails.email,
            id: userDetails._id,
            accountType: userDetails.accountType,
            subjectCode: subjectCode,
            date: new Date().toISOString(), // readable timestamp
            attendenceId: attendence._id.toString(), // ensure it's string
        };

        // ✅ Generate short-lived attendance token
        const attendanceToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2m", // 2 minutes
        });

        // console.log("attToken", attendanceToken);

        return res.status(200).json({
            success: true,
            token: attendanceToken,
            attendenceId: attendence._id, // send it back also (debugging)
            message: "QR token generated successfully.",
        });

    } catch (error) {
        console.error("QR Generation error:", error);
        return res.status(500).json({
            success: false,
            message: "Token generation failed, please try again",
        });
    }
};



export const verifyQrCode = async (req, res) => {
    try {
        const userId = req.user.id; // logged-in student
        const { qr_data } = req.body;

        console.log("qrData:", qr_data);

        if (!qr_data || !userId) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized: all fields are required, please try again."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(qr_data, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired QR code"
            });
        }

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { attendenceId, subjectCode } = decoded;
        if (!attendenceId) {
            return res.status(400).json({
                success: false,
                message: "Invalid QR data: missing attendanceId"
            });
        }

        // ✅ fetch attendance record
        const attendance = await Attendence.findById(attendenceId);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        // ✅ check if student already marked present
        if (attendance.presentStudent.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You have already marked your attendance"
            });
        }

        // ✅ add student to presentStudent list
        attendance.presentStudent.push(userId);
        await attendance.save();

        return res.status(200).json({
            success: true,
            message: `Attendance marked successfully ${subjectCode}`,
        });

    } catch (error) {
        console.error("Verify QR error:", error);
        return res.status(500).json({
            success: false,
            message: "QR verification failed, please try again",
        });
    }
};
