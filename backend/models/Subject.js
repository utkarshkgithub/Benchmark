import mongoose from "mongoose";
const SubjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  subjectCode:{
    type:String,
    required:true,
    unique:true
  },
  year:{
    type:String,
    enum:["1st","2nd","3rd","4th","5th"],
    required:true,
  },
  branch:{
    type:String,
    enum:["CSE","ECE","MAE","MNC"],
    required:true,
  },
  instructor:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
  },
  students:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  }]
  
});

const Subject = mongoose.model("Subject", SubjectSchema);
export default Subject;