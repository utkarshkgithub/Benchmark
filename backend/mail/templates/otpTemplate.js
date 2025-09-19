export const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Account Verification - IIIT Bhagalpur</title>
    <style>
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        color: #333; 
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container { 
        max-width: 600px; 
        margin: 20px auto; 
        background: white;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .content {
        padding: 40px 30px;
        text-align: center;
      }
      .otp-box {
        background: #f8f9fa;
        border: 2px dashed #667eea;
        border-radius: 10px;
        padding: 20px;
        margin: 25px 0;
        display: inline-block;
      }
      .otp-code { 
        font-size: 32px; 
        font-weight: bold; 
        color: #667eea;
        letter-spacing: 5px;
        font-family: 'Courier New', monospace;
      }
      .institution {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .footer { 
        background: #f8f9fa;
        padding: 20px 30px;
        text-align: center;
        font-size: 12px; 
        color: #666;
        border-top: 1px solid #eee;
      }
      .warning {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 5px;
        padding: 15px;
        margin: 20px 0;
        color: #856404;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="institution">IIIT Bhagalpur</div>
        <div>Attendance Management System</div>
      </div>
      
      <div class="content">
        <h2 style="color: #333; margin-bottom: 20px;">Account Verification Required</h2>
        <p>Dear Student/Faculty,</p>
        <p>To complete your account verification, please use the following One-Time Password (OTP):</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong><br>
          • This OTP is valid for 5 minutes only<br>
          • Do not share this code with anyone<br>
          • If you didn't request this, please ignore this email
        </div>
        
        <p>Having trouble? Contact our support team for assistance.</p>
      </div>
      
      <div class="footer">
        <strong>IIIT Bhagalpur - Attendance Management System</strong><br>
        📧 Support: <a href="mailto:iiitbhbenchmark@gmail.com" style="color: #667eea;">iiitbhbenchmark@gmail.com</a><br>
        🌐 This is an automated email. Please do not reply to this message.<br><br>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
          © ${new Date().getFullYear()} Indian Institute of Information Technology Bhagalpur<br>
          This email was sent to verify your account in our attendance management system.
        </div>
      </div>
    </div>
  </body>
  </html>`;
};
