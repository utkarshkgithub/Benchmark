import OTP from "../models/OTP.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: `Your Email: ${email} is not registered With us Enter a Valid Email`,
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true });
        const url = `https://benchmark-official.vercel.app/update-password/${token}`;
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );


        return res.json({
            success: true,
            message: 'Email send successfully,Please Check Your Email to Continue Further.',

        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sendind reset pwd mail."
        })
    }

}


export const resetPassword = async (req, res) => {
    try {
        const { otp, password, email } = req.body;

        const user = await User.findOne({ email:email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const recentOtp = await OTP.find({ email: email })
            .sort({ createdAt: -1 })
            .limit(1);

        if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { email: email },
            { password: hashedPassword },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while resetting the password.",
            error: error.message,
        });
    }
};
