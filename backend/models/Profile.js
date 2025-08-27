
import mongoose from "mongoose" ;


const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"],
    },
    dateOfBirth: {
        type: String,

    },
    about: {
        type: String,
        trim: true,
    },
    contectNumber: {
        type: String,
        enum: ["1st", "2nd", "3rd", "4th"],
    },
    year: {
        type: String,
        trim: true,
    },
    branch: {
        type: String,
        enum: ["CSE", "ECE", "MNC", "MAE", "Other"],
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },]

});


const Profile = mongoose.model("Profile", profileSchema);
export default Profile