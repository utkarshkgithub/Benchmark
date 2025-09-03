// security.js
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// // import Joi from "joi";

// export function applySecurity(app) {
//   // Secure HTTP headers
//   console.log("11//...")
//   app.use(helmet());
//     console.log("22....")
//   // Limit repeated requests (DDOS / brute-force se bachata hai)
//   const limiter = rateLimit({
    
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // per IP
//     message: "Too many requests from this IP, please try again later."
//   });
//   console.log("3333.....")
//   app.use(limiter);
//   console.log("4.....")
// }
