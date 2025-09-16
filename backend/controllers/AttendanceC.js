import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Attendance from "../models/Attendence.js";
import Subject from "../models/Subject.js";
import crypto from "crypto";
import Token from "../models/Token.js";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";

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

    // ✅ 5 min ke andar agar same instructor + subject par attendance already hai to wahi use karo
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let attendance = await Attendance.findOne({
      subject: subjectDetails._id,
      instructor: userDetails._id,
      createdAt: { $gte: fiveMinutesAgo }
    });

    // agar nahi hai to naya create karo
    if (!attendance) {
      attendance = await Attendance.create({
        date: new Date().toISOString(),
        subject: subjectDetails._id,
        instructor: userDetails._id,
        presentStudent: []
      });
    }

    // ✅ payload me subjectId + attendanceId bhejenge
    const payload = {
      instructorId: userDetails._id.toString(),
      subjectId: subjectDetails._id.toString(),
      attendanceId: attendance._id.toString(),
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2m" });

    // shortId generate karo
    const shortId = crypto.randomBytes(4).toString("hex").slice(0, 7);

    await Token.create({
      shortId,
      jwt: jwtToken,
      expireAt: Date.now() + 2 * 60 * 1000, // auto-expire 2 min
    });

    return res.status(200).json({
      success: true,
      token: shortId,
      attendanceId: attendance._id,
      subjectName: subjectDetails.subjectName,
      subjectCode: subjectDetails.subjectCode,
      presentStudents: attendance.presentStudent, // ✅ purane students bhi bhej diye
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

    // 1️⃣ Find token
    const tokenDoc = await Token.findOne({ shortId: qr_data });
    if (!tokenDoc) {
      return res.status(401).json({ success: false, message: "Invalid or expired QR code" });
    }

    // 2️⃣ Decode JWT
    let decoded;
    try {
      decoded = jwt.verify(tokenDoc.jwt, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Expired or invalid token" });
    }

    const { attendanceId } = decoded;

    // 3️⃣ Get attendance
    const attendance = await Attendance.findById(attendanceId).populate("subject");
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    // 4️⃣ Get subject details + students
    const subject = await Subject.findById(attendance.subject._id).populate("students");
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // 5️⃣ Check if subject contains this student
    const isInSubject = subject.students.some(
      (stu) => stu._id.toString() === userId.toString()
    );
    if (!isInSubject) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for this subject (not in subject list)",
      });
    }

    // 6️⃣ Check in Student model (userId + subjects)
    const studentDetails = await Student.findOne({ userId }).populate("subjects");
    if (!studentDetails) {
      return res.status(404).json({ success: false, message: "Student details not found" });
    }

    const isEligible = studentDetails.subjects.some(
      (subj) => subj._id.toString() === subject._id.toString()
    );
    if (!isEligible) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for this subject (not in student subjects)",
      });
    }

    // 7️⃣ Already marked?
    if (attendance.presentStudent.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already marked present",
      });
    }

    // 8️⃣ Mark attendance
    attendance.presentStudent.push(userId);
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Verify QR error:", error);
    return res.status(500).json({
      success: false,
      message: "QR verification failed",
      error: error.message,
    });
  }
};



export const getAttendanceDetails = async (req, res) => {
  try {
    const { attendanceId } = req.body;
    // console.log("attendanceId :- ", attendanceId);

    // 1️⃣ Find attendance
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    // 2️⃣ Find subject
    const subject = await Subject.findById(attendance.subject);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    // 3️⃣ Get all students enrolled in this subject
    const students = await Student.find({ subjects: subject._id })
      .populate("userId", "firstName lastName email")
      .lean();

    // 4️⃣ Build present/absent list
    const presentStudentsSet = new Set(
      attendance.presentStudent.map((id) => id.toString())
    );

    const studentStatusList = students.map((student) => ({
      student: student._id,
      name: `${student.userId.firstName} ${student.userId.lastName}`,
      rollNumber: student.rollNumber,
      branch: student.branch,
      semester: student.semester,
      email: student.userId.email,
      status: presentStudentsSet.has(student.userId._id.toString())
        ? "Present"
        : "Absent",
    }));

    // 5️⃣ Return response
    return res.status(200).json({
      success: true,
      attendance: {
        _id: attendance._id,
        subject: subject.subjectName,
        students: studentStatusList,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get attendance" });
  }
};


export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId, updatedStudents } = req.body;
    // console.log("Received updatedStudents:", updatedStudents);

    if (!attendanceId || !updatedStudents) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    if (attendance.createdAt < threeHoursAgo) {
      return res.status(403).json({ success: false, message: "Attendance can no longer be modified." });
    }

    // ✅ Collect only present student IDs from the request body
    const presentStudentIds = Object.keys(updatedStudents).filter(
      (studentId) => updatedStudents[studentId] === true
    );

    // ✅ Find the corresponding Student documents to get their User IDs
    const students = await Student.find({ '_id': { $in: presentStudentIds } });
    const presentUserIds = students.map(student => student.userId);

    attendance.presentStudent = presentUserIds;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      presentStudentCount: presentUserIds.length,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    return res.status(500).json({ success: false, message: "Attendance update failed" });
  }
};



export const getInstructorAttendanceSummary = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // ✅ Get subjects taught by instructor
    const subjects = await Subject.find({ instructor: instructorId });
    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ success: false, message: "No subjects found" });
    }

    let summary = [];

    for (const subject of subjects) {
      // ✅ All attendance records for this subject
      const attendanceRecords = await Attendance.find({ subject: subject._id });
      const totalClasses = attendanceRecords.length;

      // ✅ Get students enrolled in this subject
      const students = await Student.find({ subjects: subject._id })
        .populate("userId", "firstName lastName email")
        .lean();

      let studentData = [];

      for (const student of students) {
        let presentCount = 0;

        // ✅ Count present occurrences for this student
        attendanceRecords.forEach((record) => {
          if (record.presentStudent.map(id => id.toString()).includes(student.userId._id.toString())) {
            presentCount++;
          }
        });

        const email = student.userId?.email || "";
        const roll = email.match(/\d{9}/)?.[0] || student.rollNumber || "N/A";

        studentData.push({
          studentId: student._id,
          name: `${student.userId.firstName} ${student.userId.lastName}`,
          rollNumber: roll,
          branch: student.branch,
          semester: student.semester,
          email: student.userId.email,
          present: presentCount,
          total: totalClasses,
          percentage:
            totalClasses > 0
              ? ((presentCount / totalClasses) * 100).toFixed(2)
              : "0.00",
        });
      }

      summary.push({
        subjectId: subject._id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalClasses,
        students: studentData,
      });
    }

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching instructor summary:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch attendance summary" });
  }
};


export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: "Subject ID is required" });
    }

    // 1️⃣ Delete the subject
    const deletedSubject = await Subject.findByIdAndDelete(subjectId);

    if (!deletedSubject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // 2️⃣ Remove this subject from all students
    await Student.updateMany(
      { subjects: subjectId },
      { $pull: { subjects: subjectId } }
    );

    // 3️⃣ Remove this subject from all instructors
    await Instructor.updateMany(
      { subjectsTaught: subjectId },
      { $pull: { subjectsTaught: subjectId } }
    );

    // 4️⃣ Delete all attendance records for this subject
    await Attendance.deleteMany({ subject: subjectId });

    return res.status(200).json({ 
      success: true, 
      message: "Subject deleted, references removed, and related attendance records deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting subject:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
