import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const mailSender = async (email, subject, body) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: "IIIT Bhagalpur - Attendance System"
      },
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

    const info = await sgMail.send(msg);
    return { success: true, info };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

export default mailSender;
