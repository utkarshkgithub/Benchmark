import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js"; 
import Subject from "../models/Subject.js";

export const getDetailedAttendanceBySubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.params;

    // Verify student exists
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    // Verify subject exists and student is enrolled
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject not found" 
      });
    }

    // Check if student is enrolled in this subject
    const isEnrolled = student.subjects.some(sub => sub.toString() === subjectId);
    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not enrolled in this subject" 
      });
    }

    // Get all attendance records for this subject
    const attendanceRecords = await Attendance.find({
      subject: subjectId
    })
      .populate("subject", "subjectName subjectCode")
      .populate("presentStudent.student", "firstName lastName email rollNumber")
      .sort({ createdAt: 1 }); // Sort by date ascending

    // Process records to show detailed attendance
    const detailedAttendance = attendanceRecords.map((record) => {
      // Check if this student was present
      const isPresent = record.presentStudent.some((entry) => {
        const studentId = entry.student || entry;
        return studentId && studentId._id 
          ? studentId._id.toString() === userId.toString()
          : studentId.toString() === userId.toString();
      });

      return {
        date: record.createdAt,
        classDate: record.createdAt.toDateString(),
        timestamp: record.createdAt.toISOString(),
        isPresent: isPresent,
        status: isPresent ? "Present" : "Absent",
        totalPresent: record.presentStudent.length,
        classId: record._id
      };
    });

    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    const presentCount = detailedAttendance.filter(record => record.isPresent).length;
    const absentCount = totalClasses - presentCount;
    const attendancePercentage = totalClasses > 0 
      ? ((presentCount / totalClasses) * 100).toFixed(2) 
      : "0.00";

    return res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject._id,
          name: subject.subjectName,
          code: subject.subjectCode
        },
        student: {
          id: student._id,
          rollNumber: student.rollNumber,
          branch: student.branch,
          semester: student.semester
        },
        statistics: {
          totalClasses,
          presentCount,
          absentCount,
          attendancePercentage
        },
        attendanceRecords: detailedAttendance
      }
    });

  } catch (error) {
    console.error("Error fetching detailed attendance:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};