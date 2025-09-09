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
import Subject from "../models/Subject.js";
import { normalizeBranchName } from "../utils/branchUtils.js";
import { studentsMail } from "../mail/templates/data/studentMails.js";
dotenv.config();
import ActiveToken from '../models/ActiveToken.js';
import crypto from 'crypto';


//send otp
export const sendOTP = async (req, res) => {
    try {
        const { email,extra="" } = req.body;

        if(extra==""){const chackUserPreSent = await User.findOne({ email });

        if (chackUserPreSent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            });
        }}


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

        const otpPayload = { email, otp , extra };


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
    let {branch = ""} = req.body;
    if (!firstName || !lastName || !email || !password || !accountType || !otp) {
      return res.status(403).json({
        success: false,
        message: "All required fields must be filled.",
      });
      
    }

    if(branch === "PG") {
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
      return res.status(403).json({
        success: false,
        message: "Student account requires rollNumber, branch, semester",
      });
    } else if (accountType === "Instructor" && !department) {
      return res.status(403).json({
        success: false,
        message: "Instructor account requires department",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
        return res.status(400).json({
          success: false,
          message: "Device already assigned to other.",
        });
      }
      const rollDetails = await Student.findOne({ rollNumber });
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
        const { email, password, deviceId = "" } = req.body;

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

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect.",
            });
        }

        const currentTime = new Date();

        // Check if user has an active token
        if (user.isActiveToken == "true") {
            if (user.activeToken && user.activeToken.expiresAt > currentTime) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot login again within 2 minutes. Please wait.",
                });
            } else {
                // Token expired, reset token state
                await User.updateOne(
                    { _id: user._id },
                    { $set: { isActiveToken: "false", activeToken: null } }
                );
                user.isActiveToken = "false";
                user.activeToken = null;
            }
        }

        // Generate new token and update user record
        if (user.isActiveToken == "false") {
            const tokenString = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 1.5 * 60 * 1000); // 2 minutes from now

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        isActiveToken: "true",
                        activeToken: {
                            token: tokenString,
                            expiresAt: expiresAt,
                        },
                    },
                }
            );
            return res.status(403).json({
                    success: false,
                    message: "You cannot login again within 2 minutes. Please wait.",
                });
        }

        // Proceed with user details
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
            if (userDetails.deviceId !== compositeDeviceId) {
                return res.status(401).json({
                    success: false,
                    message: "Device not matched, please use old device.",
                });
            }
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

        // Generate JWT token for user session
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };

        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        delete user.password;

        const fullUser = {
            ...user,
            ...userDetails,
        };

        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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






//change password
// export const changePassword = async (req, res) => {
//     try {
//         const { password } = req.body;
//         // validation
//         const email = userDetails.email;
//         const user = await User.findOne({ email });
        
//         if (await bcrypt.compare(currentPassword, user.password)) {
//             const hashedPassword = await bcrypt.hash(newPassword, 10);

//             // entry create in db
//             const updatedUserDetails = await User.findOneAndUpdate(
//                 { email: email },              // find basis of email.
//                 { password: hashedPassword },  // update password
//                 { new: true }                  // return new updated password.
//             );

//             // send mail - Password Updated.
//             try {
//                 const emailResponse = await mailSender(
//                     updatedUserDetails.email,
//                     `Password Updated Successfully`,
//                     passwordUpdated(
//                         updatedUserDetails.email,
//                         updatedUserDetails.firstName
//                     )
//                 );
//                 // console.log(emailResponse);
//                 if (emailResponse && emailResponse.response) {
//                     console.log("Email sent successfully");
//                 } else {
//                     console.log("Email sent successfully, but no response received.");
//                 }
//                 console.log("Email sent successfully");
//             } catch (error) {
//                 // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
//                 console.error("Error occurred while sending email:", error);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error occurred while sending email",
//                     error: error.message,
//                 });
//             }

//             // return res
//             return res.status(200).json({
//                 success: true,
//                 message: "Password changed successfully.",
//             });
//         } else {
//             return res.status(401).json({
//                 success: false,
//                 message: "Incorrect current password.",
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Password can't be changed, issue in password change.",
//             error: error.message,
//         });
//     }
// };