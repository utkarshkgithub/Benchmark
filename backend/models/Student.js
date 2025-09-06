    import mongoose from "mongoose";


    const studentSchema = new mongoose.Schema(
        {
            userId: {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                unique:true,
            },
            deviceId: {
                type: String,
                unique: true,
            },
            rollNumber: {
                type: String,
                unique: true,
            },
            branch: {
                type: String,
                required: true,
                enum: ["CSE", "ECE", "MAE", "MNC", "PG"],
            },
            semester: {
                type: String,
                required: true,
                enum: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
            },
            subjects:[{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Subject",
            }]
        },
        {
            timestamps: true
        }
    );


    const Student = mongoose.model("Student", studentSchema);
    export default Student;