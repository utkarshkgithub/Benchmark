import User from "../models/User.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js"
import Subject from "../models/Subject.js";
import { normalizeBranchName } from "../utils/branchUtils.js";
import { studentsMail } from "../mail/templates/data/studentMails.js";
dotenv.config();
import crypto from 'crypto';


//send otp
export const sendOTP = async (req, res) => {
    try {
        const { email, extra = "" } = req.body;

        if (extra == "") {
            const chackUserPreSent = await User.findOne({ email });

            if (chackUserPreSent) {
                return res.status(401).json({
                    success: false,
                    message: "User already registered",
                });
            }
        }

        // Clean up any existing OTPs for this email before generating new one
        await OTP.deleteMany({ email });

        //generate otp

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // console.log("OTP generated:-", otp);

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

        const otpPayload = { email, otp, extra };


        const otpBody = await OTP.create(otpPayload);
        // console.log("OTP body:-",otpBody);

        // return response successfully

        res.status(200).json({
            success: true,
            message: "OTP sent Successfully.",
            // otp,
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
            semester = "",
            deviceId = "",
            department = "",
            subjects = [],
        } = req.body;
        let { branch = "" } = req.body;
        if (!firstName || !lastName || !email || !password || !accountType || !otp) {
            return res.status(403).json({
                success: false,
                message: "All required fields must be filled.",
            });

        }

        if (branch === "PG") {
            if (!studentsMail().includes(email)) {
                return res.status(403).json({
                    success: false,
                    message: "Email not authorized for PG signup."
                });
            }
        }


        if (
            accountType === "Student" &&
            (!rollNumber || !branch || !semester || !deviceId)
        ) {
            // Clean up OTP since signup failed due to missing required fields
            await OTP.deleteMany({ email });
            return res.status(403).json({
                success: false,
                message: "Student account requires rollNumber, branch, semester, and deviceId",
            });
        } else if (accountType === "Instructor" && !department) {
            // Clean up OTP since signup failed due to missing required fields
            await OTP.deleteMany({ email });
            return res.status(403).json({
                success: false,
                message: "Instructor account requires department",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Clean up OTP since user already exists
            await OTP.deleteMany({ email });
            return res.status(400).json({
                success: false,
                message: "User already registered with this email.",
            });
        }

        if (accountType === "Student") {
            branch = normalizeBranchName(branch);
            const compositeDeviceId = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${rollNumber}_${deviceId}`;

            const deviceDetails = await Student.findOne({ deviceId: compositeDeviceId });
            if (deviceDetails) {
                // Clean up OTP since device is already assigned
                await OTP.deleteMany({ email });
                return res.status(400).json({
                    success: false,
                    message: "Device already assigned to other.",
                });
            }
            const rollDetails = await Student.findOne({ rollNumber });
            if (rollDetails) {
                // Clean up OTP since roll number already exists
                await OTP.deleteMany({ email });
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

        // Clean up the verified OTP immediately after successful verification
        await OTP.deleteMany({ email });

        const hashedPassword = await bcrypt.hash(password, 10);

        const userDetails = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            approved: accountType === "Instructor" ? false : true,
            active: true,
            image: `https://api.dicebear.com/5.x/initials/png?seed=${firstName}%20${lastName}`,
        });

        let user = "";
        try {
            if (accountType === "Student") {
                const compositeDeviceId = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${rollNumber}_${deviceId}`;

                let finalSubjects = [...subjects];

                const branchSemesterSubjects = await Subject.find({
                    branches: { $in: [branch] },
                    semester: semester,
                }).select("_id");

                const extraSubjectIds = branchSemesterSubjects.map((sub) => sub._id.toString());

                finalSubjects = [...new Set([...finalSubjects, ...extraSubjectIds])];

                user = await Student.create({
                    userId: userDetails._id,
                    deviceId: compositeDeviceId,
                    rollNumber,
                    branch,
                    semester,
                    subjects: finalSubjects,
                });

                await Subject.updateMany(
                    { _id: { $in: finalSubjects } },
                    { $addToSet: { students: user.userId._id } }
                );
            } else if (accountType === "Instructor") {
                user = await Instructor.create({
                    userId: userDetails._id,
                    department,
                });
            }
        } catch (error) {
            await User.findByIdAndDelete(userDetails._id);
            // Clean up OTP in case of error during user creation
            await OTP.deleteMany({ email });
            console.error("Error during student/instructor creation:", error);
            return res.status(500).json({
                success: false,
                message: "User could not be registered, please try again.",
            });
        }

        return res.status(200).json({
            success: true,
            user,
            userDetails,
            message: "User registered successfully.",
        });
    } catch (error) {
        console.error(error);
        // Clean up any OTPs for this email in case of unexpected error
        if (req.body.email) {
            await OTP.deleteMany({ email: req.body.email });
        }
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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        let userDetails;
        if (user.accountType === "Student") {
            userDetails = await Student.findOne({ userId: user._id })
                .populate("subjects")
                .lean();
        } else if (user.accountType === "Instructor") {
            userDetails = await Instructor.findOne({ userId: user._id })
                .populate("subjectsTaught")
                .lean();
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const { password: _, ...userWithoutPassword } = user.toObject();

        const fullUser = {
            ...userWithoutPassword,
            ...userDetails,
        };

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
        const {
            email,
            password,
            deviceId = "",
            additionaldeviceId = ""
        } = req.body;

console.log(email,password,deviceId,additionaldeviceId)
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required, please try again.",
            });
        }

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first.",
            });
        }

        if(user.accountType == "Student"){
            if (
            typeof user.isActiveToken === "undefined" ||
            !user.activeToken ||
            typeof user.activePasswordExpires === "undefined"
        ) {
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        isActiveToken: user.isActiveToken ?? false,
                        activeToken: user.activeToken ?? { token: "", expiresAt: new Date(0) },
                        activePasswordExpires: user.activePasswordExpires ?? new Date(0),
                    },
                }
            );

            // Refetch updated user
            const updatedUser = await User.findById(user._id).lean();
            user.isActiveToken = updatedUser.isActiveToken;
            user.activeToken = updatedUser.activeToken;
            user.activePasswordExpires = updatedUser.activePasswordExpires;
        }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect.",
            });
        }
        if(user.accountType == "Student" 
            && 
            !["amit3.230101023@iiitbh.ac.in", "utkarsh2.230101147@iiitbh.ac.in"].includes(user.email)
        ){

        const currentTime = new Date();
        const waitDurationMs = 1.5 * 60 * 1000;

        if (user.isActiveToken === false) {
            const tokenString = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + waitDurationMs);

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        isActiveToken: true,
                        activeToken: {
                            token: tokenString,
                            expiresAt: expiresAt,
                        },
                    },
                }
            );

            return res.status(403).json({
                success: false,
                message: "You can not login again within 1 minute 30 seconds. Please wait.",
            });
        }

        // If isActiveToken is true, check expiration
       
         if (user.isActiveToken === true) {
            if (user.activeToken && user.activeToken.expiresAt) {
                const expiresAt = new Date(user.activeToken.expiresAt);
                if (expiresAt > currentTime) {
                    const remaining = expiresAt - currentTime;
                    const seconds = Math.floor((remaining / 1000) % 60);
                    const minutes = Math.floor((remaining / 1000 / 60) % 60);

                    return res.status(403).json({
                        success: false,
                        message: `You cannot login again. Please wait ${minutes} minute(s) ${seconds} second(s).`,
                    });
                }
            }
            // Token expired, reset token state
            await User.updateOne(
                { _id: user._id },
                { $set: { isActiveToken: false, activeToken: null } }
            );
        }

       }
        // Proceed with generating new token and completing login

        // Fetch additional user details
        let userDetails = null;
        if (user.accountType === "Student") {
            userDetails = await Student.findOne({ userId: user._id })
                .populate("subjects")
                .lean();

            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Student details not found.",
                });
            }


            const compositeDeviceId = `${user.firstName.toLowerCase()}_${user.lastName.toLowerCase()}_${userDetails.rollNumber}_${deviceId}`;

// console.log("compositeDeviceId:-",compositeDeviceId)
            const finalDeviceId = `${user.firstName.toLocaleLowerCase()}_${user.lastName.toLocaleLowerCase()}_${deviceId}_${userDetails.rollNumber}_${additionaldeviceId}`
// console.log("finalDeviceId:-",finalDeviceId)


            if (userDetails.deviceId !== compositeDeviceId && userDetails.deviceId !== finalDeviceId) {
                return res.status(401).json({
                    success: false,
                    message: "Device not matched, please use old device.",
                });
            }


            if (userDetails.deviceId == compositeDeviceId) {
                await Student.findByIdAndUpdate(
                    {_id:userDetails._id},
                    { $set: { deviceId: finalDeviceId } }
                );
            }


            // remove this condition if apply upper logic

            // if (userDetails.deviceId !== compositeDeviceId) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "Device not matched, please use old device.",
            //     });
            // }


        } else if (user.accountType === "Instructor") {
            userDetails = await Instructor.findOne({ userId: user._id })
                .populate("subjectsTaught")
                .lean();

            if (!userDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Instructor details not found.",
                });
            }
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };

        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        delete user.password; // Do not expose password

        const fullUser = {
            ...user,
            ...userDetails,
        };

        // Set the token in cookie
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res
            .cookie("token", jwtToken, options)
            .status(200)
            .json({
                success: true,
                token: jwtToken,
                user: fullUser,
                message: "Logged in successfully.",
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again.",
        });
    }
};



export const duplicateUsers = async (req, res) => {
    try {
        const duplicates = await Student.aggregate([
            {
                $addFields: {
                    baseDeviceId: {
                        $arrayElemAt: [
                            { $split: ["$deviceId", "_"] },
                            -1
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$baseDeviceId",
                    count: { $sum: 1 },
                    students: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (duplicates.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No duplicate base deviceIds found.",
                duplicates: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Duplicate base deviceIds found.",
            duplicates: duplicates
        });

    } catch (error) {
        console.error("Error finding duplicate users:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while checking for duplicate device IDs."
        });
    }
};




