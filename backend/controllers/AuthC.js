import User from "../models/User.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";
import mailSender from '../utils/mailSender.js';
import dotenv from "dotenv";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js"
import { passwordUpdated } from "../mail/templates/passwordUpdate.js";
dotenv.config();

//send otp
export const sendOTP = async (req, res) => {
    console.log("2:---")
    try {
        // fetch email from request ki body
        const { email } = req.body;
        // check if user already exist
        const chackUserPreSent = await User.findOne({ email });

        //if user is already exits,then return a response.
        if (chackUserPreSent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            });
        }

        //if user not exist already,then we generate OTP.

        //generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // console.log("OTP generated:-", otp);

        //check unique otp or not
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            result = await OTP.findOne({ otp: otp });
        }


        // console.log("Result is Generate OTP Func");
        // console.log("Result", result);

        const otpPayload = { email, otp };

        //create an en entry in db for otp

        const otpBody = await OTP.create(otpPayload);
        // console.log("OTP body:-",otpBody);

        // return response successfully

        res.status(200).json({
            success: true,
            message: "OTP sent Successfully.",
            otp,
        });
    } catch (error) {
        console.log("Issues Occure in generate Otp");
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//sign-Up
export const signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            accountType,
            password,
            otp,
            rollNumber = "",
            branch = "",
            semester = "",
            deviceId = "",
            department = ""
        } = req.body;

        // ✅ validate required fields
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !accountType ||
            !otp
        ) {
            return res.status(403).json({
                success: false,
                message: "All required fields must be filled.",
            });
        }

        // For Student account, extra fields are required
        if (
            accountType === "Student" &&
            (!rollNumber || !branch || !semester || !deviceId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Student account requires rollNumber, branch, semester, deviceId",
            });
        } else if (accountType == "Instructor" && (!department)) {
            return res.status(403).json({
                success: false,
                message: "Instructor account requires dedpartment",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this email.",
            });
        }

        if (accountType == "Student") {
            const deviceDetails = await Student.findOne({ deviceId });
            if (deviceDetails) {
                return res.status(400).json({
                    success: false,
                    message: "Device already assigned to other.",
                });
            }
            const rollDetails  = await Student.findOne({rollNumber});
            if (rollDetails) {
                return res.status(400).json({
                    success: false,
                    message: "ROLL NUMBER should must be Unique",
                });
            }
        }


        const recentOtp = await OTP.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);

        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found.",
            });
        } else if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userDetails = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            approved: accountType === "Instructor" ? false : true,
            active: true,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
        });
        let user = "";
        
        if (accountType === "Student") {
            user = await Student.create({
                userId: userDetails._id,
                deviceId,
                rollNumber,
                branch,
                semester,
            });
        } else if (accountType === "Instructor") {
            user = await Instructor.create({
                userId: userDetails._id,
                department: department , 
            });
        }

        return res.status(200).json({
            success: true,
            user: user,
            userDetails:userDetails,
            message: "User registered successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User could not be registered, please try again.",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required, please try again.",
            });
        }

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        // check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        // fetch userDetails with subject population
        let userDetails;
        if (user.accountType === "Student") {
            userDetails = await Student.findOne({ userId: user._id })
                .populate("subjects") // ✅ populate subjects
                .lean();
        } else if (user.accountType === "Instructor") {
            userDetails = await Instructor.findOne({ userId: user._id })
                .populate("subjectsTaught") // ✅ populate subjectsTaught
                .lean();
        }

        // generate JWT
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // remove password before sending response
        const { password: _, ...userWithoutPassword } = user.toObject();

        // combine user + userDetails into one object
        const fullUser = {
            ...userWithoutPassword,
            ...userDetails,
        };

        // create cookie
        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res
            .cookie("token", token, options)
            .status(200)
            .json({
                success: true,
                token,
                user: fullUser,
                message: "Logged in Successfully.",
            });
    } catch (error) {
        console.log("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
};

export const mobLogin = async (req, res) => {
    try {
        // get data from request body
        const { email, password, deviceId = "" } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required, please try again.",
            });
        }

        // check if user exists
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        let userDetails = null;

        if (user.accountType === "Student") {
           userDetails = await Student.findOne({ userId: user._id })
                .populate("subjects") // ✅ populate subjects
                .lean();
            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Student details not found.",
                });
            }
            if (userDetails.deviceId !== deviceId) {
                return res.status(401).json({
                    success: false,
                    message: "Device not matched, please use old device",
                });
            }
        } else if (user.accountType === "Instructor") {
            userDetails = await Instructor.findOne({ userId: user._id })
                .populate("subjectsTaught") // ✅ populate subjectsTaught
                .lean();
            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor details not found.",
                });
            }
            // Device check can be enabled here if required:
            // if (userDetails.deviceId !== deviceId) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "Device not matched, please use old device",
            //     });
            // }
        }

        // check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        // generate token
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // remove password field
        delete user.password;

        // merge user + userDetails + token
        const fullUser = {
            ...user,
            ...userDetails,
        };
        // console.log("uuserData:-",fullUser)

        // cookie options
        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

            return res
                .cookie("token", token, options)
                .status(200)
                .json({
                    success: true,
                    token,
                    user: fullUser,
                    message: "Logged in Successfully.",
                });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Login Failure, please try again",
            });
        }
};


//change password
export const changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);
        // console.log(userDetails)
        // get data from request
        const { currentPassword, newPassword } = req.body;
        // validation
        const email = userDetails.email;
        const user = await User.findOne({ email });
        if (!currentPassword || !newPassword) {
            return res.status(401).json({
                success: false,
                message: "Please fill all details",
            });
        }
        else if (await bcrypt.compare(currentPassword, user.password)) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // entry create in db
            const updatedUserDetails = await User.findOneAndUpdate(
                { email: email },              // find basis of email.
                { password: hashedPassword },  // update password
                { new: true }                  // return new updated password.
            );

            // send mail - Password Updated.
            try {
                const emailResponse = await mailSender(
                    updatedUserDetails.email,
                    `Password Updated Successfully`,
                    passwordUpdated(
                        updatedUserDetails.email,
                        updatedUserDetails.firstName
                    )
                );
                // console.log(emailResponse);
                if (emailResponse && emailResponse.response) {
                    console.log("Email sent successfully");
                } else {
                    console.log("Email sent successfully, but no response received.");
                }
                console.log("Email sent successfully");
            } catch (error) {
                // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
                console.error("Error occurred while sending email:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error occurred while sending email",
                    error: error.message,
                });
            }

            // return res
            return res.status(200).json({
                success: true,
                message: "Password changed successfully.",
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Incorrect current password.",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Password can't be changed, issue in password change.",
            error: error.message,
        });
    }
};