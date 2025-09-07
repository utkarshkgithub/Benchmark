import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { uploadToCloudinary } from "../utils/imageUploader.js";

export const updateDisplayPicture = async (req, res) => {
    try {
        const userPicture = req.files.displayPicture
        const userId = req.user.id;
        const image = await uploadToCloudinary(
            userPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )

        let userDetails;
        if (updatedProfile.accountType === "Student") {
            userDetails = await Student.findOne({ userId: updatedProfile._id })
                .populate("subjects")
                .lean();
        } else if (updatedProfile.accountType === "Instructor") {
            userDetails = await Instructor.findOne({ userId: updatedProfile._id })
                .populate("subjectsTaught") 
                .lean();
        }

        const fullUser = {
            ...updatedProfile.toObject(),
            ...(userDetails || {}),
        };

        res.send({
            success: true,
            message: "Image Updated successfully",
            data: fullUser,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error:error
        })
    }

}

export const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Subject.updateMany(
            { students: student.userId },
            { $pull: { students: student.userId } }
        );

        await User.findByIdAndDelete(student.userId);

        await Student.findByIdAndDelete(studentId);

        res.status(200).json({success:true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
