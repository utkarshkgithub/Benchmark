export const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>OTP Verification Email</title>
    <style>
      body { font-family: Arial, sans-serif; color: #333; }
      .container { max-width: 600px; margin: auto; text-align: center; }
      .message { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
      .highlight { font-size: 24px; font-weight: bold; color: #2e86de; }
      .support { font-size: 14px; color: #999; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="message">OTP Verification Email</div>
      <p>Dear User,</p>
      <p>Please use the following OTP to verify your account:</p>
      <h2 class="highlight">${otp}</h2>
      <p>This OTP is valid for 5 minutes.</p>
      <div class="support">
        If you did not request this, ignore this email.<br/>
        Need help? Contact <a href="mailto:iiitbhbenchmark@gmail.com">iiitbhbenchmark@gmail.com</a>.
      </div>
    </div>
  </body>
  </html>`;
};
