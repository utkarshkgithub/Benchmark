import '../config/env.js';
import nodemailer from 'nodemailer';

// Gmail SMTP Fallback Function
const sendViaGmail = async (email, title, body) => {
  
  console.log("📧 Using Gmail SMTP fallback...");
  const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  const info = await Promise.race([
    transporter.sendMail({
      from: `"Benchmark Codes" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gmail SMTP timeout after 15 seconds')), 15000)
    )
  ]);
  
  return {
    messageId: info.messageId,
    response: info.response,
    provider: 'gmail'
  };
};

export const mailSender = async (email, title, body) => {
  try {
    console.log("🔧 Mail configuration:");
    console.log("- MAILGUN_DOMAIN:", process.env.MAILGUN_DOMAIN ? "SET" : "NOT SET");
    console.log("- MAILGUN_API_KEY:", process.env.MAILGUN_API_KEY ? "SET" : "NOT SET");
    console.log("- EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
    
    // Input validation
    if (!email || !title || !body) {
      throw new Error("Missing required parameters: email, title, or body");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    
    // Check for Mailgun configuration
    if (!process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
      console.log("⚠️ Mailgun not configured, trying Gmail fallback...");
      
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Missing email configuration: Either set MAILGUN_DOMAIN & MAILGUN_API_KEY or EMAIL_USER & EMAIL_PASS");
      }
      
      return await sendViaGmail(email, title, body);
    }

    // Primary Method: Mailgun HTTP API (Best for Lambda)
    console.log("🚀 Using Mailgun HTTP API for email sending...");
    console.log(`📧 Sending email to: ${email}`);
    console.log(`📧 Subject: ${title}`);
    
    const mailgunUrl = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
    const fromEmail = process.env.EMAIL_USER || `postmaster@${process.env.MAILGUN_DOMAIN}`;
    
    // Prepare authentication
    const auth = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');
    
    // Create form data
    const formData = new URLSearchParams({
      from: `"Benchmark Codes" <${fromEmail}>`,
      to: email,
      subject: title,
      html: body,
      'h:Reply-To': fromEmail,
      'o:tracking': 'yes',
      'o:tracking-clicks': 'no',
      'o:tracking-opens': 'no'
    });

    console.log(`📡 Making request to: ${mailgunUrl}`);
    console.log(`📤 From: "Benchmark Codes" <${fromEmail}>`);

    // Make HTTP request with timeout
    const response = await Promise.race([
      fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Benchmark-Backend/1.0'
        },
        body: formData
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Mailgun API timeout after 10 seconds')), 10000)
      )
    ]);

    // Check response status
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`Mailgun API error: ${errorMessage}`);
    }

    // Parse successful response
    const result = await response.json();
    
    console.log("📨 Email sent via Mailgun successfully!");
    console.log("📨 Message ID:", result.id);
    console.log("📨 Message:", result.message);
    
    return {
      messageId: result.id,
      response: result.message,
      provider: 'mailgun'
    };

  } catch (error) {
    console.error("❌ Mail send failed:", error.message);
    console.error("❌ Full error:", error);
    console.error("❌ Error stack:", error.stack);
    
    // Re-throw the error so calling functions know it failed
    throw error;
  }
};
