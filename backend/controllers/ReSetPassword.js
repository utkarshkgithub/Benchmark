import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


// =============================
//  Generate Password Reset Link
// =============================
export const resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal email existence
            return res.json({
                success: true,
                message: "If this email is registered, a reset link has been sent.",
            });
        }

        // Generate token
        const token = crypto.randomBytes(20).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Save hashed token and expiry in DB
        await User.findOneAndUpdate(
            { email },
            {
                token: hashedToken,
                resetPasswordExpires: Date.now() + 3600000, // 1 hour
            },
            { new: true }
        );

        // Create reset URL with raw token
       const url = `https://benchmark-official.vercel.app/update-password/${token}`;
       
        // Send email
        const mailres = await mailSender(
            email,
            "Password Reset",
            `Your Link for password reset is ${url}. Please click this link to reset your password.`
        );
        console.log("mailres:-",mailres)

        return res.json({
            success: true,
            message: "If this email is registered, a reset link has been sent.",
        });

    } catch (error) {
        console.log("Error in resetPasswordToken:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending reset password mail.",
        });
    }
};



// =============================
//  Reset Password
// =============================
export const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        // Password match check
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        // Hash the received token to match DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Get user with token
        const userDetails = await User.findOne({ token: hashedToken });
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid.",
            });
        }

        // Check if token expired
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Your token has expired, please generate a new one.",
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password & clear reset fields
        await User.findOneAndUpdate(
            { token: hashedToken },
            {
                password: hashedPassword,
                token: undefined,
                resetPasswordExpires: undefined,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });

    } catch (error) {
        console.log("Error in resetPassword:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Something went wrong while resetting password.",
        });
    }
};
