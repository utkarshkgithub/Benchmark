import mongoose from "mongoose";
import {otpTemplate} from "../mail/templates/otpTemplate.js"
import { forgotPasswordTemplate } from "../mail/templates/forgot--passwordTemplate.js";
import {mailSender} from '../utils/mailSender.js'
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
    console.log(`🚀 Attempting to send ${extra === "Forgot-Password" ? "forgot password" : "OTP"} email to: ${email}`);
    console.log(`🔧 OTP value: ${otp}`);
    
    if(extra == "Forgot-Password"){
      console.log("📝 Preparing forgot password email template...");
      const mailResponse = await mailSender(
        email,
        "Verification Email from IIITBH",
        forgotPasswordTemplate(otp),
      );
      console.log("✅ Forgot password email sent successfully");
      console.log("📧 Mail response:", mailResponse);
   }else{
      console.log("📝 Preparing OTP email template...");
      const mailResponse = await mailSender(
        email,
        "Verification Email from IIITBH",
        otpTemplate(otp),
      );
      console.log("✅ OTP email sent successfully");
      console.log("📧 Mail response:", mailResponse);
   }
  } catch (error) {
    console.error("❌ Error occurred while sending emails:", error.message);
    console.error("❌ Full error details:", error);
    console.error("❌ Error stack:", error.stack);

    // Don't throw error to prevent blocking the response
    // Just log it for debugging
  }
}

OTPSchema.pre("save", async function (next) {
  if(this.isNew){
    try {
      await sendVerificationEmail(this.email, this.otp, this.extra);
      console.log("✅ Email sent before save completed");
    } catch (error) {
      console.error("❌ Error in pre-save email:", error);
      // Don't block the save operation if email fails
    }
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;