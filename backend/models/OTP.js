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
    console.log(`📧 Preparing to send verification email to: ${email}`);
    console.log(`🔑 OTP: ${otp}, Type: ${extra || 'Regular'}`);
    
    let mailResponse;
    if(extra == "Forgot-Password"){
      mailResponse = await mailSender(
        email,
        "Verification Email from IIITBH",
        forgotPasswordTemplate(otp),
      );
    } else {
      mailResponse = await mailSender(
        email,
        "Verification Email from IIITBH",
        otpTemplate(otp),
      );
    }
    
    if (mailResponse && mailResponse.success) {
      console.log("✅ Email sent successfully");
      return { success: true, data: mailResponse };
    } else {
      console.log("❌ Email sending failed:", mailResponse?.error || "Unknown error");
      return { success: false, error: mailResponse?.error || "Unknown error" };
    }
    
  } catch (error) {
    console.log("❌ Error occurred while sending emails:", error.message);
    // Don't throw the error - just log it and continue
    // This prevents the pre-save hook from failing and blocking OTP creation
    return { success: false, error: error.message };
  }
}


OTPSchema.pre("save", async function (next) {
  if(this.isNew){
    try {
      console.log(`🚀 Pre-save hook: Sending email for OTP creation...`);
      const emailResult = await sendVerificationEmail(this.email, this.otp, this.extra);
      
      if (emailResult.success) {
        console.log("✅ Email sent successfully during OTP creation");
      } else {
        console.log("⚠️ Email failed but continuing with OTP creation:", emailResult.error);
      }
    } catch (error) {
      // Log the error but don't prevent OTP from being saved
      console.log("❌ Failed to send email during OTP creation:", error.message);
      // Continue with saving the OTP even if email fails
    }
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;