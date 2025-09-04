import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
import {otpTemplate} from "../mail/templates/otpTemplate.js"
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
  }
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from IIITBH",
      otpTemplate(otp),
    );
    // console.log("Email sent Successfully:", mailResponse);
  } catch (error) {
    console.log("Error occured while sending emails: ", error);
    // console.log("otp:-",otp);
    // console.log("email:-",email);

    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  if(this.isNew){
    await sendVerificationEmail(this.email, this.otp);
    
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;
