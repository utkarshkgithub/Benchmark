import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        presentStudent: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                markedAt: {
                    type: Date,
                    default: Date.now,
                    required: true,
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
