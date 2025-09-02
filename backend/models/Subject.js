import mongoose from "mongoose";
const SubjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  subjectCode: {
    type: String,
    required: true,
    unique: true
  },
  semester: {
    type: String,
    required: true,
    enum: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
  },
  branches: [{
    type: String,
    enum: ["CSE", "ECE", "MAE", "MNC"],
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  isMinor: {
    type: Boolean,
    default: false,
    required: true
  }

});

const Subject = mongoose.model("Subject", SubjectSchema);
export default Subject;