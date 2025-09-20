import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async (email, subject, body) => {
  try {
    // Debug environment variables
    console.log("🔍 SendGrid Debug Info:");
    console.log("API Key exists:", !!process.env.SENDGRID_API_KEY);
    console.log("From Email:", process.env.SENDGRID_FROM_EMAIL);
    
    // Validate required environment variables
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error("SENDGRID_FROM_EMAIL environment variable is not set");
    }

    // Set SendGrid API key for each request to ensure it's set
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Simplified from field
      subject: subject,
      html: body,
      // Anti-spam settings for better deliverability
      replyTo: process.env.SENDGRID_FROM_EMAIL,
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false
        }
      },
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      },
      // Custom headers to improve deliverability and avoid spam
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal'
      }
    };

    console.log("📧 Sending email with msg:", JSON.stringify(msg, null, 2));
    const info = await sgMail.send(msg);
    return { success: true, info };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    console.error("Full error:", error);
    return { success: false, error: error.message };
  }
};

export default mailSender;
