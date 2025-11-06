import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";
import crypto from "crypto";
import Token from "../models/Token.js";
import Location from "../models/Location.js";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";
import '../config/env.js';

export const generateQr = async (req, res) => {
  try {
    const userId = req.user.id;
    
 
  const { subjectId } = req.body; // ✅ frontend se subjectId aayega
    // console.log("Extracted subjectId:", subjectId);
    
    if (!subjectId) {
      return res.status(400).json({ success: false, message: "Subject ID is required" });
    }
    
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
      createdAt: { $gte: fiveMinutesAgo }
    });

    // agar nahi hai to naya create karo
    if (!attendance) {
      attendance = await Attendance.create({
        date: new Date().toISOString(),
        subject: subjectDetails._id,
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

    // LocationId is MANDATORY for QR generation to ensure attendance integrity
    let location; // will hold { latitude, longitude }
    let locationId = req.body?.locationId;
    let locationName;

    if (!locationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Location selection is required to generate QR code. Please select a location from the dropdown." 
      });
    }

    try {
      const locDoc = await Location.findById(locationId);
      if (!locDoc) {
        return res.status(404).json({ 
          success: false, 
          message: "Selected location not found. Please select a valid location." 
        });
      }
      
      location = {
        latitude: Number(locDoc.coordinates.latitude),
        longitude: Number(locDoc.coordinates.longitude),
      };
      locationName = locDoc.name;
    } catch (err) {
      console.error("Error fetching location:", err);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid location selected. Please choose a valid location from the list." 
      });
    }

    await Token.create({
      shortId,
      jwt: jwtToken,
      expireAt: Date.now() + 2 * 60 * 1000, // auto-expire 2 minutes
      location,
      locationId: locationId || undefined,
      locationName: locationName || undefined,
    });

    return res.status(200).json({
      success: true,
      token: shortId,
      attendanceId: attendance._id,
      subjectName: subjectDetails.subjectName,
      subjectCode: subjectDetails.subjectCode,
      presentStudents: attendance.presentStudent,
      message: "QR token generated successfully."
    });
  } catch (error) {
    // console.error("QR Generation error:", error);
    return res.status(500).json({ success: false, message: "Token generation failed" });
  }
};

export const verifyQrCode = async (req, res) => {
  try {
    const userId = req.user.id;
  const { qr_data } = req.body;
  // Note: student geolocation no longer required. Tokens may contain stored location coords,
  // but we will not enforce proximity checks based on student-sent coordinates.

    if (!qr_data || !userId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // Find token
    const tokenDoc = await Token.findOne({ shortId: qr_data });
    if (!tokenDoc) {
      return res.status(401).json({ success: false, message: "Invalid or expired QR code" });
    }

    // MANDATORY proximity verification for ALL QR codes:
    // Student MUST provide their coordinates and be within 50 meters of the class location
    const studentLat = req.body?.latitude !== undefined ? Number(req.body.latitude) : null;
    const studentLng = req.body?.longitude !== undefined ? Number(req.body.longitude) : null;
    let distanceMeters = null;

    // Student coordinates are ALWAYS REQUIRED for attendance marking
    if (studentLat == null || studentLng == null || Number.isNaN(studentLat) || Number.isNaN(studentLng)) {
      return res.status(400).json({ 
        success: false, 
        message: "Location permission required. Please enable GPS and allow location access to mark attendance.",
        requiresLocation: true
      });
    }

    // Check if QR was generated with a specific location
    if (tokenDoc.location) {
      // Calculate haversine distance between class location and student location
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371000; // earth radius in meters
      const lat1 = toRad(tokenDoc.location.latitude);
      const lon1 = toRad(tokenDoc.location.longitude);
      const lat2 = toRad(studentLat);
      const lon2 = toRad(studentLng);
      const dlat = lat2 - lat1;
      const dlon = lon2 - lon1;
      const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // in meters
      distanceMeters = Math.round(distance);

      // Check if student is within 50 meters of class location
      const PROXIMITY_THRESHOLD_METERS = 50;
      if (distance > PROXIMITY_THRESHOLD_METERS) {
        return res.status(403).json({ 
          success: false, 
          message: `You are too far from the class location. Distance: ${distanceMeters}m (Required: ≤${PROXIMITY_THRESHOLD_METERS}m)`, 
          distanceMeters,
          requiredDistance: PROXIMITY_THRESHOLD_METERS,
          locationName: tokenDoc.locationName || "Class Location"
        });
      }
    } else {
      // Even if QR doesn't have specific location, we require student to be present
      // This prevents remote attendance marking
      return res.status(400).json({
        success: false,
        message: "This QR code was not generated with location data. Please contact your instructor to generate a new QR with proper location settings.",
        requiresLocationQR: true
      });
    }

    // Decode JWT
    let decoded;
    try {
      decoded = jwt.verify(tokenDoc.jwt, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Expired or invalid token" });
    }

    const { attendanceId } = decoded;

    //  Get attendance
    const attendance = await Attendance.findById(attendanceId).populate("subject");
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    // Get subject details + students
    const subject = await Subject.findById(attendance.subject).populate("students");
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // Check if student is part of the subject
    const isInSubject = subject.students.some(
      (stu) => stu._id.toString() === userId.toString()
    );
    if (!isInSubject) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for this subject (not in subject list)",
      });
    }

    // Check in Student model (userId + subjects)
    const studentDetails = await Student.findOne({ userId }).populate("subjects");
    if (!studentDetails) {
      return res.status(404).json({ success: false, message: "Student details not found" });
    }

    const isEligible = studentDetails.subjects.some((subj) => {
      const subjId = subj._id ? subj._id.toString() : subj.toString();
      return subjId === subject._id.toString();
    });
    if (!isEligible) {
      return res.status(403).json({
        success: false,
        message: "You are not eligible for this subject (not in student subjects)",
      });
    }

    // Check if already marked
    const alreadyMarked = attendance.presentStudent.some((entry) => {
      // Handle both old format (direct ObjectId) and new format (object with student field)
      const studentId = entry.student || entry;
      return studentId && studentId.toString() === userId.toString();
    });
    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Already marked present",
      });
    }

    // Mark attendance
    attendance.presentStudent.push({
      student: userId,
      markedAt: new Date(),
    });
    await attendance.save();

    // Return success and include location context when available
    const responsePayload = {
      success: true,
      message: "Attendance marked successfully",
    };

    if (tokenDoc.locationName) responsePayload.locationName = tokenDoc.locationName;
    if (tokenDoc.location) responsePayload.location = tokenDoc.location;
    if (distanceMeters != null) responsePayload.distanceMeters = distanceMeters;

    return res.status(200).json(responsePayload);
  } catch (error) {
    // console.error("Verify QR error:", error);
    return res.status(500).json({
      success: false,
      message: "QR verification failed",
      error: error.message,
    });
  }
}


export const getAttendanceDetails = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    // 1️⃣ Find attendance and populate presentStudent.student
    const attendance = await Attendance.findById(attendanceId)
      .populate("presentStudent.student", "firstName lastName email");
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

    // 4️⃣ Create a map of present students with their markedAt times
    const presentStudentsMap = new Map(
      attendance.presentStudent
        .filter(entry => entry.student) // remove null students
        .map(entry => {
          // Handle both populated and non-populated student references
          const studentId = entry.student._id 
            ? entry.student._id.toString() 
            : entry.student.toString();
          return [studentId, entry.markedAt];
        })
    );

    // 5️⃣ Build student status list with present/absent and markedAt if present
    const studentStatusList = students.map((student) => {
      if (!student.userId) {
        // console.warn(`Student ${student._id} has no userId`);
        return null;
      }
      
      const isPresent = presentStudentsMap.has(student.userId._id.toString());
      return {
        student: student._id,
        name: `${student.userId.firstName} ${student.userId.lastName}`,
        rollNumber: student.rollNumber,
        branch: student.branch,
        semester: student.semester,
        email: student.userId.email,
        status: isPresent ? "Present" : "Absent",
        markedAt: isPresent ? presentStudentsMap.get(student.userId._id.toString()) : null
      };
    }).filter(Boolean); // Remove null entries

    // 6️⃣ Return response
    return res.status(200).json({
      success: true,
      attendance: {
        _id: attendance._id,
        subject: subject.subjectName,
        students: studentStatusList,
      },
    });
  } catch (error) {
    // console.error("Get attendance error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get attendance", error: error.message });
  }
};


export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId, updatedStudents } = req.body;

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
    const presentStudentEntries = students.map(student => ({
      student: student.userId,
      markedAt: new Date()
    }));

    // ✅ Update attendance with the new presentStudent array
    attendance.presentStudent = presentStudentEntries;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      presentStudentCount: presentStudentEntries.length,
    });
  } catch (error) {
    // console.error("Update attendance error:", error);
    return res.status(500).json({ success: false, message: "Attendance update failed", error: error.message });
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
        if (!student.userId) {
          // console.warn(`Student ${student._id} has no userId in instructor summary`);
          continue;
        }
        
        let presentCount = 0;

        // ✅ Count present occurrences for this student
        attendanceRecords.forEach((record) => {
          const isPresent = record.presentStudent.some((entry) => {
            // Handle both old format (direct ObjectId) and new format (object with student field)
            const studentId = entry.student || entry;
            return studentId && studentId.toString() === student.userId._id.toString();
          });
          if (isPresent) {
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
    // console.error("Error fetching instructor summary:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch attendance summary", error: error.message });
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
    // console.error("Error deleting subject:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
