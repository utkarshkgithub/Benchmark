import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Attendence from "../models/Attendence.js";
import Subject from "../models/Subject.js";
import crypto from "crypto";
import Token from "../models/Token.js";

dotenv.config();

export const generateQr = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectCode } = req.body;

    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const subjectDetails = await Subject.findOne({ subjectCode });
    if (!subjectDetails) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const attendence = await Attendence.create({
      date: new Date().toISOString(),
      subject: subjectDetails._id,
      instructor: userDetails._id,
      presentStudent: []
    });

    const payload = {
      id: userDetails._id,
      subjectCode,
      attendenceId: attendence._id.toString(),
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2m" });

    // 🔑 generate shortId (7 chars)
    const shortId = crypto.randomBytes(4).toString("hex").slice(0, 7);

    // save mapping in DB
    await Token.create({
      shortId,
      jwt: jwtToken,
      expireAt: Date.now() + 2 * 60 * 1000, // 2 minutes
    });

    return res.status(200).json({
      success: true,
      token: shortId, // only send shortId
      message: "QR token generated successfully."
    });
  } catch (error) {
    console.error("QR Generation error:", error);
    return res.status(500).json({ success: false, message: "Token generation failed" });
  }
};


export const verifyQrCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { qr_data } = req.body;

    if (!qr_data || !userId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // find JWT from shortId
    const tokenDoc = await Token.findOne({ shortId: qr_data });
    if (!tokenDoc) {
      return res.status(401).json({ success: false, message: "Invalid or expired QR code" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tokenDoc.jwt, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Expired or invalid token" });
    }

    const { attendenceId, subjectCode } = decoded;

    const attendance = await Attendence.findById(attendenceId);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    if (attendance.presentStudent.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already marked present" });
    }

    attendance.presentStudent.push(userId);
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully ${subjectCode}`,
    });
  } catch (error) {
    console.error("Verify QR error:", error);
    return res.status(500).json({ success: false, message: "QR verification failed" });
  }
};
