import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import cookieParser from "cookie-parser";
dotenv.config();

export const auth= (req,res,next)=>{
    try{
        const token = req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null;

        
        if(!token){
            token = req.body.token || req?.cookies?.token
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }
     
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }


        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            req.user = decode;
            
        } catch(error){
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }catch(error){
        console.log(error);
        return res.status(401).json({
            error:error.message,
            success:false,
            message:'Something went wrong, while verifying the token.',
        });
    }
}

// isStudent 
export const isStudent = (req,res,next)=>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message: 'This is a protected routes for students.',
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User Role cannot be verified, please try again.'
        })
    }
}

 // isInstructor
export const isInstructor = (req,res,next)=>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message: 'this is a protected routes for Instructor only.',
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}


// isAdmin
export const isAdmin = (req,res,next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message: 'this is a protected routes for admin.',
            });
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again.',
        })
    }
}