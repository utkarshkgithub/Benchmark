import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
            trim:true,
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
        },
        userName:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
        },
        password:{
            type:String,
            required:true,
            trim:true,
        },
        accountType:{
            type:String,
            required:true,
            enum:["Admin","Student","Instructor"],
        },
        additionalDetails:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Profile",
        },
        active: {
            type: Boolean,
            default: true,
        },
        approved: {
            type: Boolean,
            default: true,
        },
        subjects:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Subject",
            }
        ],
        image:{
            type:String,
            required:true,
        },
        token:{
            type:String,
        },
        resetPasswordExpires:{
            type:Date,
        },
        // deviceId:{
        //     type:String,
        //     unique:true,
        // }
        // courseProgress:[
        //     {
        //         type:mongoose.Schema.Types.ObjectId,
        //         ref:"CourseProgress",
        //     }
        // ],
    },
	{ 
        timestamps: true 
    }
);


const User = mongoose.model("User",userSchema);
export default User;