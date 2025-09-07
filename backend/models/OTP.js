import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
import {otpTemplate} from "../mail/templates/otpTemplate.js"
import { forgotPasswordTemplate } from "../mail/templates/forgot--passwordTemplate.js";
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,   
    expires: 300,       
  },
  otp: {
    type: String,
    required: true,
  },
  extra:{
    type:String
  }
});

async function sendVerificationEmail(email, otp, extra) {
  try {
    // console.log("extra",extra)
    if(extra == "Forgot-Password"){
      const mailResponse = await mailSender(
      email,
      "Verification Email from IIITBH",
      forgotPasswordTemplate(otp),
    );
   }else{
    const mailResponse = await mailSender(
      email,
      "Verification Email from IIITBH",
      otpTemplate(otp),
    );
   }
  } catch (error) {
    console.log("Error occured while sending emails: ", error);
   

    throw error;
  }
}


OTPSchema.pre("save", async function (next) {
  if(this.isNew){
    await sendVerificationEmail(this.email,this.otp , this.extra);
    
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;




// $2b$10$pyJwxj/e8lL/61JFXqyRveIqrWQuz1jruHvqDNCayEmF4vwk1KV8q