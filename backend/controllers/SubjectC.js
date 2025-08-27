import Subject from "../models/Subject.js";
import User from "../models/User.js";

export const createSubject = async (req, res) => {
    try {
        const { instructor = "", branch = "", year = "", subjectCode = "", subjectName = "" } = req.body;

        
        if (!instructor || !branch || !year || !subjectCode || !subjectName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existSubject = await Subject.findOne({ year: year, subjectCode: subjectCode });
        if (existSubject) {
            return res.status(409).json({ success: false, message: "This code is already assigned to another subject in this year." });
        }

        const instructorDetails = await User.findById(instructor);
        if (!instructorDetails) {
            return res.status(404).json({ success: false, message: "Instructor not found." });
        }

        const newSubject = await Subject.create({
            subjectName: subjectName,
            subjectCode: subjectCode,
            instructor: instructor,
            year: year,
            branch: branch
        });

        const updatedUser = await User.findByIdAndUpdate(
            instructor,
            {
                $push: { subjects: newSubject._id } 
            },
            { new: true } 
        );

        
        return res.status(201).json({
            success: true,
            message: "Subject Created Successfully.",
            data: newSubject,
            user: updatedUser
        });
    } catch (error) {
        console.log("Error in create Subject Controller.", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}