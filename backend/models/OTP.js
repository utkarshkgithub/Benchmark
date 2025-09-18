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

    // Don't throw error to prevent blocking the response
    // Just log it for debugging
  }
}

OTPSchema.pre("save", async function (next) {
  if(this.isNew){
     setImmediate(async () => {
      try {
        await sendVerificationEmail(this.email, this.otp, this.extra);
      } catch (error) {
        console.log("Background email sending failed:", error);
      }
    });
    
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;