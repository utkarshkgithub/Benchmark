import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
import emailQueue from "../utils/emailQueue.js";
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
    
    const subject = "Verification Email from IIITBH";
    const body = extra === "Forgot-Password" 
      ? forgotPasswordTemplate(otp)
      : otpTemplate(otp);
    
    // Try to send email immediately
    const mailResponse = await mailSender(email, subject, body);
    
    if (mailResponse && mailResponse.success) {
      console.log("✅ Email sent successfully");
      return { success: true, data: mailResponse };
    } else {
      console.log("❌ Email sending failed, adding to queue:", mailResponse?.error || "Unknown error");
      
      // Add to email queue as fallback
      const queueId = await emailQueue.addToQueue({
        to: email,
        subject: subject,
        body: body,
        type: extra || 'Regular',
        otp: otp
      });
      
      console.log(`📝 Email queued with ID: ${queueId}`);
      return { 
        success: false, 
        error: mailResponse?.error || "Unknown error",
        queued: true,
        queueId: queueId
      };
    }
    
  } catch (error) {
    console.log("❌ Error occurred while sending emails:", error.message);
    
    // Add to email queue as fallback
    const subject = "Verification Email from IIITBH";
    const body = extra === "Forgot-Password" 
      ? forgotPasswordTemplate(otp)
      : otpTemplate(otp);
      
    try {
      const queueId = await emailQueue.addToQueue({
        to: email,
        subject: subject,
        body: body,
        type: extra || 'Regular',
        otp: otp
      });
      
      console.log(`📝 Email queued due to error with ID: ${queueId}`);
      return { 
        success: false, 
        error: error.message,
        queued: true,
        queueId: queueId
      };
    } catch (queueError) {
      console.log("❌ Failed to queue email:", queueError.message);
      return { success: false, error: error.message };
    }
  }
}


OTPSchema.pre("save", async function (next) {
  if(this.isNew){
    try {
      console.log(`🚀 Pre-save hook: Sending email for OTP creation...`);
      const emailResult = await sendVerificationEmail(this.email, this.otp, this.extra);
      
      if (emailResult.success) {
        console.log("✅ Email sent successfully during OTP creation");
      } else if (emailResult.queued) {
        console.log("📝 Email queued for later delivery during OTP creation");
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