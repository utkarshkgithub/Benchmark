import mongoose from "mongoose";


const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type:String,
        },
        subject:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Subject",
        },
        presentStudent:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }]
    },
    {
        timestamps: true
    }
);


const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

