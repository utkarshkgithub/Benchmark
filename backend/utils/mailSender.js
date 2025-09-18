import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async (email, subject, body) => {
  // Validate email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not configured in environment variables");
  }

  console.log(`📧 Attempting to send email to: ${email}`);
  console.log(`📤 From: ${process.env.EMAIL_USER}`);

  // Multiple SMTP configurations to try
  const smtpConfigs = [
    {
      name: "Gmail SMTP (Port 587)",
      config: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      }
    },
    {
      name: "Gmail SMTP (Port 465)",
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      }
    },
    {
      name: "Gmail Service (Fallback)",
      config: {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      }
    }
  ];

  const mailOptions = {
    from: `"Attendance Management IIIT BHAGALPUR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: body,
  };

  // Try each configuration with retry logic
  for (let configIndex = 0; configIndex < smtpConfigs.length; configIndex++) {
    const { name, config } = smtpConfigs[configIndex];
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔄 Trying ${name} (Attempt ${attempt}/${2})`);
        
        const transporter = nodemailer.createTransport(config);

        // Quick connection test with shorter timeout
        console.log("� Verifying SMTP connection...");
        await Promise.race([
          transporter.verify(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection verification timeout')), 10000)
          )
        ]);
        console.log("✅ SMTP connection verified successfully");

        console.log("�📬 Sending email...");
        const info = await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email send timeout')), 15000)
          )
        ]);
        
        console.log("✅ Email sent successfully:", info.messageId);
        return { success: true, info, method: name };

      } catch (error) {
        console.log(`❌ ${name} (Attempt ${attempt}) failed:`, error.message);
        
        // If this is the last attempt with the last config, log detailed error
        if (configIndex === smtpConfigs.length - 1 && attempt === 2) {
          console.error("🔍 Final error details:", {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
          });
        }
        
        // Wait before retry (only if not the last attempt)
        if (attempt < 2) {
          console.log(`⏳ Waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  // If all methods failed
  const errorMsg = "All SMTP configurations failed after multiple attempts";
  console.error("❌ " + errorMsg);
  return { success: false, error: errorMsg };
};

export default mailSender;
