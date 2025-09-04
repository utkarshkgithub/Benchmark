import Instructor from "../models/Instructor.js";
import User from "../models/User.js";
import Attendence from "../models/Attendence.js";
import Subject from "../models/Subject.js";
import Student from "../models/Student.js";
// controllers/attendanceController.js


export const createSubject = async (req, res) => {
  try {
    const {
      instructor = "",
      branches = [],
      semester = "",
      subjectCode = "",
      subjectName = "",
      isMinor = false,
    } = req.body;

    if (!instructor || !branches.length || !semester || !subjectCode || !subjectName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // check subject already exists in semester
    const existSubject = await Subject.findOne({
      semester,
      subjectCode,
      branches: { $in: branches },   // ✅ check if any branch overlaps
    });

    if (existSubject) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code is already assigned to one of the selected branches in this semester.",
      });
    }
    

    // check instructor
    const userDetails = await User.findById(instructor);
    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find instructor details where userId matches
    const instructorDetails = await Instructor.findOne({ userId: userDetails._id });
    if (!instructorDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }

    // create subject
    const newSubject = await Subject.create({
      subjectName,
      subjectCode,
      instructor: userDetails._id,
      semester,
      branches,
      isMinor,
    });

    await Instructor.findByIdAndUpdate(instructorDetails._id, {
      $push: { subjectsTaught: newSubject._id },
    });

    const populatedSubject = await Subject.findById(newSubject._id)
      .populate({
        path: "instructor",
        select: "firstName lastName email accountType",
        model: "User"
      })
      .lean();

    const instructorSubjects = await Subject.find({
      instructor: userDetails._id
    })
      .select("subjectName subjectCode semester branch")
      .lean();

    populatedSubject.instructor.subjects = instructorSubjects;

    return res.status(201).json({
      success: true,
      message: "Subject Created Successfully.",
      data: populatedSubject,
    });
  } catch (error) {
    console.log("Error in create Subject Controller.", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};



export const fetchInstructor = async (req, res) => {
  try {
    const users = await User.find({ accountType: "Instructor" }, { firstName: 1, lastName: 1, email: 1 }).lean();

    return res.status(200).json({
      success: true,
      message: "All Instructor fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching Instructor:", error);
    return s500(res, error.message);
  }

}

export const fetchSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({})
      .populate({
        path: "instructor",
        select: "firstName lastName email accountType",
        model: "User",
      })
      .populate({
        path: "students",
        select: "firstName lastName email",
        model: "User",
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "All Subjects fetched successfully",
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching Subjects:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subjects",
      error: error.message,
    });
  }
};



export const fetchInstructorSubjects = async (req, res) => {
  try {
    const userId = req.user.id; // instructor id from JWT

    const subjects = await Subject.find({ instructor: userId })
      .populate("instructor", "firstName lastName email");

    return res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching instructor subjects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor subjects",
    });
  }
};



export const fetchAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const instructorId = req.user.id;

    // ✅ check subject belongs to instructor
    const subject = await Subject.findOne({ _id: subjectId, instructor: instructorId });
    if (!subject) {
      return res.status(403).json({ success: false, message: "Unauthorized access to subject" });
    }

    // ✅ get attendance records
    const attendance = await Attendence.find({ subject: subjectId })
      .populate("presentStudent", "firstName lastName email")
      .sort({ createdAt: -1 });

    // ✅ calculate total students by branch
    const totalStudents = await Student.countDocuments({
      subjects: subjectId,
      branch: { $in: subject.branches },
    });

    // ✅ format response
    const formatted = attendance.map((rec) => ({
      _id: rec._id,
      date: rec.date,
      branch: subject.branches.join(", "),
      totalStudents: totalStudents,
      presentStudent: rec.presentStudent,
    }));

    return res.status(200).json({
      success: true,
      attendance: formatted,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
    });
  }
};

export const getSubjectStudents = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const subject = await Subject.findById(subjectId).populate("students", "firstName lastName email");

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    return res.status(200).json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error("Error fetching subject students:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject students",
    });
  }
};
