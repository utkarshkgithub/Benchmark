import mongoose from "mongoose";


const attendenceSchema = new mongoose.Schema(
    {
        date: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            unique:true,
        },
        subjects:{
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


const Attendence = mongoose.model("Attendence", attendenceSchema);
export default Attendence;

