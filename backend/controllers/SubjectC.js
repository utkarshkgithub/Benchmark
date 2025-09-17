import Instructor from "../models/Instructor.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Student from "../models/Student.js";

import { normalizeBranchNames, VALID_BRANCHES } from "../utils/branchUtils.js";
import Attendance from "../models/Attendance.js";

export const createSubject = async (req, res) => {
  try {
    let { subjectName, subjectCode, branches, instructor,semester, isMinor} = req.body;

    branches = normalizeBranchNames(branches);

    const invalidBranches = branches.filter(
      (branch) => !VALID_BRANCHES.includes(branch)
    );
    if (invalidBranches.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid branches: ${invalidBranches.join(", ")}`,
      });
    }

    const students = await Student.find({
      branch: { $in: branches },
      semester: semester,
    });

    const subject = await Subject.create({
      subjectName,
      subjectCode,
      branches,
      semester,
      instructor: instructor,
      isMinor: isMinor || false,
      students: students.map(student => student.userId),
    });

    
if (instructor) {
  const updatedInstructor = await Instructor.findOneAndUpdate(
    { userId: instructor },           
    { $addToSet: { subjectsTaught: subject._id } },
    { new: true }                      
  );

  if (!updatedInstructor) {
    console.warn(`Instructor with userId ${instructor} not found`);
  }
} else {
  console.warn("No instructor ID provided for this subject");
}



  
    await Promise.all(
      students.map(student =>
        Student.findByIdAndUpdate(student._id, {
          $addToSet: { subjects: subject._id },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: "Subject created and students assigned successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error in create Subject Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error.message,
    });
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

export const fetchStudent = async (req, res) => {
  try {
    const students = await Student.find({})
      .populate({
        path: "userId",
        select: "firstName lastName email accountType",
        model: "User",
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "All Students fetched successfully",
      data: students,
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

    // ✅ Verify that the subject belongs to the instructor
    const subject = await Subject.findOne({ _id: subjectId, instructor: instructorId });
    if (!subject) {
      return res.status(403).json({ success: false, message: "Unauthorized access to subject" });
    }

    // ✅ Get attendance records and populate presentStudent.student
    const attendance = await Attendance.find({ subject: subjectId })
      .populate("presentStudent.student", "firstName lastName email")
      .sort({ createdAt: -1 });

    // ✅ Count total students enrolled in the subject considering applicable branches
    const totalStudents = await Student.countDocuments({
      subjects: subjectId,
      branch: { $in: subject.branches },
    });

    // ✅ Format the attendance data to include populated student details
    const formatted = attendance.map((rec) => ({
      _id: rec._id,
      date: rec.date,
      branch: subject.branches.join(", "),
      totalStudents: totalStudents,
      presentStudent: rec.presentStudent
        .filter(entry => entry.student) // Filter out entries without student
        .map((entry) => ({
          studentId: entry.student._id,
          name: `${entry.student.firstName} ${entry.student.lastName}`,
          email: entry.student.email,
          markedAt: entry.markedAt,
        })),
    }));

    // ✅ Return response
    return res.status(200).json({
      success: true,
      attendance: formatted,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

export const getSubjectStudents = async (req, res) => {
  try {
    const { subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const students = await Student.find({ subjects: subjectId })
      .populate("userId", "firstName lastName email") 
      .lean();

    return res.status(200).json({
      success: true,
      subject,
      students,
    });
  } catch (error) {
    console.error("Error fetching subject students:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject students",
    });
  }
};

