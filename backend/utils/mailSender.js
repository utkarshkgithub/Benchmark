import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async (email, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 1,
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 30000,     // 30 seconds
    });

    const mailOptions = {
      from: `Attendance Management of IIIT BHAGALPUR <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

export default mailSender;
