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
    const { subjectId } = req.body; // ✅ frontend se subjectId aayega

    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const subjectDetails = await Subject.findById(subjectId);
    if (!subjectDetails) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // ✅ check if attendance already created in last 5 min
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let attendence = await Attendence.findOne({
      subject: subjectDetails._id,
      instructor: userDetails._id,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (!attendence) {
      attendence = await Attendence.create({
        date: new Date().toISOString(),
        subject: subjectDetails._id,
        instructor: userDetails._id,
        presentStudent: []
      });
    }

    // ✅ payload me ab subjectId dalenge
    const payload = {
      id: userDetails._id,
      subjectId: subjectDetails._id.toString(),
      attendenceId: attendence._id.toString(),
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2m" });

    const shortId = crypto.randomBytes(4).toString("hex").slice(0, 7);

    await Token.create({
      shortId,
      jwt: jwtToken,
      expireAt: Date.now() + 2 * 60 * 1000, // auto-expire 2 min
    });

    return res.status(200).json({
      success: true,
      token: shortId,
      attendenceId: attendence._id,
      subjectName: subjectDetails.subjectName, // ✅ frontend ke liye bhej diya
      subjectCode: subjectDetails.subjectCode, // optional
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

    const { attendenceId } = decoded;

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
      message: `Attendance marked successfully`,
    });
  } catch (error) {
    console.error("Verify QR error:", error);
    return res.status(500).json({ success: false, message: "QR verification failed" });
  }
};

export const getAttendanceDetails = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    const attendance = await Attendence.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    const subject = await Subject.findById(attendance.subject).populate(
      "students",
      "firstName lastName email rollNumber"
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const presentStudentsSet = new Set(attendance.presentStudent.map((id) => id.toString()));

    const studentStatusList = subject.students.map((student) => ({
      student: student._id,
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      email: student.email,
      status: presentStudentsSet.has(student._id.toString()) ? "Present" : "Absent",
    }));

    return res.status(200).json({
      success: true,
      attendance: {
        _id: attendance._id,
        students: studentStatusList,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ success: false, message: "Failed to get attendance" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId, updatedStudents } = req.body;

    if (!attendanceId || !updatedStudents) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const attendance = await Attendence.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    if (attendance.createdAt < threeHoursAgo) {
      return res.status(403).json({ success: false, message: "Attendance can no longer be modified." });
    }

    const newPresentStudentList = Object.keys(updatedStudents).filter(
      (studentId) => updatedStudents[studentId] === "Present"
    );

    attendance.presentStudent = newPresentStudentList;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    return res.status(500).json({ success: false, message: "Attendance update failed" });
  }
};
