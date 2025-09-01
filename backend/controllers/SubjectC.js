import Instructor from "../models/Instructor.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

export const createSubject = async (req, res) => {
  try {
    const {
      instructor = "",
      branches = [],
      semester = "",
      subjectCode = "",
      subjectName = "",
    } = req.body;

    if (!instructor || !branches.length || !semester || !subjectCode || !subjectName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    console.log("instructor:-",instructor);
    // check subject already exists in semester
    const existSubject = await Subject.findOne({ semester, subjectCode });
    if (existSubject) {
      return res.status(409).json({
        success: false,
        message:
          "This code is already assigned to another subject in this semester.",
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
      instructor: userDetails._id,  // use the user ID here
      semester,
      branches,
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


export const fetchInstructor = async (req,res) => {
  try {
    const users = await User.find({accountType:"Instructor"}, { firstName: 1 , lastName:1, email:1}).lean();
    
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