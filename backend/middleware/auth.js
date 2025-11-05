// middleware/auth.js
import jwt from "jsonwebtoken";
import '../config/env.js';

// 🔒 Verify JWT token
export const auth = (req, res, next) => {
  try {
    let token = null;

    // Token sources: Header > Cookie > Body
    if (req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.body?.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach user info to request
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying token",
    });
  }
};

export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.accountType)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires role ${roles.join(" or ")}`,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "User role verification failed",
      });
    }
  };
};

export const isStudent = authorizeRole(["Student"]);
export const isInstructor = authorizeRole(["Instructor"]);
export const isAdmin = authorizeRole(["Admin"]);
