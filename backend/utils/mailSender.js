import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async (email, subject, body) => {
  try {
    // Validate email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured in environment variables");
    }

    console.log(`📧 Attempting to send email to: ${email}`);
    console.log(`📤 From: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      pool: true,
      maxConnections: 1,
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 30000,     // 30 seconds
    });

    // Verify connection configuration
    console.log("🔐 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    const mailOptions = {
      from: `"Attendance Management IIIT BHAGALPUR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: body,
    };

    console.log("📬 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    
    return { success: true, info };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    console.error("🔍 Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
};

export default mailSender;
