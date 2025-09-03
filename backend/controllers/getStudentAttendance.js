import Attendence from "../models/Attendence.js";
import Student from "../models/Student.js";

export const fetchStudentAttendance = async (req, res) => {
  try {
    // ✅ Get logged-in user id from req.user (auth middleware must set this)
    const userId = req.user.id;

    // ✅ Find student by userId
    const student = await Student.findOne({ userId }).populate("subjects");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // ✅ Fetch attendance records for student's subjects
    const attendanceRecords = await Attendence.find({
      subject: { $in: student.subjects },
    })
      .populate("subject", "subjectName subjectCode")
      .populate("presentStudent", "firstName lastName email");

    // ✅ Calculate attendance summary
    const attendanceData = student.subjects.map((sub) => {
      const subjectAttendance = attendanceRecords.filter(
        (record) => record.subject._id.toString() === sub._id.toString()
      );

      const totalClasses = subjectAttendance.length;
      const presentCount = subjectAttendance.filter((rec) =>
        rec.presentStudent.some(
          (stu) => stu._id.toString() === userId.toString()
        )
      ).length;

      return {
        subjectId: sub._id,
        subjectName: sub.subjectName || "N/A",
        totalClasses,
        presentCount,
        percentage: totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : "0.00",
      };
    });

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        branch: student.branch,
        semester: student.semester,
      },
      attendance: attendanceData,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};