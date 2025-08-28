import mongoose from "mongoose";


const instructorSchema = new mongoose.Schema(
    {
        userId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            unique:true,
        },
        subjectsTaught:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Subject",
        }],
        department:{
            type:String
        }
    },
    {
        timestamps: true
    }
);


const Instructor = mongoose.model("Instructor", instructorSchema);
export default Instructor;

