import Instructor from "../models/Instructor.js";
import Subject from "../models/Subject.js";

export const createSubject = async (req, res) => {
  try {
    const {
      instructor = "",
      branch = "",
      semester = "",
      subjectCode = "",
      subjectName = "",
    } = req.body;

    if (!instructor || !branch || !semester || !subjectCode || !subjectName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

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
    const instructorDetails = await Instructor.findById(instructor);
    if (!instructorDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }

    // create subject
    const newSubject = await Subject.create({
      subjectName,
      subjectCode,
      instructor,
      semester,
      branch,
    });

    // add subject reference inside instructor
    await Instructor.findByIdAndUpdate(instructor, {
      $push: { subjectsTaught: newSubject._id },
    });

    // populate instructor with subjects taught
    const populatedSubject = await Subject.findById(newSubject._id)
      .populate({
        path: "instructor",
        populate: {
          path: "subjectsTaught",
          select: "subjectName subjectCode semester branch", // only useful fields
        },
      })
      .lean();

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
